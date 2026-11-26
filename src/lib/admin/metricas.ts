import type { StatusAssinatura } from "@/lib/stripe/acesso";
import { PRECOS, type Plano } from "@/lib/stripe/planos";

// Métricas do painel admin (PURO, testável — sem banco). Dinheiro em centavos.
// MRR = o que a oficina paga por mês, e só conta quando a assinatura está ATIVA
// (teste/inadimplente/bloqueada/cancelada não entram na receita realizada).

export function mrrEmpresaCentavos(
  plano: Plano,
  status: StatusAssinatura,
  funcionariosAtivos: number,
): number {
  if (status !== "ativa") return 0;
  if (plano === "basico") return PRECOS.basico;
  const adicionais = Math.max(0, funcionariosAtivos - 2);
  return PRECOS.pro + adicionais * PRECOS.funcionarioAdicional;
}

/** Fração de OS em que o patrão corrigiu o cartão da IA (0..1). */
export function taxaCorrecao(corrigidas: number, total: number): number {
  return total > 0 ? corrigidas / total : 0;
}
