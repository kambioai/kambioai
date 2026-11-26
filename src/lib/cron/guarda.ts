import "server-only";

// Protege as rotas /api/cron/*. A Vercel Cron manda o header
// `Authorization: Bearer <CRON_SECRET>` automaticamente quando CRON_SECRET está
// definido no projeto. Sem o segredo configurado, recusa tudo (não roda solto).
export function cronAutorizado(req: Request): boolean {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  return req.headers.get("authorization") === `Bearer ${segredo}`;
}
