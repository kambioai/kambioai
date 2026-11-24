-- 0011_grants_convites.sql — Conserta o acesso da service role à tabela
-- `convites` (criada na 0010). O grant "on all tables" da 0006 só vale para as
-- tabelas que existiam naquele momento; tabelas novas precisam do grant próprio.
-- Sem isto, a leitura pública do convite (aceitar por link, via service role)
-- dava "permission denied" e caía em "Convite indisponível".

grant select, insert, update, delete on convites to service_role;
