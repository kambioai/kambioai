import { createClient } from "@supabase/supabase-js";

import "server-only";

import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase com a SERVICE ROLE (chave secreta). Fura a RLS — use só em
 * código de servidor confiável (webhooks, tarefas administrativas, testes,
 * seed/onboarding), NUNCA para montar tela de usuário (CLAUDE.md §3, princípio 1).
 * O import "server-only" garante que isso nunca vá parar no bundle do navegador.
 */
export function criarClienteServico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) {
    throw new Error(
      "Supabase service role não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient<Database>(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
