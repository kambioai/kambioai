import "server-only";

import Stripe from "stripe";

// Cliente Stripe — SÓ no servidor (a chave secreta nunca vai ao navegador,
// CLAUDE.md §2/§3). Instanciado sob demanda para o build não quebrar quando a
// chave ainda não está definida no ambiente.

let _stripe: Stripe | null = null;

export function obterStripe(): Stripe {
  if (_stripe) return _stripe;
  const chave = process.env.STRIPE_SECRET_KEY;
  if (!chave) {
    throw new Error(
      "Stripe não configurado: defina STRIPE_SECRET_KEY no ambiente do servidor.",
    );
  }
  _stripe = new Stripe(chave);
  return _stripe;
}

/** Diz se o Stripe está configurado (para a tela mostrar o estado certo). */
export function stripeConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
