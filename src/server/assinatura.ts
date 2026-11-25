"use server";

import { headers } from "next/headers";

import { membroAtual } from "@/lib/permissoes";
import { obterStripe } from "@/lib/stripe/cliente";
import {
  itensAssinatura,
  planoPorFuncionarios,
} from "@/lib/stripe/planos";
import { criarClienteServidor } from "@/lib/supabase/server";
import { criarClienteServico } from "@/lib/supabase/service";

// Cobrança (CLAUDE.md §7). Tudo no SERVIDOR: cria cliente/checkout/portal no
// Stripe e sincroniza a assinatura com o nº de funcionários. A ativação de
// verdade acontece pelo WEBHOOK (rota separada), nunca aqui.

type Resultado<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; erro: string };

async function baseUrl(): Promise<string> {
  const h = await headers();
  const origem = h.get("origin");
  if (origem) return origem;
  const host = h.get("host");
  if (host) return `https://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function contarFuncionariosAtivos(
  sb: Awaited<ReturnType<typeof criarClienteServidor>>,
  empresaId: string,
): Promise<number> {
  const { count } = await sb
    .from("membros")
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", empresaId)
    .eq("papel", "funcionario")
    .eq("ativo", true);
  return count ?? 0;
}

/** Abre o Checkout do Stripe para assinar (só o patrão). */
export async function criarAssinatura(): Promise<Resultado<{ url: string }>> {
  const membro = await membroAtual();
  if (!membro || membro.papel !== "patrao") {
    return { ok: false, erro: "Só o dono pode assinar." };
  }

  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("id, nome, stripe_customer_id")
    .eq("id", membro.empresaId)
    .maybeSingle();
  if (!emp) return { ok: false, erro: "Oficina não encontrada." };

  const {
    data: { user },
  } = await sb.auth.getUser();

  let stripe;
  try {
    stripe = obterStripe();
  } catch {
    return { ok: false, erro: "Pagamento indisponível no momento." };
  }

  // Garante um cliente no Stripe para a empresa.
  let customerId = emp.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: emp.nome,
      email: user?.email ?? undefined,
      metadata: { empresa_id: emp.id },
    });
    customerId = customer.id;
    await criarClienteServico()
      .from("empresas")
      .update({ stripe_customer_id: customerId })
      .eq("id", emp.id);
  }

  const ativos = await contarFuncionariosAtivos(sb, emp.id);
  const itens = itensAssinatura(ativos);
  if (itens.length === 0) {
    return { ok: false, erro: "Planos ainda não configurados. Fale com o suporte." };
  }

  const url = await baseUrl();
  // Assinatura é só cartão (Stripe BR não faz Pix recorrente). Em modo
  // subscription o Checkout já usa cartão; os métodos ativos vêm do Dashboard.
  const sessao = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: itens,
    success_url: `${url}/patrao/conta?assinatura=ok`,
    cancel_url: `${url}/patrao/conta?assinatura=cancelada`,
    metadata: { empresa_id: emp.id },
    subscription_data: { metadata: { empresa_id: emp.id } },
  });

  if (!sessao.url) return { ok: false, erro: "Não consegui abrir o pagamento." };
  return { ok: true, url: sessao.url };
}

/** Abre o portal do cliente do Stripe (trocar cartão, cancelar, ver faturas). */
export async function abrirPortal(): Promise<Resultado<{ url: string }>> {
  const membro = await membroAtual();
  if (!membro || membro.papel !== "patrao") {
    return { ok: false, erro: "Só o dono pode gerenciar a assinatura." };
  }

  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("stripe_customer_id")
    .eq("id", membro.empresaId)
    .maybeSingle();
  if (!emp?.stripe_customer_id) {
    return { ok: false, erro: "Você ainda não tem uma assinatura ativa." };
  }

  let stripe;
  try {
    stripe = obterStripe();
  } catch {
    return { ok: false, erro: "Pagamento indisponível no momento." };
  }

  const url = await baseUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: emp.stripe_customer_id,
    return_url: `${url}/patrao/conta`,
  });
  return { ok: true, url: portal.url };
}

/**
 * Sincroniza a assinatura com o nº de funcionários ativos (Básico↔PRO e
 * adicionais). Chamada quando um funcionário é ativado/desativado ou aceita o
 * convite. Sem assinatura (ainda em teste) ou sem Stripe configurado, não faz
 * nada — não pode quebrar o fluxo da equipe.
 */
export async function sincronizarAssinaturaFuncionarios(
  empresaId: string,
): Promise<void> {
  const service = criarClienteServico();
  const { data: emp } = await service
    .from("empresas")
    .select("id, stripe_subscription_id")
    .eq("id", empresaId)
    .maybeSingle();
  if (!emp?.stripe_subscription_id) return;

  let stripe;
  try {
    stripe = obterStripe();
  } catch {
    return;
  }

  const { count } = await service
    .from("membros")
    .select("id", { count: "exact", head: true })
    .eq("empresa_id", empresaId)
    .eq("papel", "funcionario")
    .eq("ativo", true);
  const ativos = count ?? 0;

  const alvo = itensAssinatura(ativos);
  if (alvo.length === 0) return;

  const sub = await stripe.subscriptions.retrieve(emp.stripe_subscription_id);
  const alvoPorPreco = new Map(alvo.map((i) => [i.price, i.quantity]));

  const updates: {
    id?: string;
    price?: string;
    quantity?: number;
    deleted?: boolean;
  }[] = [];

  // Ajusta/zera os itens existentes.
  for (const it of sub.items.data) {
    const precoId = it.price.id;
    if (alvoPorPreco.has(precoId)) {
      updates.push({ id: it.id, quantity: alvoPorPreco.get(precoId) });
      alvoPorPreco.delete(precoId);
    } else {
      updates.push({ id: it.id, deleted: true });
    }
  }
  // Adiciona os que faltam.
  for (const [price, quantity] of alvoPorPreco) {
    updates.push({ price, quantity });
  }

  await stripe.subscriptions.update(emp.stripe_subscription_id, {
    items: updates,
    proration_behavior: "create_prorations",
  });

  await service
    .from("empresas")
    .update({ plano: planoPorFuncionarios(ativos) })
    .eq("id", empresaId);
}
