import { NextResponse } from "next/server";

import { cronAutorizado } from "@/lib/cron/guarda";
import { processarResumoDia } from "@/server/notificacoes";

export const runtime = "nodejs";

// 18h (Brasília): resumo do dia + "Feche o caixa" + aviso de estoque mínimo.
export async function GET(req: Request) {
  if (!cronAutorizado(req)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  const r = await processarResumoDia();
  return NextResponse.json({ ok: true, ...r });
}
