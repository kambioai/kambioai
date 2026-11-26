-- 0013_lembretes_push.sql — Fase 12 (lembretes, push e crons).
--
-- A tabela `lembretes` já existe (0001) com RLS (0002); `push_inscricoes` também.
-- Aqui só classificamos o lembrete por origem/tipo, para:
--   - mostrar no painel com o rótulo certo (retorno de cliente x aviso de falta);
--   - deduplicar o retorno de cliente gerado pelo cron diário (um por ciclo).
--
-- Nada de grant novo: `lembretes` nasceu na 0001 e já está coberta pelo
-- grant da 0006 (all tables in schema public -> service_role). Coluna nova numa
-- tabela já concedida continua acessível.

alter table lembretes
  add column if not exists tipo text not null default 'manual';

comment on column lembretes.tipo is
  'Origem do lembrete: manual (voz/digitado pelo patrão), retorno (cron de retorno de cliente), falta (funcionário avisou falta de estoque).';

-- Índice para o cron diário encontrar rápido o último retorno por veículo
-- (dedupe) e para listar lembretes pendentes de um veículo.
create index if not exists idx_lembretes_veiculo_tipo
  on lembretes(veiculo_id, tipo)
  where veiculo_id is not null;
