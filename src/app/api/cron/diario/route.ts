import { NextResponse } from "next/server";

import { cronAutorizado } from "@/lib/cron/guarda";
import { processarDiario } from "@/server/notificacoes";

export const runtime = "nodejs";

// Diário (CLAUDE.md §8): retorno de cliente (troca de óleo/revisão) + régua de
// cobrança (aviso de pagamento em atraso).
export async function GET(req: Request) {
  if (!cronAutorizado(req)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  const r = await processarDiario();
  return NextResponse.json({ ok: true, ...r });
}
