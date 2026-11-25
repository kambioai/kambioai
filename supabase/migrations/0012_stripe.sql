-- 0012_stripe.sql — Fase 11: cobrança com Stripe.
-- A `empresas` já tem `plano`, `status_assinatura` e `stripe_customer_id`.
-- Falta guardar a assinatura e o começo da inadimplência (para a régua de
-- cobrança derivar o nível de acesso sem depender de cron).

alter table empresas add column if not exists stripe_subscription_id text;
alter table empresas add column if not exists inadimplente_desde timestamptz;

-- Índice para o webhook achar a empresa pela assinatura/cliente do Stripe.
create index if not exists idx_empresas_stripe_customer on empresas(stripe_customer_id);
create index if not exists idx_empresas_stripe_sub on empresas(stripe_subscription_id);
