-- 0010_equipe.sql — Fase 10: equipe e permissões do funcionário.
-- Convite por link (sem e-mail — Resend entra na Fase 14), nome/e-mail do membro,
-- e aperto das permissões do funcionário (só corrige os PRÓPRIOS lançamentos).

-- ===== Nome e e-mail do membro =====
-- Antes o nome do funcionário não existia no banco (vinha "—" na tela).
alter table membros add column if not exists nome text;
alter table membros add column if not exists email text;

-- ===== Convites (link de convite do funcionário) =====
-- O patrão gera um convite e copia o link; o funcionário abre o link, cria a
-- senha e entra. O "aceitar" roda com service role (fura a RLS) numa rota de
-- servidor, porque quem aceita ainda NÃO é membro da empresa.
create table convites (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  token text not null unique,
  nome text not null,
  email text,
  papel papel not null default 'funcionario',
  usado boolean not null default false,
  usado_por uuid references auth.users(id) on delete set null,
  usado_em timestamptz,
  expira_em timestamptz not null default (now() + interval '7 days'),
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index idx_convites_empresa on convites(empresa_id);
create index idx_convites_token on convites(token);

alter table convites enable row level security;
grant select, insert, update, delete on convites to authenticated;

-- Só o patrão da empresa cria, lê e cancela os convites dela.
create policy convites_patrao on convites for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));

-- ===== Funcionário corrige só os PRÓPRIOS lançamentos (CLAUDE.md §11) =====
-- Antes qualquer membro podia alterar qualquer OS da empresa. Agora: o patrão
-- altera tudo; o funcionário só altera a OS que ele mesmo lançou. (A regra de
-- dia fechado continua no gatilho bloquear_dia_fechado, migração 0004.)
drop policy if exists os_update_membro on ordens_servico;
create policy os_update on ordens_servico for update
  using (
    e_patrao(empresa_id)
    or (e_membro(empresa_id) and autor_id = auth.uid())
  )
  with check (
    e_patrao(empresa_id)
    or (e_membro(empresa_id) and autor_id = auth.uid())
  );
