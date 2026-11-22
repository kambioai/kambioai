-- 0008_remove_storage_notas.sql — Remove o upload de foto da nota/tabela.
-- Decisão de produto (Fase 7): o catálogo se completa digitando (agora) e por
-- voz (Fase 8). A leitura de foto por IA foi tirada do MVP, então o bucket e as
-- policies criados na 0007 não são mais usados.

drop policy if exists "notas_catalogo_insert" on storage.objects;
drop policy if exists "notas_catalogo_select" on storage.objects;
drop policy if exists "notas_catalogo_delete" on storage.objects;

-- O bucket em si não pode ser apagado por SQL (o Supabase bloqueia). Ele foi
-- removido pela API de Storage (service role), fora da migração.
