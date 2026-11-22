import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Apoio para os testes de integração contra o Supabase real.
// Não é um arquivo de teste (não termina em .test.ts).

export const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Só roda os testes de integração quando as chaves do Supabase existem. */
export const temSupabase = Boolean(URL && ANON && SERVICE);

const SENHA = "senha-de-teste-123";

export function admin(): SupabaseClient {
  return createClient(URL ?? "", SERVICE ?? "", {
    auth: { persistSession: false },
  });
}

export function anonimo(): SupabaseClient {
  return createClient(URL ?? "", ANON ?? "", {
    auth: { persistSession: false },
  });
}

/** Cria um usuário confirmado e já devolve um cliente logado como ele. */
export async function criarUsuarioLogado(
  email: string,
): Promise<{ id: string; sb: SupabaseClient }> {
  const a = admin();
  const { data, error } = await a.auth.admin.createUser({
    email,
    password: SENHA,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error("createUser: " + error?.message);
  const sb = anonimo();
  const { error: eLogin } = await sb.auth.signInWithPassword({
    email,
    password: SENHA,
  });
  if (eLogin) throw new Error("signIn: " + eLogin.message);
  return { id: data.user.id, sb };
}

/**
 * Cria uma empresa com um membro (patrão ou funcionário) e um item de catálogo.
 * Usa a service role (fura a RLS) só para montar o cenário do teste.
 */
export async function criarEmpresaComUsuario(opts: {
  nomeEmpresa: string;
  email: string;
  papel: "patrao" | "funcionario";
  nomeItem: string;
  custo: number;
  preco: number;
}): Promise<{ empresaId: string; userId: string; itemId: string; sb: SupabaseClient }> {
  const a = admin();
  const { id, sb } = await criarUsuarioLogado(opts.email);

  const { data: emp, error: eEmp } = await a
    .from("empresas")
    .insert({ nome: opts.nomeEmpresa, segmento: "oficina_moto" })
    .select("id")
    .single();
  if (eEmp || !emp) throw new Error("insert empresa: " + eEmp?.message);

  const { error: eMem } = await a.from("membros").insert({
    usuario_id: id,
    empresa_id: emp.id,
    papel: opts.papel,
    ativo: true,
  });
  if (eMem) throw new Error("insert membro: " + eMem.message);

  const { data: item, error: eItem } = await a
    .from("catalogo_itens")
    .insert({
      nome: opts.nomeItem,
      tipo: "produto",
      custo: opts.custo,
      preco: opts.preco,
      estoque: 10,
      estoque_minimo: 2,
      empresa_id: emp.id,
    })
    .select("id")
    .single();
  if (eItem || !item) throw new Error("insert item: " + eItem?.message);

  return { empresaId: emp.id, userId: id, itemId: item.id, sb };
}

/** Remove empresas (cascata apaga catálogo/membros) e usuários criados. */
export async function limpar(empresaIds: string[], userIds: string[]) {
  const a = admin();
  for (const id of empresaIds) await a.from("empresas").delete().eq("id", id);
  for (const id of userIds) await a.auth.admin.deleteUser(id);
}
