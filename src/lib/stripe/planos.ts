import type Stripe from "stripe";

// Planos do Kambio (CLAUDE.md §7). Os PRICE IDs vêm do ambiente (criados no
// painel do Stripe ou pelo script scripts/stripe-setup.mjs). Preços em centavos
// só para exibição — o valor cobrado é o do Stripe.

export type Plano = "basico" | "pro";

export const PRECOS = {
  basico: 12990,
  pro: 17990,
  funcionarioAdicional: 2990,
} as const;

export function priceBasico(): string | undefined {
  return process.env.STRIPE_PRICE_BASICO;
}
export function pricePro(): string | undefined {
  return process.env.STRIPE_PRICE_PRO;
}
export function priceFuncionario(): string | undefined {
  return process.env.STRIPE_PRICE_FUNCIONARIO;
}

/**
 * Monta os itens da assinatura a partir do nº de funcionários ATIVOS
 * (CLAUDE.md §7):
 * - 0 funcionários → Básico;
 * - ≥1 funcionário → PRO (2 inclusos) + adicionais = max(0, ativos − 2).
 */
export function planoPorFuncionarios(ativos: number): Plano {
  return ativos >= 1 ? "pro" : "basico";
}

export function adicionaisPorFuncionarios(ativos: number): number {
  return Math.max(0, ativos - 2);
}

export interface ItemAssinatura {
  price: string;
  quantity: number;
}

/** Itens de linha da assinatura para um dado nº de funcionários ativos. */
export function itensAssinatura(ativos: number): ItemAssinatura[] {
  const plano = planoPorFuncionarios(ativos);
  const itens: ItemAssinatura[] = [];

  if (plano === "basico") {
    const p = priceBasico();
    if (p) itens.push({ price: p, quantity: 1 });
    return itens;
  }

  const pPro = pricePro();
  if (pPro) itens.push({ price: pPro, quantity: 1 });

  const adicionais = adicionaisPorFuncionarios(ativos);
  const pAdd = priceFuncionario();
  if (adicionais > 0 && pAdd) itens.push({ price: pAdd, quantity: adicionais });

  return itens;
}

/** Descobre o plano a partir dos itens de uma assinatura do Stripe. */
export function planoDaAssinatura(sub: Stripe.Subscription): Plano {
  const temPro = sub.items.data.some(
    (i) => i.price.id === pricePro(),
  );
  return temPro ? "pro" : "basico";
}
