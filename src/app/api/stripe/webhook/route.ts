import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { obterStripe } from "@/lib/stripe/cliente";
import { planoDaAssinatura } from "@/lib/stripe/planos";
import { criarClienteServico } from "@/lib/supabase/service";
import type { Database } from "@/types/supabase";

// Webhook do Stripe (CLAUDE.md §7). SEMPRE verifica a assinatura antes de mudar
// status. Roda com service role (não há usuário logado). Precisa do corpo cru.
export const runtime = "nodejs";

type AtualizacaoEmpresa = Database["public"]["Tables"]["empresas"]["Update"];

async function acharEmpresaId(
  service: ReturnType<typeof criarClienteServico>,
  customerId: string | null | undefined,
  metaEmpresaId: string | null | undefined,
): Promise<string | null> {
  if (metaEmpresaId) return metaEmpresaId;
  if (!customerId) return null;
  const { data } = await service
    .from("empresas")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

async function aplicar(
  service: ReturnType<typeof criarClienteServico>,
  empresaId: string,
  campos: AtualizacaoEmpresa,
): Promise<void> {
  await service.from("empresas").update(campos).eq("id", empresaId);
}

export async function POST(req: Request) {
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Webhook não configurado." }, { status: 500 });
  }

  const assinatura = req.headers.get("stripe-signature");
  if (!assinatura) {
    return NextResponse.json({ erro: "Sem assinatura." }, { status: 400 });
  }

  const corpo = await req.text();

  let evento: Stripe.Event;
  try {
    evento = obterStripe().webhooks.constructEvent(corpo, assinatura, segredo);
  } catch {
    // Assinatura inválida → nunca muda nada.
    return NextResponse.json({ erro: "Assinatura inválida." }, { status: 400 });
  }

  const service = criarClienteServico();

  switch (evento.type) {
    case "checkout.session.completed": {
      const s = evento.data.object as Stripe.Checkout.Session;
      const empresaId = await acharEmpresaId(
        service,
        typeof s.customer === "string" ? s.customer : s.customer?.id,
        s.metadata?.empresa_id,
      );
      if (empresaId && s.subscription) {
        const subId =
          typeof s.subscription === "string" ? s.subscription : s.subscription.id;
        const sub = await obterStripe().subscriptions.retrieve(subId);
        await aplicar(service, empresaId, {
          status_assinatura: "ativa",
          plano: planoDaAssinatura(sub),
          stripe_subscription_id: sub.id,
          stripe_customer_id:
            typeof sub.customer === "string" ? sub.customer : sub.customer.id,
          inadimplente_desde: null,
        });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = evento.data.object as Stripe.Subscription;
      const empresaId = await acharEmpresaId(
        service,
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        sub.metadata?.empresa_id,
      );
      if (empresaId) {
        const campos: AtualizacaoEmpresa = {
          plano: planoDaAssinatura(sub),
          stripe_subscription_id: sub.id,
        };
        if (sub.status === "active" || sub.status === "trialing") {
          campos.status_assinatura = "ativa";
          campos.inadimplente_desde = null;
        } else if (sub.status === "past_due" || sub.status === "unpaid") {
          campos.status_assinatura = "inadimplente";
        } else if (sub.status === "canceled") {
          campos.status_assinatura = "cancelada";
        }
        await aplicar(service, empresaId, campos);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = evento.data.object as Stripe.Subscription;
      const empresaId = await acharEmpresaId(
        service,
        typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        sub.metadata?.empresa_id,
      );
      if (empresaId) {
        await aplicar(service, empresaId, { status_assinatura: "cancelada" });
      }
      break;
    }

    case "invoice.paid": {
      const inv = evento.data.object as Stripe.Invoice;
      const empresaId = await acharEmpresaId(
        service,
        typeof inv.customer === "string" ? inv.customer : inv.customer?.id,
        inv.metadata?.empresa_id,
      );
      if (empresaId) {
        await aplicar(service, empresaId, {
          status_assinatura: "ativa",
          inadimplente_desde: null,
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const inv = evento.data.object as Stripe.Invoice;
      const empresaId = await acharEmpresaId(
        service,
        typeof inv.customer === "string" ? inv.customer : inv.customer?.id,
        inv.metadata?.empresa_id,
      );
      if (empresaId) {
        // Marca o começo da inadimplência só se ainda não estava marcada
        // (a régua conta os dias a partir daí).
        const { data: atual } = await service
          .from("empresas")
          .select("inadimplente_desde")
          .eq("id", empresaId)
          .maybeSingle();
        await aplicar(service, empresaId, {
          status_assinatura: "inadimplente",
          inadimplente_desde:
            atual?.inadimplente_desde ?? new Date().toISOString(),
        });
      }
      break;
    }

    default:
      // Ignora os demais eventos.
      break;
  }

  return NextResponse.json({ recebido: true });
}
