import { NextResponse } from "next/server";
import { z } from "zod";

import { criarClienteServidor } from "@/lib/supabase/server";

// POST /api/push/inscrever — grava a inscrição de push deste aparelho.
// DELETE — remove a inscrição (ao desligar os avisos).
// Roda sob RLS com a sessão do usuário: a policy `push_propria` só deixa cada
// pessoa mexer na própria inscrição, dentro da empresa dela.

const inscricaoSchema = z.object({
  endpoint: z.string().url(),
  chaves: z.object({ p256dh: z.string(), auth: z.string() }),
});

export async function POST(req: Request) {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const corpo = await req.json().catch(() => null);
  const parsed = inscricaoSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const { data: membro } = await sb
    .from("membros")
    .select("empresa_id")
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  if (!membro) {
    return NextResponse.json({ erro: "Sem vínculo com oficina." }, { status: 403 });
  }

  const { error } = await sb.from("push_inscricoes").upsert(
    {
      usuario_id: user.id,
      empresa_id: membro.empresa_id,
      endpoint: parsed.data.endpoint,
      chaves: parsed.data.chaves,
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    return NextResponse.json(
      { erro: "Não consegui ativar os avisos." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}

const remocaoSchema = z.object({ endpoint: z.string().url() });

export async function DELETE(req: Request) {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const corpo = await req.json().catch(() => null);
  const parsed = remocaoSchema.safeParse(corpo);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  await sb.from("push_inscricoes").delete().eq("endpoint", parsed.data.endpoint);
  return NextResponse.json({ ok: true });
}
