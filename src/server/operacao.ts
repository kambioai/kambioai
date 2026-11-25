"use server";

import { z } from "zod";

import {
  buscarPercentualTaxa,
  type TaxaCalculo,
} from "@/lib/dinheiro/calculo";
import { garantirEscrita } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/server";

// Escrita da operação (CLAUDE.md §3): tudo no SERVIDOR, sob RLS, validado.
// Dinheiro em centavos; cálculo de taxa/lucro só aqui.

type Resultado = { ok: true } | { ok: false; erro: string };

async function empresaDoUsuario(
  sb: Awaited<ReturnType<typeof criarClienteServidor>>,
): Promise<string | null> {
  const { data } = await sb
    .from("empresas")
    .select("id")
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

const statusSchema = z.enum([
  "orcamento",
  "em_servico",
  "aguardando_peca",
  "pronto",
  "entregue",
  "cancelado",
]);

/** Muda o status de uma OS (fluxo do pátio). */
export async function mudarStatusOS(
  osId: string,
  status: z.infer<typeof statusSchema>,
): Promise<Resultado> {
  if (!z.string().uuid().safeParse(osId).success)
    return { ok: false, erro: "OS inválida." };
  if (!statusSchema.safeParse(status).success)
    return { ok: false, erro: "Status inválido." };

  const bloqueio = await garantirEscrita();
  if (!bloqueio.ok) return bloqueio;

  const sb = await criarClienteServidor();
  const { error } = await sb
    .from("ordens_servico")
    .update({ status })
    .eq("id", osId);
  if (error) return { ok: false, erro: "Não consegui mudar o status." };
  return { ok: true };
}

const entregaSchema = z.object({
  osId: z.string().uuid(),
  forma: z.enum(["pix", "dinheiro", "debito", "credito"]),
  parcelas: z.number().int().positive().max(12),
});

/** Entrega a OS: marca entregue, grava pagamento e recalcula a taxa no servidor. */
export async function entregarOS(
  entrada: z.infer<typeof entregaSchema>,
): Promise<Resultado> {
  const parsed = entregaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados inválidos." };
  const bloqueio = await garantirEscrita();
  if (!bloqueio.ok) return bloqueio;
  const { osId, forma, parcelas } = parsed.data;

  const sb = await criarClienteServidor();
  const empresaId = await empresaDoUsuario(sb);
  if (!empresaId) return { ok: false, erro: "Oficina não encontrada." };

  const { data: os } = await sb
    .from("ordens_servico")
    .select("total, custo_total")
    .eq("id", osId)
    .maybeSingle();
  if (!os) return { ok: false, erro: "OS não encontrada." };

  const { data: taxasData } = await sb
    .from("taxas_pagamento")
    .select("forma, parcelas, percentual")
    .eq("empresa_id", empresaId);
  const taxas: TaxaCalculo[] = (taxasData ?? []).map((t) => ({
    forma: t.forma,
    parcelas: t.parcelas,
    percentual: Number(t.percentual),
  }));

  const percentual = buscarPercentualTaxa(taxas, forma, parcelas);
  const taxaCentavos = Math.round((os.total * percentual) / 100);

  const { error } = await sb
    .from("ordens_servico")
    .update({
      status: "entregue",
      forma_pagamento: forma,
      parcelas,
      taxa: taxaCentavos,
    })
    .eq("id", osId);
  if (error) return { ok: false, erro: "Não consegui entregar a OS." };
  return { ok: true };
}

const despesaSchema = z.object({
  descricao: z.string().min(1, "Descreva a despesa."),
  valorCentavos: z.number().int().positive("Informe o valor."),
  categoria: z.string().default(""),
});

/** Lança uma despesa (só patrão — RLS bloqueia funcionário). */
export async function registrarDespesa(
  entrada: z.infer<typeof despesaSchema>,
): Promise<Resultado> {
  const parsed = despesaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados inválidos." };
  const bloqueio = await garantirEscrita();
  if (!bloqueio.ok) return bloqueio;

  const sb = await criarClienteServidor();
  const empresaId = await empresaDoUsuario(sb);
  if (!empresaId) return { ok: false, erro: "Oficina não encontrada." };

  const {
    data: { user },
  } = await sb.auth.getUser();

  const { error } = await sb.from("despesas").insert({
    descricao: parsed.data.descricao.trim(),
    valor: parsed.data.valorCentavos,
    categoria: parsed.data.categoria.trim() || null,
    autor_id: user?.id ?? null,
    empresa_id: empresaId,
  });
  if (error) return { ok: false, erro: "Não consegui lançar a despesa." };
  return { ok: true };
}

const fechamentoSchema = z.object({
  // valores contados por forma (centavos)
  valores: z.object({
    pix: z.number().int().min(0).optional(),
    dinheiro: z.number().int().min(0).optional(),
    debito: z.number().int().min(0).optional(),
    credito: z.number().int().min(0).optional(),
  }),
});

/** Fecha o caixa do dia: grava o que foi contado e a diferença para o sistema. */
export async function fecharCaixa(
  entrada: z.infer<typeof fechamentoSchema>,
): Promise<Resultado> {
  const parsed = fechamentoSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados inválidos." };
  const bloqueio = await garantirEscrita();
  if (!bloqueio.ok) return bloqueio;

  const sb = await criarClienteServidor();
  const empresaId = await empresaDoUsuario(sb);
  if (!empresaId) return { ok: false, erro: "Oficina não encontrada." };

  // Soma do sistema por forma (OS entregues de hoje).
  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  const inicio = `${hoje}T00:00:00-03:00`;
  const { data: osHoje } = await sb
    .from("ordens_servico")
    .select("total, forma_pagamento")
    .eq("status", "entregue")
    .gte("criado_em", inicio);

  const sistema: Record<string, number> = {};
  for (const o of osHoje ?? []) {
    if (!o.forma_pagamento) continue;
    sistema[o.forma_pagamento] = (sistema[o.forma_pagamento] ?? 0) + o.total;
  }

  const diferencas: Record<string, number> = {};
  for (const forma of ["pix", "dinheiro", "debito", "credito"]) {
    const informado = parsed.data.valores[forma as keyof typeof parsed.data.valores] ?? 0;
    diferencas[forma] = informado - (sistema[forma] ?? 0);
  }

  const { error } = await sb.from("fechamentos").upsert(
    {
      data: hoje,
      valores_informados: parsed.data.valores,
      diferencas,
      autor_id: (await sb.auth.getUser()).data.user?.id ?? null,
      empresa_id: empresaId,
    },
    { onConflict: "empresa_id,data" },
  );
  if (error) return { ok: false, erro: "Não consegui fechar o caixa." };
  return { ok: true };
}
