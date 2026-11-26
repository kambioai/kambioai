import { NextResponse } from "next/server";

import { cronAutorizado } from "@/lib/cron/guarda";
import { processarLembretes } from "@/server/notificacoes";

export const runtime = "nodejs";

// A cada 5 min (CLAUDE.md §8): dispara os lembretes vencidos por push.
export async function GET(req: Request) {
  if (!cronAutorizado(req)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }
  const r = await processarLembretes();
  return NextResponse.json({ ok: true, ...r });
}
