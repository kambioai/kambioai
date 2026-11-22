-- 0003_views_funcionario.sql — Views do funcionário (CLAUDE.md §4).
-- O funcionário acessa catálogo, OS e itens por estas views, que NÃO têm as
-- colunas de dinheiro (custo, custo_total, taxa). Nas tabelas-base, o SELECT é
-- só do patrão (migração 0002), então o funcionário é obrigado a passar por aqui.
--
-- As views são SECURITY DEFINER (security_invoker = false): rodam com o dono
-- (contornam a RLS das tabelas-base, que é só-patrão). O isolamento por empresa
-- é refeito DENTRO da view, pelo WHERE com empresas_do_usuario() — então cada
-- funcionário só vê a própria oficina, e nunca uma coluna de dinheiro.

-- ===== Catálogo do funcionário: preço de venda e estoque, SEM custo =====
create view vw_catalogo_funcionario
with (security_invoker = false) as
  select
    id, nome, tipo, preco, estoque, estoque_minimo, dias_para_retorno,
    empresa_id, criado_em, atualizado_em
  from catalogo_itens
  where empresa_id in (select empresas_do_usuario());

-- ===== OS do funcionário: status e dados do serviço, SEM total/custo/taxa =====
create view vw_ordens_funcionario
with (security_invoker = false) as
  select
    id, veiculo_id, cliente_id, status, forma_pagamento, parcelas,
    autor_id, origem, empresa_id, criado_em, atualizado_em
  from ordens_servico
  where empresa_id in (select empresas_do_usuario());

-- ===== Itens da OS do funcionário: preço de venda, SEM custo =====
create view vw_os_itens_funcionario
with (security_invoker = false) as
  select
    id, os_id, item_id, descricao, quantidade, preco, empresa_id, criado_em
  from os_itens
  where empresa_id in (select empresas_do_usuario());

-- O funcionário (e o patrão) podem ler as views; o anônimo, não.
grant select on vw_catalogo_funcionario to authenticated;
grant select on vw_ordens_funcionario to authenticated;
grant select on vw_os_itens_funcionario to authenticated;
