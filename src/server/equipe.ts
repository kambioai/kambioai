"use server";

import { randomBytes } from "node:crypto";

import { z } from "zod";

import { sincronizarAssinaturaFuncionarios } from "@/server/assinatura";
import { enviarEmail, urlApp } from "@/lib/email/cliente";
import { EmailConvite } from "@/lib/email/templates/convite";
import { criarClienteServidor } from "@/lib/supabase/server";

// Escrita da equipe (CLAUDE.md §3, §11): tudo no SERVIDOR, sob RLS. As policies
// de `convites` e `membros` só liberam o PATRÃO da empresa — a tela é a segunda
// barreira, não a única. O "aceitar convite" fica numa rota à parte (service
// role), porque quem aceita ainda não é membro.

type Resultado<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; erro: string };

async function empresaDoUsuario(
  sb: Awaited<ReturnType<typeof criarClienteServidor>>,
): Promise<string | null> {
  const { data } = await sb.from("empresas").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

const conviteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do funcionário."),
  email: z
    .string()
    .email("E-mail inválido.")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
});

/** Cria um convite e devolve o token para montar o link copiável. */
export async function criarConvite(
  entrada: z.infer<typeof conviteSchema>,
): Promise<Resultado<{ token: string }>> {
  const parsed = conviteSchema.safeParse(entrada);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const sb = await criarClienteServidor();
  const empresaId = await empresaDoUsuario(sb);
  if (!empresaId) return { ok: false, erro: "Oficina não encontrada." };

  const {
    data: { user },
  } = await sb.auth.getUser();

  const token = randomBytes(24).toString("base64url");

  const { error } = await sb.from("convites").insert({
    empresa_id: empresaId,
    token,
    nome: parsed.data.nome.trim(),
    email: parsed.data.email ?? null,
    papel: "funcionario",
    criado_por: user?.id ?? null,
  });
  if (error) return { ok: false, erro: "Não consegui criar o convite." };

  // Se veio e-mail, manda o convite (best-effort: o link copiável é o plano B).
  if (parsed.data.email) {
    const { data: emp } = await sb
      .from("empresas")
      .select("nome")
      .eq("id", empresaId)
      .maybeSingle();
    await enviarEmail({
      to: parsed.data.email,
      subject: `${emp?.nome ?? "Sua oficina"} te convidou para o Kambio`,
      react: EmailConvite({
        nome: parsed.data.nome.trim(),
        oficina: emp?.nome ?? "a oficina",
        link: urlApp(`/convite/${token}`),
      }),
    });
  }

  return { ok: true, token };
}

/** Cancela um convite ainda não usado. */
export async function cancelarConvite(id: string): Promise<Resultado> {
  if (!z.string().uuid().safeParse(id).success)
    return { ok: false, erro: "Convite inválido." };

  const sb = await criarClienteServidor();
  const { error } = await sb.from("convites").delete().eq("id", id).eq("usado", false);
  if (error) return { ok: false, erro: "Não consegui cancelar o convite." };
  return { ok: true };
}

/** Liga/desliga o acesso de um funcionário (desativar corta o acesso na hora). */
export async function definirAtivoFuncionario(
  membroId: string,
  ativo: boolean,
): Promise<Resultado> {
  if (!z.string().uuid().safeParse(membroId).success)
    return { ok: false, erro: "Funcionário inválido." };

  const sb = await criarClienteServidor();
  // A RLS só deixa o patrão alterar `membros` da própria empresa; e a policy
  // impede mexer em quem é patrão (papel = funcionario no filtro).
  const { data: atualizado, error } = await sb
    .from("membros")
    .update({ ativo })
    .eq("id", membroId)
    .eq("papel", "funcionario")
    .select("empresa_id")
    .maybeSingle();
  if (error) return { ok: false, erro: "Não consegui atualizar o funcionário." };

  // Ativar/desativar muda a conta da assinatura (Básico↔PRO e adicionais).
  if (atualizado?.empresa_id) {
    await sincronizarAssinaturaFuncionarios(atualizado.empresa_id);
  }
  return { ok: true };
}
