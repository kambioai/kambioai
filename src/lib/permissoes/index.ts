import { criarClienteServidor } from "@/lib/supabase/server";
import type { Papel } from "@/types";

/**
 * Checagem de permissão no SERVIDOR (CLAUDE.md §13.2): a RLS já isola no banco,
 * aqui repetimos para rotear telas. Devolve o vínculo ATIVO do usuário logado —
 * ou null quando ele não está logado ou foi desativado (acesso cortado na hora).
 */
export interface MembroAtual {
  empresaId: string;
  papel: Papel;
  nome: string | null;
}

export async function membroAtual(): Promise<MembroAtual | null> {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("membros")
    .select("empresa_id, papel, nome")
    .eq("usuario_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!data) return null;
  return { empresaId: data.empresa_id, papel: data.papel, nome: data.nome };
}
