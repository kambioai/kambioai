import "server-only";

import { criarClienteServico } from "@/lib/supabase/service";

// Leitura pública do convite: quem abre o link ainda NÃO está logado, então a
// RLS não entrega nada. Usamos a service role (só no servidor) para mostrar de
// qual oficina é o convite e validar token/validade. Não expõe nada sensível.

export interface ConvitePublico {
  valido: boolean;
  motivo?: "nao_encontrado" | "usado" | "expirado";
  nome?: string;
  email?: string | null;
  empresaNome?: string;
}

export async function lerConvitePublico(token: string): Promise<ConvitePublico> {
  if (!token || token.length < 10) return { valido: false, motivo: "nao_encontrado" };

  const admin = criarClienteServico();
  const { data } = await admin
    .from("convites")
    .select("nome, email, usado, expira_em, empresas(nome)")
    .eq("token", token)
    .maybeSingle();

  if (!data) return { valido: false, motivo: "nao_encontrado" };
  if (data.usado) return { valido: false, motivo: "usado" };
  if (new Date(data.expira_em).getTime() < Date.now())
    return { valido: false, motivo: "expirado" };

  const emp = data.empresas as { nome: string } | { nome: string }[] | null;
  const empresaNome = Array.isArray(emp) ? emp[0]?.nome : emp?.nome;

  return {
    valido: true,
    nome: data.nome,
    email: data.email,
    empresaNome: empresaNome ?? "a oficina",
  };
}
