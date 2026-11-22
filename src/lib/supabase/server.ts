import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase para o SERVIDOR (Server Components, Route Handlers, Server
 * Actions). Lê a sessão dos cookies e passa pela RLS com a identidade do
 * usuário logado — nunca com a service role (CLAUDE.md §3, princípio 1).
 */
export async function criarClienteServidor() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const cookieStore = await cookies();
  return createServerClient<Database>(url, chave, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Em Server Components puros não dá para escrever cookies; o middleware
        // cuida da renovação da sessão. Por isso o try/catch silencioso.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // chamado de um Server Component — ignorar.
        }
      },
    },
  });
}
