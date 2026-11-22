import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Descobre para onde mandar o usuário depois do login, pelo papel dele na
 * empresa (lido de `membros`, sob RLS — só retorna a própria associação).
 * Patrão → Painel; funcionário → Pátio.
 */
export async function rotaPorPapel(sb: SupabaseClient): Promise<string> {
  const { data } = await sb
    .from("membros")
    .select("papel")
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  return data?.papel === "funcionario"
    ? "/funcionario/patio"
    : "/patrao/painel";
}
