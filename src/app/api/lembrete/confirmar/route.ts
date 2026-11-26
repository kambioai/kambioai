import { NextResponse } from "next/server";
import { z } from "zod";

import { garantirEscrita } from "@/lib/permissoes";
import { normalizarPlaca, placaValida } from "@/lib/placa";
import { criarClienteServidor } from "@/lib/supabase/server";

// POST /api/lembrete/confirmar — grava um lembrete (voz ou digitado), depois do
// cartão de confirmação (CLAUDE.md §7: nada salva sem confirmar). O cron de
// lembretes (/api/cron/lembretes) dispara o push quando a hora chegar.

const schema = z.object({
  texto: z.string().min(1).max(500),
  quandoISO: z.string().datetime(),
  placa: z.string().nullable().default(null),
});

export async function POST(req: Request) {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const bloqueio = await garantirEscrita();
  if (!bloqueio.ok) {
    return NextResponse.json({ erro: bloqueio.erro }, { status: 402 });
  }

  const corpo = await req.json().catch(() => null);
  const parsed = schema.safeParse(corpo);
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

  // Liga ao veículo se a placa veio e existe (não cria veículo só por lembrete).
  let veiculoId: string | null = null;
  if (parsed.data.placa && placaValida(parsed.data.placa)) {
    const { data: v } = await sb
      .from("veiculos")
      .select("id")
      .ilike("placa", normalizarPlaca(parsed.data.placa))
      .limit(1)
      .maybeSingle();
    veiculoId = v?.id ?? null;
  }

  const { error } = await sb.from("lembretes").insert({
    texto: parsed.data.texto.trim(),
    data_hora: parsed.data.quandoISO,
    veiculo_id: veiculoId,
    tipo: "manual",
    empresa_id: membro.empresa_id,
  });
  if (error) {
    return NextResponse.json(
      { erro: "Não consegui salvar o lembrete." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
