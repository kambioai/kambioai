-- 0002_rls.sql — Row Level Security (CLAUDE.md §4). O isolamento por empresa
-- mora AQUI, no banco, não na tela. Cada pessoa só enxerga as linhas da(s)
-- empresa(s) de que é membro ativo. Colunas de dinheiro ficam invisíveis ao
-- funcionário: ele lê as tabelas de dinheiro por VIEWS sem essas colunas
-- (migração 0003); nas tabelas-base, o SELECT é só do patrão.

-- ===== Funções auxiliares (SECURITY DEFINER para não recorrer na RLS de membros) =====
create or replace function public.empresas_do_usuario()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select empresa_id from membros
  where usuario_id = auth.uid() and ativo = true
$$;

create or replace function public.e_patrao(emp uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from membros
    where usuario_id = auth.uid()
      and empresa_id = emp
      and papel = 'patrao'
      and ativo = true
  )
$$;

create or replace function public.e_membro(emp uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from membros
    where usuario_id = auth.uid()
      and empresa_id = emp
      and ativo = true
  )
$$;

-- As funções auxiliares podem ser chamadas pelo usuário logado.
grant execute on function public.empresas_do_usuario() to authenticated;
grant execute on function public.e_patrao(uuid) to authenticated;
grant execute on function public.e_membro(uuid) to authenticated;

-- ===== Privilégios de tabela =====
-- "Grant API access automatically" está DESLIGADO no projeto: concedemos o
-- acesso na mão. Nada para o anônimo (só gente logada). A RLS abaixo é quem
-- filtra linha a linha; os privilégios só abrem a porta para a role.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

-- ===== Liga a RLS em TODAS as tabelas =====
alter table empresas            enable row level security;
alter table membros             enable row level security;
alter table clientes            enable row level security;
alter table veiculos            enable row level security;
alter table catalogo_itens      enable row level security;
alter table ordens_servico      enable row level security;
alter table os_itens            enable row level security;
alter table movimentos_estoque  enable row level security;
alter table despesas            enable row level security;
alter table custos_fixos        enable row level security;
alter table taxas_pagamento     enable row level security;
alter table fechamentos         enable row level security;
alter table lembretes           enable row level security;
alter table push_inscricoes     enable row level security;
alter table auditoria           enable row level security;
alter table uso_ia              enable row level security;

-- ===== empresas =====
create policy empresas_select on empresas for select
  using (id in (select empresas_do_usuario()));
create policy empresas_insert on empresas for insert
  with check (auth.uid() is not null);              -- cria no onboarding (Fase 7)
create policy empresas_update on empresas for update
  using (e_patrao(id)) with check (e_patrao(id));

-- ===== membros =====
create policy membros_select on membros for select
  using (empresa_id in (select empresas_do_usuario()));
create policy membros_patrao_escreve on membros for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));

-- ===== clientes (funcionário pode ler/registrar) =====
create policy clientes_select on clientes for select
  using (e_membro(empresa_id));
create policy clientes_insert on clientes for insert
  with check (e_membro(empresa_id));
create policy clientes_update on clientes for update
  using (e_membro(empresa_id)) with check (e_membro(empresa_id));
create policy clientes_delete on clientes for delete
  using (e_patrao(empresa_id));                      -- funcionário não exclui

-- ===== veiculos (funcionário pode ler/registrar) =====
create policy veiculos_select on veiculos for select
  using (e_membro(empresa_id));
create policy veiculos_insert on veiculos for insert
  with check (e_membro(empresa_id));
create policy veiculos_update on veiculos for update
  using (e_membro(empresa_id)) with check (e_membro(empresa_id));
create policy veiculos_delete on veiculos for delete
  using (e_patrao(empresa_id));

-- ===== catalogo_itens (DINHEIRO: só patrão lê a tabela-base) =====
-- Funcionário lê por vw_catalogo_funcionario (sem custo) — migração 0003.
create policy catalogo_select_patrao on catalogo_itens for select
  using (e_patrao(empresa_id));
create policy catalogo_escreve_patrao on catalogo_itens for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));

-- ===== ordens_servico (DINHEIRO na tabela-base: só patrão lê) =====
-- Funcionário lê por vw_ordens_funcionario (sem total/custo/taxa) — 0003.
create policy os_select_patrao on ordens_servico for select
  using (e_patrao(empresa_id));
create policy os_insert_membro on ordens_servico for insert
  with check (e_membro(empresa_id));
create policy os_update_membro on ordens_servico for update
  using (e_membro(empresa_id)) with check (e_membro(empresa_id));
create policy os_delete_patrao on ordens_servico for delete
  using (e_patrao(empresa_id));

-- ===== os_itens (DINHEIRO na base: só patrão lê) =====
create policy os_itens_select_patrao on os_itens for select
  using (e_patrao(empresa_id));
create policy os_itens_insert_membro on os_itens for insert
  with check (e_membro(empresa_id));
create policy os_itens_update_membro on os_itens for update
  using (e_membro(empresa_id)) with check (e_membro(empresa_id));
create policy os_itens_delete_patrao on os_itens for delete
  using (e_patrao(empresa_id));

-- ===== movimentos_estoque (funcionário registra venda; ajuste é do patrão) =====
create policy mov_select_patrao on movimentos_estoque for select
  using (e_patrao(empresa_id));
create policy mov_insert_membro on movimentos_estoque for insert
  with check (e_membro(empresa_id));

-- ===== despesas (SÓ O PATRÃO — CLAUDE.md §15) =====
create policy despesas_patrao on despesas for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));

-- ===== custos_fixos / taxas_pagamento (só patrão) =====
create policy custos_patrao on custos_fixos for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));
create policy taxas_patrao on taxas_pagamento for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));

-- ===== fechamentos (membro lê; só patrão escreve/fecha o dia) =====
create policy fechamentos_select on fechamentos for select
  using (e_membro(empresa_id));
create policy fechamentos_patrao on fechamentos for all
  using (e_patrao(empresa_id)) with check (e_patrao(empresa_id));

-- ===== lembretes (membro lê/cria) =====
create policy lembretes_select on lembretes for select
  using (e_membro(empresa_id));
create policy lembretes_insert on lembretes for insert
  with check (e_membro(empresa_id));
create policy lembretes_update on lembretes for update
  using (e_membro(empresa_id)) with check (e_membro(empresa_id));
create policy lembretes_delete on lembretes for delete
  using (e_patrao(empresa_id));

-- ===== push_inscricoes (cada um gerencia a própria) =====
create policy push_propria on push_inscricoes for all
  using (usuario_id = auth.uid() and e_membro(empresa_id))
  with check (usuario_id = auth.uid() and e_membro(empresa_id));

-- ===== auditoria (DINHEIRO/histórico: só patrão lê) =====
create policy auditoria_select_patrao on auditoria for select
  using (e_patrao(empresa_id));

-- ===== uso_ia (só patrão lê) =====
create policy uso_ia_select_patrao on uso_ia for select
  using (e_patrao(empresa_id));
