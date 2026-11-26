import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Descobre para onde mandar o usuário depois do login.
 * Admin do SaaS → painel admin; patrão → Painel; funcionário → Pátio.
 * Tudo lido sob RLS (admins_self / própria associação em membros).
 */
export async function rotaPorPapel(sb: SupabaseClient): Promise<string> {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (user) {
    const { data: adm } = await sb
      .from("admins")
      .select("usuario_id")
      .eq("usuario_id", user.id)
      .maybeSingle();
    if (adm) return "/admin/visao-geral";
  }

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
