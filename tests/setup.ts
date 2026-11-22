import { existsSync } from "node:fs";

// Carrega o .env.local (URL + chaves do Supabase) para os testes de integração.
// Node 20.12+/22+ têm process.loadEnvFile.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}
