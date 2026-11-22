-- 0007_onboarding.sql — Cadastro da empresa e onboarding real (Fase 7).
-- Cada conta nova cria a PRÓPRIA oficina (empresa + membro patrão), configura o
-- catálogo/estoque/custos/taxas e só então libera o uso pleno.

-- ===== Estado de progresso do onboarding =====
alter table empresas
  add column onboarding_completo boolean not null default false;

-- A oficina de exemplo (seed) já está pronta — não força onboarding em quem
-- entrou nela durante a Fase 6.
update empresas set onboarding_completo = true
  where id = 'a0000001-0000-0000-0000-000000000001';

-- ===== Criar empresa + vincular o patrão, de forma atômica =====
-- A primeira linha de `membros` não poderia ser inserida pela RLS (o usuário
-- ainda não é patrão de nada). Esta função SECURITY DEFINER resolve isso: cria
-- a empresa e já vincula quem chamou como patrão. Idempotente: se a pessoa já
-- tem empresa, devolve a existente em vez de criar outra.
create or replace function public.criar_empresa_onboarding(
  p_nome text,
  p_cidade text,
  p_segmento segmento
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select empresa_id into v_id
  from membros
  where usuario_id = auth.uid() and ativo = true
  limit 1;
  if v_id is not null then
    return v_id;
  end if;

  insert into empresas (nome, cidade, segmento)
  values (p_nome, p_cidade, p_segmento)
  returning id into v_id;

  insert into membros (usuario_id, empresa_id, papel, ativo)
  values (auth.uid(), v_id, 'patrao', true);

  return v_id;
end;
$$;

grant execute on function public.criar_empresa_onboarding(text, text, segmento)
  to authenticated;

-- ===== Storage: fotos de tabela de preços / nota do fornecedor =====
-- Upload na Fase 7; a IA interpreta na Fase 8. Bucket privado; cada oficina só
-- mexe nos arquivos dentro da própria pasta (prefixo = empresa_id).
insert into storage.buckets (id, name, public)
values ('notas-catalogo', 'notas-catalogo', false)
on conflict (id) do nothing;

create policy "notas_catalogo_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'notas-catalogo'
    and (storage.foldername(name))[1] in (select empresas_do_usuario()::text)
  );

create policy "notas_catalogo_select" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'notas-catalogo'
    and (storage.foldername(name))[1] in (select empresas_do_usuario()::text)
  );

create policy "notas_catalogo_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'notas-catalogo'
    and (storage.foldername(name))[1] in (select empresas_do_usuario()::text)
  );
