-- 0006_grants_service_role.sql — Acesso da service role às tabelas/views.
-- Como o projeto está com "Grant API access automatically" DESLIGADO, nenhuma
-- role ganha privilégio automático. A migração 0002 já abriu o acesso ao
-- `authenticated` (o app roda assim, sob RLS). Aqui abrimos para `service_role`,
-- usado só em código de servidor confiável (testes, seed, webhooks) — ele fura a
-- RLS e precisa dos privilégios de tabela. NUNCA é usado para montar tela.

grant select, insert, update, delete on all tables in schema public to service_role;
grant select on
  vw_catalogo_funcionario,
  vw_ordens_funcionario,
  vw_os_itens_funcionario
  to service_role;
