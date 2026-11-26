-- 0014_admin.sql — Fase 13 (painel admin real).
--
-- O admin é o DONO DO SAAS (CLAUDE.md §1/§11), não é membro de nenhuma oficina.
-- Ele enxerga várias empresas — isso NÃO passa por RLS de empresa: o código do
-- admin usa a service role, sempre atrás da checagem `ehAdmin()`. Os dados da
-- oficina ele só vê em MODO SUPORTE (somente leitura, registrado — LGPD).
--
-- Grants: projeto com "Grant API access automatically" DESLIGADO. A 0006 cobriu
-- as tabelas que existiam então; as novas precisam de grant explícito. Damos
-- acesso à service_role (código admin) e, só na `admins`, SELECT ao authenticated
-- (para o usuário confirmar que é admin lendo a própria linha).

-- ===== admins =====
create table if not exists admins (
  usuario_id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  criado_em timestamptz not null default now()
);
alter table admins enable row level security;
-- cada um lê só a PRÓPRIA linha (confirma que é admin). Ninguém insere/edita
-- pelo app — admin é criado no banco (service role).
create policy admins_self on admins for select
  using (usuario_id = auth.uid());

-- ===== suporte_acessos (log do modo suporte — LGPD) =====
create table if not exists suporte_acessos (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  motivo text not null,
  criado_em timestamptz not null default now()
);
alter table suporte_acessos enable row level security;
create index if not exists idx_suporte_empresa on suporte_acessos(empresa_id);
-- sem policy para authenticated: só a service role (código admin) acessa.

-- ===== comunicados (avisos do admin às oficinas) =====
create table if not exists comunicados (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  corpo text not null,
  publico text not null default 'todas',   -- 'todas' | 'basico' | 'pro' | <segmento>
  status text not null default 'rascunho',  -- 'rascunho' | 'enviado'
  alcance int not null default 0,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now(),
  enviado_em timestamptz
);
alter table comunicados enable row level security;
-- só a service role (admin).

-- ===== cupons (listados no admin; aplicação no Stripe fica para depois) =====
create table if not exists cupons (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  descricao text not null,
  percentual int,            -- desconto em %
  meses int,                 -- duração (null = recorrente/sem validade)
  validade date,             -- null = sem validade
  usos int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table cupons enable row level security;

-- ===== chamados (suporte das oficinas; a abertura pelo app vem depois) =====
create table if not exists chamados (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  assunto text not null,
  status text not null default 'aberto',      -- aberto | respondido | fechado
  prioridade text not null default 'normal',  -- alta | normal | baixa
  criado_em timestamptz not null default now()
);
alter table chamados enable row level security;
create index if not exists idx_chamados_status on chamados(status);

-- ===== grants para a service role (código admin) =====
grant select, insert, update, delete on
  admins, suporte_acessos, comunicados, cupons, chamados
  to service_role;
-- authenticated só precisa ler a própria linha de `admins` (policy acima).
grant select on admins to authenticated;
