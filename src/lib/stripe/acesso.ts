// Régua de cobrança (CLAUDE.md §7), como função PURA e testável. O nível de
// acesso é DERIVADO do status + desde quando está inadimplente — assim funciona
// sem depender de cron (o cron da Fase 12 só manda os avisos).
//
// aviso no vencimento → lembrete em 3 dias → só leitura em 7 → bloqueio em 15.

export type StatusAssinatura =
  | "ativa"
  | "teste"
  | "inadimplente"
  | "bloqueada"
  | "cancelada";

export type NivelAcesso = "completo" | "leitura" | "bloqueado";

export const DIAS_SO_LEITURA = 7;
export const DIAS_BLOQUEIO = 15;

const MS_DIA = 86_400_000;

export function diasDeInadimplencia(
  inadimplenteDesde: string | null,
  agora: Date = new Date(),
): number {
  if (!inadimplenteDesde) return 0;
  const t = new Date(inadimplenteDesde).getTime();
  if (Number.isNaN(t)) return 0;
  return Math.floor((agora.getTime() - t) / MS_DIA);
}

export function nivelAcesso(
  status: StatusAssinatura,
  inadimplenteDesde: string | null,
  agora: Date = new Date(),
): NivelAcesso {
  if (status === "bloqueada" || status === "cancelada") return "bloqueado";
  if (status === "ativa" || status === "teste") return "completo";

  // inadimplente: escalona pelo tempo.
  const dias = diasDeInadimplencia(inadimplenteDesde, agora);
  if (dias >= DIAS_BLOQUEIO) return "bloqueado";
  if (dias >= DIAS_SO_LEITURA) return "leitura";
  return "completo";
}

/** Mensagem curta pro aviso na tela, conforme a fase da régua. */
export function avisoCobranca(
  status: StatusAssinatura,
  inadimplenteDesde: string | null,
  agora: Date = new Date(),
): string | null {
  if (status === "bloqueada" || status === "cancelada") {
    return "Sua assinatura está bloqueada. Regularize para voltar a usar o Kambio.";
  }
  if (status !== "inadimplente") return null;
  const dias = diasDeInadimplencia(inadimplenteDesde, agora);
  if (dias >= DIAS_BLOQUEIO) {
    return "Pagamento em atraso: acesso bloqueado. Atualize o cartão para liberar.";
  }
  if (dias >= DIAS_SO_LEITURA) {
    return "Pagamento em atraso: conta em modo leitura. Atualize o cartão para voltar a lançar.";
  }
  return "Não conseguimos cobrar sua assinatura. Atualize o cartão para não perder o acesso.";
}
