-- 0015_excluir_empresa.sql — Fase 14 (LGPD: excluir dados de uma oficina).
--
-- Exclusão definitiva dos dados de uma empresa. Precisa ser uma FUNÇÃO porque a
-- ordem importa: os triggers de auditoria (ordens_servico/despesas/catalogo_itens)
-- inserem em `auditoria` referenciando a empresa. Se apagássemos a empresa direto,
-- o CASCADE apagaria essas tabelas e o trigger tentaria gravar auditoria de uma
-- empresa já em remoção → viola a FK. Então apagamos as filhas com a empresa ainda
-- viva, limpamos a auditoria, e só então a empresa (o CASCADE cuida do resto).
--
-- SECURITY DEFINER (fura a RLS), então a função CHECA a permissão por dentro:
-- só o patrão ativo da própria empresa, ou um admin do SaaS.

create or replace function excluir_empresa(p_empresa_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
        select 1 from membros
        where empresa_id = p_empresa_id
          and usuario_id = auth.uid()
          and papel = 'patrao'
          and ativo = true
      )
     and not exists (
        select 1 from admins where usuario_id = auth.uid()
      )
  then
    raise exception 'Sem permissão para excluir esta empresa.';
  end if;

  -- Filhas com trigger de auditoria primeiro (empresa ainda existe).
  delete from ordens_servico where empresa_id = p_empresa_id;  -- cascata os_itens
  delete from despesas       where empresa_id = p_empresa_id;
  delete from catalogo_itens where empresa_id = p_empresa_id;  -- cascata movimentos_estoque
  -- Limpa a auditoria antes de remover a empresa.
  delete from auditoria      where empresa_id = p_empresa_id;
  -- E a empresa (CASCADE remove clientes, veículos, custos, taxas, fechamentos,
  -- lembretes, push, convites, membros, uso_ia, suporte/chamados ligados a ela).
  delete from empresas where id = p_empresa_id;
end;
$$;

grant execute on function excluir_empresa(uuid) to authenticated;
