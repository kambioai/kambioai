-- 0005_seed_oficina_moto.sql — Dados de exemplo de uma oficina de moto
-- (CLAUDE.md §13.7): catálogo, 3 veículos, OS recentes, custos e taxas.
-- Roda via service role (sem usuário logado), então autor_id fica nulo.
-- Para VER esses dados no app, o usuário logado se vincula à oficina chamando
-- a função entrar_como_patrao_demo() (abaixo) — substituída pelo onboarding
-- real na Fase 7.

-- ===== Empresa de exemplo =====
insert into empresas (id, nome, segmento, cidade, plano, status_assinatura) values
  ('a0000001-0000-0000-0000-000000000001', 'Oficina do Zé Motos', 'oficina_moto', 'Goiânia', 'basico', 'ativa');

-- ===== Clientes =====
insert into clientes (id, nome, telefone, empresa_id) values
  ('c0000001-0000-0000-0000-000000000001', 'João',  '(62) 99111-1111', 'a0000001-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000002', 'Marcos','(62) 99222-2222', 'a0000001-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000003', 'Ana',   '(62) 99333-3333', 'a0000001-0000-0000-0000-000000000001');

-- ===== Veículos =====
insert into veiculos (id, placa, modelo, ano, cor, cliente_id, empresa_id) values
  ('b0000001-0000-0000-0000-000000000001', 'ABC1D23', 'Honda CG 160',      2021, 'Vermelha', 'c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000002', 'XYZ9K88', 'Yamaha Factor 125', 2019, 'Preta',    'c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000003', 'KLM5J67', 'Honda Biz 110',     2022, 'Azul',     'c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001');

-- ===== Catálogo (custo e preço em centavos) =====
insert into catalogo_itens (id, nome, tipo, custo, preco, estoque, estoque_minimo, empresa_id) values
  ('d0000001-0000-0000-0000-000000000001', 'Pastilha de freio', 'produto',  4000,  9000,  8, 4, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000002', 'Óleo 20W50',        'produto',  2200,  4500, 12, 6, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000003', 'Pneu 90/90-18',     'produto', 10000, 15000,  3, 4, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000004', 'Vela de ignição',   'produto',  1500,  3500, 20, 8, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000005', 'Kit relação',       'produto', 12000, 19000,  2, 3, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000006', 'Alinhamento',       'servico',     0,  6000,  0, 0, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000007', 'Troca de óleo',     'servico',     0,  3000,  0, 0, 'a0000001-0000-0000-0000-000000000001'),
  ('d0000001-0000-0000-0000-000000000008', 'Revisão geral',     'servico',     0, 12000,  0, 0, 'a0000001-0000-0000-0000-000000000001');

-- ===== Custos fixos (centavos) =====
insert into custos_fixos (nome, valor, empresa_id) values
  ('Aluguel',             180000, 'a0000001-0000-0000-0000-000000000001'),
  ('Funcionário (Carlos)',160000, 'a0000001-0000-0000-0000-000000000001'),
  ('Luz',                  32000, 'a0000001-0000-0000-0000-000000000001'),
  ('Internet',             12000, 'a0000001-0000-0000-0000-000000000001'),
  ('Contador',             25000, 'a0000001-0000-0000-0000-000000000001');

-- ===== Taxas da maquininha =====
insert into taxas_pagamento (forma, parcelas, percentual, empresa_id) values
  ('pix',      1, 0,   'a0000001-0000-0000-0000-000000000001'),
  ('dinheiro', 1, 0,   'a0000001-0000-0000-0000-000000000001'),
  ('debito',   1, 2,   'a0000001-0000-0000-0000-000000000001'),
  ('credito',  1, 3.5, 'a0000001-0000-0000-0000-000000000001');

-- ===== Ordens de serviço (últimos dias) =====
insert into ordens_servico (id, veiculo_id, cliente_id, status, total, custo_total, taxa, forma_pagamento, origem, empresa_id, criado_em) values
  ('e0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'entregue', 15000, 4000,   0, 'pix',     'manual', 'a0000001-0000-0000-0000-000000000001', now()),
  ('e0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000002', 'em_servico',   0,    0,   0, null,      'manual', 'a0000001-0000-0000-0000-000000000001', now()),
  ('e0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003', 'entregue',  7500, 2200, 262, 'credito', 'manual', 'a0000001-0000-0000-0000-000000000001', now() - interval '1 day');

insert into os_itens (os_id, item_id, descricao, quantidade, preco, custo, empresa_id) values
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001', 'Pastilha de freio', 1, 9000, 4000, 'a0000001-0000-0000-0000-000000000001'),
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000006', 'Alinhamento',       1, 6000,    0, 'a0000001-0000-0000-0000-000000000001'),
  ('e0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000008', 'Revisão geral',     1,12000,    0, 'a0000001-0000-0000-0000-000000000001'),
  ('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000002', 'Óleo 20W50',        1, 4500, 2200, 'a0000001-0000-0000-0000-000000000001'),
  ('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000007', 'Troca de óleo',     1, 3000,    0, 'a0000001-0000-0000-0000-000000000001');

-- ===== Vincular o usuário logado à oficina de exemplo (temporário, Fase 6) =====
-- Qualquer usuário logado pode "entrar" na oficina de exemplo como patrão (ou
-- funcionário) para testar o app com dados reais. Na Fase 7 isso vira o cadastro
-- real da empresa e dos convites.
create or replace function public.entrar_como_patrao_demo()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into membros (usuario_id, empresa_id, papel, ativo)
  values (auth.uid(), 'a0000001-0000-0000-0000-000000000001', 'patrao', true)
  on conflict (usuario_id, empresa_id)
  do update set papel = 'patrao', ativo = true;
end;
$$;

create or replace function public.entrar_como_funcionario_demo()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into membros (usuario_id, empresa_id, papel, ativo)
  values (auth.uid(), 'a0000001-0000-0000-0000-000000000001', 'funcionario', true)
  on conflict (usuario_id, empresa_id)
  do update set papel = 'funcionario', ativo = true;
end;
$$;

grant execute on function public.entrar_como_patrao_demo() to authenticated;
grant execute on function public.entrar_como_funcionario_demo() to authenticated;
