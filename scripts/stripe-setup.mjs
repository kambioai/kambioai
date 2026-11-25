// scripts/stripe-setup.mjs — cria os produtos/preços do Kambio no Stripe.
// Roda UMA vez por conta Stripe (modo teste ou produção). Uso:
//   node scripts/stripe-setup.mjs
// Precisa de STRIPE_SECRET_KEY no .env.local. No fim, imprime os PRICE IDs para
// você colar no .env.local e na Vercel.

import { existsSync } from "node:fs";
import Stripe from "stripe";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const chave = process.env.STRIPE_SECRET_KEY;
if (!chave) {
  console.error("Defina STRIPE_SECRET_KEY no .env.local antes de rodar.");
  process.exit(1);
}

const stripe = new Stripe(chave);

const PLANOS = [
  { nome: "Kambio Básico", valor: 12990, env: "STRIPE_PRICE_BASICO" },
  { nome: "Kambio PRO", valor: 17990, env: "STRIPE_PRICE_PRO" },
  { nome: "Funcionário adicional", valor: 2990, env: "STRIPE_PRICE_FUNCIONARIO" },
];

async function acharOuCriarPreco({ nome, valor }) {
  // Reusa o produto se já existir um com o mesmo nome (evita duplicar ao rodar de novo).
  const produtos = await stripe.products.search({ query: `name:'${nome}'` });
  let produto = produtos.data[0];
  if (!produto) produto = await stripe.products.create({ name: nome });

  const precos = await stripe.prices.list({ product: produto.id, active: true });
  const existente = precos.data.find(
    (p) => p.unit_amount === valor && p.currency === "brl" && p.recurring?.interval === "month",
  );
  if (existente) return existente.id;

  const preco = await stripe.prices.create({
    product: produto.id,
    unit_amount: valor,
    currency: "brl",
    recurring: { interval: "month" },
  });
  return preco.id;
}

const linhas = [];
for (const plano of PLANOS) {
  const id = await acharOuCriarPreco(plano);
  linhas.push(`${plano.env}=${id}`);
  console.log(`✓ ${plano.nome}: ${id}`);
}

console.log("\nCole no .env.local (e na Vercel):\n");
console.log(linhas.join("\n"));
