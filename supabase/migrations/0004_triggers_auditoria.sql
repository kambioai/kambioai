-- 0004_triggers_auditoria.sql — Invariantes garantidas pelo BANCO (CLAUDE.md §5).
-- Não dependem da tela: valem para qualquer caminho de escrita.

-- ===== Auditoria: toda alteração/exclusão vira linha em auditoria =====
-- (ordens_servico, despesas, catalogo_itens — CLAUDE.md §5 invariante 3)
create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    insert into auditoria (tabela, registro_id, antes, depois, autor_id, empresa_id)
    values (tg_table_name, old.id, to_jsonb(old), null, auth.uid(), old.empresa_id);
    return old;
  elsif tg_op = 'INSERT' then
    insert into auditoria (tabela, registro_id, antes, depois, autor_id, empresa_id)
    values (tg_table_name, new.id, null, to_jsonb(new), auth.uid(), new.empresa_id);
    return new;
  else
    insert into auditoria (tabela, registro_id, antes, depois, autor_id, empresa_id)
    values (tg_table_name, new.id, to_jsonb(old), to_jsonb(new), auth.uid(), new.empresa_id);
    return new;
  end if;
end;
$$;

create trigger trg_auditoria_os
  after insert or update or delete on ordens_servico
  for each row execute function public.registrar_auditoria();
create trigger trg_auditoria_despesas
  after insert or update or delete on despesas
  for each row execute function public.registrar_auditoria();
create trigger trg_auditoria_catalogo
  after insert or update or delete on catalogo_itens
  for each row execute function public.registrar_auditoria();

-- ===== Dia fechado: só o patrão altera lançamento de dia já fechado =====
-- (CLAUDE.md §5 invariante 4)
create or replace function public.bloquear_dia_fechado()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  dia date;
begin
  dia := (old.criado_em at time zone 'America/Sao_Paulo')::date;
  if exists (
    select 1 from fechamentos f
    where f.empresa_id = old.empresa_id and f.data = dia
  ) and not e_patrao(old.empresa_id) then
    raise exception 'Dia % já fechado: só o patrão pode alterar este lançamento.', dia
      using errcode = 'check_violation';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger trg_dia_fechado_os
  before update or delete on ordens_servico
  for each row execute function public.bloquear_dia_fechado();
create trigger trg_dia_fechado_despesas
  before update or delete on despesas
  for each row execute function public.bloquear_dia_fechado();

-- ===== Preço do funcionário é sempre o do catálogo =====
-- (CLAUDE.md §5 invariante 5) O servidor ignora valor "falado" pelo funcionário:
-- quando quem lança NÃO é patrão e o item vem do catálogo, preço e custo são
-- sobrescritos pelos valores oficiais do catálogo.
create or replace function public.forcar_preco_catalogo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c_preco bigint;
  c_custo bigint;
begin
  if new.item_id is not null and not e_patrao(new.empresa_id) then
    select preco, custo into c_preco, c_custo
    from catalogo_itens where id = new.item_id;
    if found then
      new.preco := c_preco;
      new.custo := c_custo;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_preco_catalogo
  before insert or update on os_itens
  for each row execute function public.forcar_preco_catalogo();
