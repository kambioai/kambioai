"use server";

import { z } from "zod";

import { enviarEmail, urlApp } from "@/lib/email/cliente";
import { EmailBoasVindas } from "@/lib/email/templates/boas-vindas";
import { criarClienteServidor } from "@/lib/supabase/server";

// Escrita sensível do onboarding (CLAUDE.md §3): roda no SERVIDOR, com a sessão
// do usuário (sob RLS), validando tudo com Zod. Dinheiro em centavos.

const empresaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da oficina."),
  cidade: z.string().min(2, "Informe a cidade."),
  segmento: z.enum([
    "oficina_moto",
    "mecanica",
    "funilaria",
    "estetica",
    "troca_oleo",
    "borracharia",
  ]),
});

const itemSchema = z.object({
  nome: z.string().min(1),
  tipo: z.enum(["produto", "servico"]),
  custoCentavos: z.number().int().min(0),
  precoCentavos: z.number().int().min(0),
  estoque: z.number().int().min(0),
  estoqueMinimo: z.number().int().min(0),
});

const custoSchema = z.object({
  nome: z.string().min(1),
  valorCentavos: z.number().int().min(0),
});

const taxaSchema = z.object({
  forma: z.enum(["pix", "dinheiro", "debito", "credito"]),
  parcelas: z.number().int().min(1),
  percentual: z.number().min(0),
});

const configSchema = z.object({
  itens: z.array(itemSchema),
  custos: z.array(custoSchema),
  taxas: z.array(taxaSchema),
});

export type EntradaEmpresa = z.infer<typeof empresaSchema>;
export type EntradaConfig = z.infer<typeof configSchema>;

type Resultado<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; erro: string };

/** Cria a empresa e vincula o usuário como patrão (função atômica no banco). */
export async function criarEmpresa(
  entrada: EntradaEmpresa,
): Promise<Resultado<{ empresaId: string }>> {
  const parsed = empresaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados da empresa inválidos." };

  const sb = await criarClienteServidor();
  const { data, error } = await sb.rpc("criar_empresa_onboarding", {
    p_nome: parsed.data.nome,
    p_cidade: parsed.data.cidade,
    p_segmento: parsed.data.segmento,
  });
  if (error || !data) {
    return { ok: false, erro: "Não consegui criar a oficina. Tente de novo." };
  }

  // Guarda o e-mail do patrão no vínculo (usado nos avisos de cobrança por
  // e-mail). Best-effort: não impede a criação da oficina se falhar.
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (user?.email) {
    await sb
      .from("membros")
      .update({ email: user.email })
      .eq("usuario_id", user.id)
      .eq("empresa_id", data);
    await enviarEmail({
      to: user.email,
      subject: "Bem-vindo ao Kambio",
      react: EmailBoasVindas({
        nome:
          (user.user_metadata?.nome as string | undefined) ?? parsed.data.nome,
        link: urlApp("/comecar"),
      }),
    });
  }

  return { ok: true, empresaId: data };
}

/** Salva catálogo + estoque + custos + taxas e conclui o onboarding. */
export async function salvarConfiguracaoInicial(
  entrada: EntradaConfig,
): Promise<Resultado> {
  const parsed = configSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados inválidos." };

  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!emp) return { ok: false, erro: "Oficina não encontrada. Entre de novo." };
  const empresaId = emp.id;

  // Idempotente: limpa o que havia antes de gravar (caso o patrão refaça).
  await sb.from("catalogo_itens").delete().eq("empresa_id", empresaId);
  await sb.from("custos_fixos").delete().eq("empresa_id", empresaId);
  await sb.from("taxas_pagamento").delete().eq("empresa_id", empresaId);

  if (parsed.data.itens.length > 0) {
    const { error } = await sb.from("catalogo_itens").insert(
      parsed.data.itens.map((i) => ({
        nome: i.nome,
        tipo: i.tipo,
        custo: i.custoCentavos,
        preco: i.precoCentavos,
        estoque: i.estoque,
        estoque_minimo: i.estoqueMinimo,
        empresa_id: empresaId,
      })),
    );
    if (error) return { ok: false, erro: "Erro ao salvar o catálogo." };
  }

  const custos = parsed.data.custos.filter((c) => c.valorCentavos > 0);
  if (custos.length > 0) {
    await sb.from("custos_fixos").insert(
      custos.map((c) => ({
        nome: c.nome,
        valor: c.valorCentavos,
        empresa_id: empresaId,
      })),
    );
  }

  if (parsed.data.taxas.length > 0) {
    await sb.from("taxas_pagamento").insert(
      parsed.data.taxas.map((t) => ({
        forma: t.forma,
        parcelas: t.parcelas,
        percentual: t.percentual,
        empresa_id: empresaId,
      })),
    );
  }

  await sb
    .from("empresas")
    .update({ onboarding_completo: true })
    .eq("id", empresaId);

  return { ok: true };
}
