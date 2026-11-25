import Stripe from "stripe";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  avisoCobranca,
  nivelAcesso,
} from "@/lib/stripe/acesso";
import { admin, temSupabase } from "./apoio-supabase";

// Teste mínimo exigido (CLAUDE.md §13): webhooks do Stripe. Duas partes:
// 1) régua de cobrança como função pura (sempre roda);
// 2) a rota de webhook: verifica a assinatura e muda o status da empresa.

const WEBHOOK_SECRET = "whsec_teste_kambio_123";

function diasAtras(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

describe("régua de cobrança (função pura)", () => {
  it("ativa e teste têm acesso completo", () => {
    expect(nivelAcesso("ativa", null)).toBe("completo");
    expect(nivelAcesso("teste", null)).toBe("completo");
  });

  it("inadimplente escalona: aviso → leitura (7d) → bloqueio (15d)", () => {
    expect(nivelAcesso("inadimplente", diasAtras(1))).toBe("completo");
    expect(nivelAcesso("inadimplente", diasAtras(7))).toBe("leitura");
    expect(nivelAcesso("inadimplente", diasAtras(15))).toBe("bloqueado");
  });

  it("bloqueada e cancelada são sempre bloqueio", () => {
    expect(nivelAcesso("bloqueada", null)).toBe("bloqueado");
    expect(nivelAcesso("cancelada", null)).toBe("bloqueado");
  });

  it("dá aviso quando inadimplente e nenhum quando em dia", () => {
    expect(avisoCobranca("ativa", null)).toBeNull();
    expect(avisoCobranca("inadimplente", diasAtras(1))).toBeTruthy();
  });
});

const d = temSupabase ? describe : describe.skip;

d("webhook do Stripe (assinatura + status)", () => {
  const empresas: string[] = [];
  let customerId = "";
  let stripe: Stripe;

  beforeAll(() => {
    // Chaves de teste: o constructEvent é só HMAC local, não chama a API.
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy_para_teste";
    process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    customerId = `cus_teste_${Date.now()}`;
  });

  afterAll(async () => {
    const a = admin();
    for (const id of empresas) await a.from("empresas").delete().eq("id", id);
  });

  async function enviar(evento: object, assinaturaValida = true) {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const payload = JSON.stringify(evento);
    const sig = assinaturaValida
      ? stripe.webhooks.generateTestHeaderString({
          payload,
          secret: WEBHOOK_SECRET,
        })
      : "assinatura_invalida";
    const req = new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": sig },
      body: payload,
    });
    return POST(req);
  }

  it("falha de pagamento marca inadimplente; pagamento volta a ativar", async () => {
    const a = admin();
    const { data: emp } = await a
      .from("empresas")
      .insert({
        nome: "Oficina Stripe",
        segmento: "oficina_moto",
        status_assinatura: "ativa",
        stripe_customer_id: customerId,
      })
      .select("id")
      .single();
    if (!emp) throw new Error("não criei a empresa de teste");
    empresas.push(emp.id);

    // Assinatura inválida: não muda nada e responde 400.
    const ruim = await enviar(
      {
        id: "evt_ruim",
        object: "event",
        type: "invoice.payment_failed",
        data: { object: { id: "in_x", object: "invoice", customer: customerId, metadata: {} } },
      },
      false,
    );
    expect(ruim.status).toBe(400);

    // payment_failed válido → inadimplente.
    const falhou = await enviar({
      id: "evt_falha",
      object: "event",
      type: "invoice.payment_failed",
      data: { object: { id: "in_1", object: "invoice", customer: customerId, metadata: {} } },
    });
    expect(falhou.status).toBe(200);
    const { data: dep1 } = await a
      .from("empresas")
      .select("status_assinatura, inadimplente_desde")
      .eq("id", emp.id)
      .single();
    expect(dep1?.status_assinatura).toBe("inadimplente");
    expect(dep1?.inadimplente_desde).toBeTruthy();

    // invoice.paid → ativa de novo, zera a inadimplência.
    const pagou = await enviar({
      id: "evt_pago",
      object: "event",
      type: "invoice.paid",
      data: { object: { id: "in_2", object: "invoice", customer: customerId, metadata: {} } },
    });
    expect(pagou.status).toBe(200);
    const { data: dep2 } = await a
      .from("empresas")
      .select("status_assinatura, inadimplente_desde")
      .eq("id", emp.id)
      .single();
    expect(dep2?.status_assinatura).toBe("ativa");
    expect(dep2?.inadimplente_desde).toBeNull();
  });
});
