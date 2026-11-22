-- 0009_registrar_os.sql — Gravação transacional da OS (CLAUDE.md §5 invariante 2).
-- OS + itens + baixa de estoque + movimento = uma única transação. Ou tudo
-- grava, ou nada. Os VALORES já vêm calculados pelo servidor (a IA nunca calcula).
-- SECURITY DEFINER para poder baixar estoque mesmo quando quem registra é
-- funcionário (que não pode alterar catálogo direto) — mas valida que o autor é
-- membro da empresa. A linha de auditoria da OS sai pelo trigger existente.

create or replace function public.registrar_os(
  p_empresa_id uuid,
  p_veiculo_id uuid,
  p_cliente_id uuid,
  p_status status_os,
  p_total bigint,
  p_custo_total bigint,
  p_taxa bigint,
  p_forma_pagamento forma_pagamento,
  p_parcelas int,
  p_origem origem_lancamento,
  p_transcricao text,
  p_itens jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_os_id uuid;
  v_item jsonb;
  v_item_id uuid;
  v_qtd int;
  v_tipo tipo_item;
begin
  if not e_membro(p_empresa_id) then
    raise exception 'Sem acesso a esta empresa.'
      using errcode = 'insufficient_privilege';
  end if;

  insert into ordens_servico (
    veiculo_id, cliente_id, status, total, custo_total, taxa,
    forma_pagamento, parcelas, autor_id, origem, transcricao, empresa_id
  ) values (
    p_veiculo_id, p_cliente_id, p_status, p_total, p_custo_total, p_taxa,
    p_forma_pagamento, p_parcelas, auth.uid(), p_origem, p_transcricao, p_empresa_id
  )
  returning id into v_os_id;

  for v_item in select * from jsonb_array_elements(p_itens)
  loop
    v_item_id := nullif(v_item->>'item_id', '')::uuid;
    v_qtd := coalesce((v_item->>'quantidade')::int, 1);

    insert into os_itens (os_id, item_id, descricao, quantidade, preco, custo, empresa_id)
    values (
      v_os_id, v_item_id, v_item->>'descricao', v_qtd,
      coalesce((v_item->>'preco')::bigint, 0),
      coalesce((v_item->>'custo')::bigint, 0),
      p_empresa_id
    );

    -- Baixa de estoque só para PRODUTO do catálogo.
    if v_item_id is not null then
      select tipo into v_tipo from catalogo_itens where id = v_item_id;
      if v_tipo = 'produto' then
        update catalogo_itens set estoque = estoque - v_qtd where id = v_item_id;
        insert into movimentos_estoque (item_id, quantidade, motivo, autor_id, empresa_id)
        values (v_item_id, -v_qtd, 'venda', auth.uid(), p_empresa_id);
      end if;
    end if;
  end loop;

  return v_os_id;
end;
$$;

grant execute on function public.registrar_os(
  uuid, uuid, uuid, status_os, bigint, bigint, bigint,
  forma_pagamento, int, origem_lancamento, text, jsonb
) to authenticated;
