import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/supabase";

/**
 * Cliente Supabase para o NAVEGADOR (Client Components).
 * Usa só as chaves públicas (URL + publishable/anon). Toda proteção de dados
 * vem da RLS no banco — por isso é seguro no navegador (CLAUDE.md §3).
 *
 * Importante: as variáveis NEXT_PUBLIC_* precisam ser lidas de forma literal
 * para o Next inlinar no bundle do navegador.
 */
export function criarClienteNavegador() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient<Database>(url, chave);
}
