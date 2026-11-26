// Utilitários de data/hora no fuso America/Sao_Paulo (CLAUDE.md §5/§13).
// Puro (sem server-only): usado no servidor e em componentes.

const fmtQuando = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** "qua 26/11 09:00" — rótulo curto de um instante, em horário de São Paulo. */
export function formatarQuando(iso: string): string {
  return fmtQuando.format(new Date(iso)).replace(",", "");
}
