import { NextResponse } from "next/server";
import { z } from "zod";

import { sincronizarAssinaturaFuncionarios } from "@/server/assinatura";
import { criarClienteServico } from "@/lib/supabase/service";

// Aceitar convite (Fase 10). Quem aceita ainda NÃO é membro de nenhuma empresa,
// então a RLS não ajudaria: esta rota roda com SERVICE ROLE (só no servidor),
// valida o token, cria o login e vincula o funcionário à empresa do convite.

export const runtime = "nodejs";

const entradaSchema = z.object({
  token: z.string().min(10, "Convite inválido."),
  nome: z.string().min(2, "Digite seu nome."),
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(6, "A senha precisa de pelo menos 6 caracteres."),
});

export async function POST(req: Request) {
  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }

  const parsed = entradaSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 },
    );
  }
  const { token, nome, email, senha } = parsed.data;

  const admin = criarClienteServico();

  // 1) Convite válido, não usado e não expirado.
  const { data: convite } = await admin
    .from("convites")
    .select("id, empresa_id, papel, usado, expira_em")
    .eq("token", token)
    .maybeSingle();

  if (!convite || convite.usado) {
    return NextResponse.json(
      { ok: false, erro: "Este convite não é mais válido." },
      { status: 400 },
    );
  }
  if (new Date(convite.expira_em).getTime() < Date.now()) {
    return NextResponse.json(
      { ok: false, erro: "Este convite expirou. Peça um novo ao patrão." },
      { status: 400 },
    );
  }

  // 2) Cria o login já confirmado (sem e-mail — Resend entra na Fase 14).
  const { data: criado, error: erroUser } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  });
  if (erroUser || !criado.user) {
    const jaExiste = erroUser?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      {
        ok: false,
        erro: jaExiste
          ? "Já existe uma conta com esse e-mail. Entre com ela."
          : "Não consegui criar sua conta. Tente de novo.",
      },
      { status: 400 },
    );
  }
  const usuarioId = criado.user.id;

  // 3) Vincula como membro da empresa do convite.
  const { error: erroMembro } = await admin.from("membros").insert({
    usuario_id: usuarioId,
    empresa_id: convite.empresa_id,
    papel: convite.papel,
    nome,
    email,
    ativo: true,
  });
  if (erroMembro) {
    // Desfaz o usuário criado para não deixar conta órfã.
    await admin.auth.admin.deleteUser(usuarioId);
    return NextResponse.json(
      { ok: false, erro: "Não consegui entrar na equipe. Tente de novo." },
      { status: 400 },
    );
  }

  // 4) Marca o convite como usado.
  await admin
    .from("convites")
    .update({ usado: true, usado_por: usuarioId, usado_em: new Date().toISOString() })
    .eq("id", convite.id);

  // 5) Mais um funcionário ativo → ajusta a assinatura (Básico→PRO/adicionais).
  await sincronizarAssinaturaFuncionarios(convite.empresa_id);

  return NextResponse.json({ ok: true });
}
