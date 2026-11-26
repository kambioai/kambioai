import "server-only";

import { z } from "zod";

import {
  buscarPercentualTaxa,
  calcularOS,
  reaisParaCentavos,
  type ItemCalculo,
  type TaxaCalculo,
  type TotaisOS,
} from "@/lib/dinheiro/calculo";
import { formatarQuando } from "@/lib/datas";
import { normalizarPlaca, placaValida } from "@/lib/placa";
import { rotuloPagamento } from "@/lib/rotulos";
import { criarClienteServidor } from "@/lib/supabase/server";
import { criarClienteServico } from "@/lib/supabase/service";
import type { ItemContexto, VeiculoContexto } from "@/lib/ia/prompt";
import type { RespostaIa } from "@/lib/ia/schema";
import type { TipoItem } from "@/types";

// Núcleo do pipeline de voz (servidor). A IA só interpreta; AQUI o servidor
// resolve preços pelo catálogo, calcula dinheiro e monta o cartão. O mesmo
// cálculo é usado na interpretação e na confirmação (nunca confia no cliente).

export interface ItemIntent {
  itemId: string | null;
  descricao: string;
  quantidade: number;
  custoAvulsoReais: number | null;
  precoAvulsoReais: number | null;
}

export const intentSchema = z.object({
  placa: z.string().nullable(),
  modelo: z.string().nullable(),
  clienteNome: z.string().nullable(),
  itens: z.array(
    z.object({
      itemId: z.string().uuid().nullable(),
      descricao: z.string(),
      quantidade: z.number().int().positive(),
      custoAvulsoReais: z.number().nonnegative().nullable(),
      precoAvulsoReais: z.number().nonnegative().nullable(),
    }),
  ),
  forma: z.enum(["pix", "dinheiro", "debito", "credito"]).nullable(),
  parcelas: z.number().int().positive(),
  totalFaladoReais: z.number().nonnegative().nullable(),
  status: z.enum([
    "orcamento",
    "em_servico",
    "aguardando_peca",
    "pronto",
    "entregue",
    "cancelado",
  ]),
  transcricao: z.string(),
});

export type IntentOS = z.infer<typeof intentSchema>;
export type ItemIntentValidado = IntentOS["itens"][number];

interface CatalogoRow {
  id: string;
  nome: string;
  tipo: TipoItem;
  custo: number;
  preco: number;
}

export interface Contexto {
  papel: "patrao" | "funcionario";
  empresaId: string;
  userId: string;
  catalogo: CatalogoRow[];
  itensContexto: ItemContexto[];
  veiculos: VeiculoContexto[];
  taxas: TaxaCalculo[];
}

/**
 * Carrega o contexto da oficina do usuário logado. Verifica a associação com a
 * chave do usuário (RLS) e lê catálogo/taxas com a service role (para o
 * funcionário também — o resultado financeiro é filtrado antes de ir pra tela).
 */
export async function carregarContexto(): Promise<Contexto | null> {
  const sbUser = await criarClienteServidor();
  const {
    data: { user },
  } = await sbUser.auth.getUser();
  if (!user) return null;

  const { data: membro } = await sbUser
    .from("membros")
    .select("papel, empresa_id")
    .eq("ativo", true)
    .limit(1)
    .maybeSingle();
  if (!membro) return null;

  const svc = criarClienteServico();
  const [cat, tax, vei] = await Promise.all([
    svc
      .from("catalogo_itens")
      .select("id, nome, tipo, custo, preco, sinonimos")
      .eq("empresa_id", membro.empresa_id),
    svc
      .from("taxas_pagamento")
      .select("forma, parcelas, percentual")
      .eq("empresa_id", membro.empresa_id),
    svc
      .from("veiculos")
      .select("placa, modelo, clientes(nome)")
      .eq("empresa_id", membro.empresa_id)
      .order("atualizado_em", { ascending: false })
      .limit(20),
  ]);

  const catalogo: CatalogoRow[] = (cat.data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    tipo: c.tipo,
    custo: c.custo,
    preco: c.preco,
  }));

  return {
    papel: membro.papel,
    empresaId: membro.empresa_id,
    userId: user.id,
    catalogo,
    itensContexto: (cat.data ?? []).map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      sinonimos: c.sinonimos ?? [],
    })),
    veiculos: (vei.data ?? []).map((v) => ({
      placa: v.placa,
      modelo: v.modelo,
      cliente: v.clientes?.nome ?? null,
    })),
    taxas: (tax.data ?? []).map((t) => ({
      forma: t.forma,
      parcelas: t.parcelas,
      percentual: Number(t.percentual),
    })),
  };
}

/** Converte a resposta da IA em uma intenção de OS (estrutura estável). */
export function intentDaResposta(r: RespostaIa): IntentOS {
  const itensCatalogo: ItemIntent[] = r.itens.map((i) => ({
    itemId: i.item_id,
    descricao: "",
    quantidade: i.quantidade,
    custoAvulsoReais: i.custo_avulso,
    precoAvulsoReais: null,
  }));
  const itensFora: ItemIntent[] = r.itens_fora_do_catalogo.map((i) => ({
    itemId: null,
    descricao: i.descricao,
    quantidade: 1,
    custoAvulsoReais: i.custo,
    precoAvulsoReais: i.preco,
  }));
  return {
    placa: r.veiculo?.placa ?? null,
    modelo: r.veiculo?.modelo ?? null,
    clienteNome: r.cliente?.nome ?? null,
    itens: [...itensCatalogo, ...itensFora],
    forma: r.pagamento?.forma ?? null,
    parcelas: r.pagamento?.parcelas ?? 1,
    totalFaladoReais: r.total_falado,
    status:
      r.status ??
      (r.intencao === "os_paga" || r.pagamento ? "entregue" : "orcamento"),
    transcricao: r.transcricao,
  };
}

export interface ItemResolvido {
  itemId: string | null;
  descricao: string;
  quantidade: number;
  precoCentavos: number;
  custoCentavos: number;
}

export interface CartaoVoz {
  placa: string | null;
  modelo: string | null;
  cliente: string | null;
  pagamentoRotulo: string;
  itens: { descricao: string; quantidade: number; precoCentavos: number }[];
  totalCentavos: number;
  custoTotalCentavos: number;
  taxaCentavos: number;
  lucroCentavos: number;
  mostrarDinheiro: boolean;
  transcricao: string;
  avisos: string[];
  intent: IntentOS;
}

/** Resolve preços pelo catálogo e calcula os totais (o coração do servidor). */
export function processar(
  ctx: Contexto,
  intent: IntentOS,
): { resolvidos: ItemResolvido[]; cartao: CartaoVoz; totais: TotaisOS } {
  const ehFuncionario = ctx.papel === "funcionario";
  const avisos: string[] = [];

  const resolvidos: ItemResolvido[] = intent.itens.map((it) => {
    if (it.itemId) {
      const cat = ctx.catalogo.find((c) => c.id === it.itemId);
      if (cat) {
        const custo =
          it.custoAvulsoReais != null
            ? reaisParaCentavos(it.custoAvulsoReais)
            : cat.custo;
        return {
          itemId: cat.id,
          descricao: cat.nome,
          quantidade: it.quantidade,
          precoCentavos: cat.preco, // preço SEMPRE do catálogo
          custoCentavos: custo,
        };
      }
    }
    // avulso / fora do catálogo
    avisos.push(`"${it.descricao || "item"}" não está no catálogo.`);
    return {
      itemId: null,
      descricao: it.descricao || "Item avulso",
      quantidade: it.quantidade,
      // funcionário não define preço; patrão pode informar um preço avulso
      precoCentavos:
        !ehFuncionario && it.precoAvulsoReais != null
          ? reaisParaCentavos(it.precoAvulsoReais)
          : 0,
      custoCentavos:
        it.custoAvulsoReais != null
          ? reaisParaCentavos(it.custoAvulsoReais)
          : 0,
    };
  });

  const itensCalc: ItemCalculo[] = resolvidos.map((r) => ({
    precoCentavos: r.precoCentavos,
    custoCentavos: r.custoCentavos,
    quantidade: r.quantidade,
  }));
  const percentual = buscarPercentualTaxa(
    ctx.taxas,
    intent.forma,
    intent.parcelas,
  );
  const totais = calcularOS({
    itens: itensCalc,
    percentualTaxa: percentual,
    totalFaladoCentavos:
      intent.totalFaladoReais != null
        ? reaisParaCentavos(intent.totalFaladoReais)
        : null,
    usarTotalFalado: !ehFuncionario, // funcionário NÃO usa valor falado
  });

  // avisos de campos duvidosos / faltando
  if (intent.placa && !placaValida(intent.placa)) {
    avisos.push("A placa parece inválida — confira.");
  }
  if (!intent.forma && intent.status === "entregue") {
    avisos.push("Como foi o pagamento?");
  }
  if (resolvidos.length === 0) {
    avisos.push("Não reconheci nenhum item — confira.");
  }

  const pagamentoRotulo = intent.forma
    ? `${rotuloPagamento[intent.forma]}${intent.parcelas > 1 ? ` ${intent.parcelas}×` : ""}`
    : "—";

  return {
    resolvidos,
    totais,
    cartao: {
      placa: intent.placa ? normalizarPlaca(intent.placa) : null,
      modelo: intent.modelo,
      cliente: intent.clienteNome,
      pagamentoRotulo,
      itens: resolvidos.map((r) => ({
        descricao: r.descricao,
        quantidade: r.quantidade,
        precoCentavos: r.precoCentavos,
      })),
      totalCentavos: totais.totalCentavos,
      // esconde custo/lucro do funcionário (não vão nem no JSON)
      custoTotalCentavos: ehFuncionario ? 0 : totais.custoTotalCentavos,
      taxaCentavos: ehFuncionario ? 0 : totais.taxaCentavos,
      lucroCentavos: ehFuncionario ? 0 : totais.lucroCentavos,
      mostrarDinheiro: !ehFuncionario,
      transcricao: intent.transcricao,
      avisos,
      intent,
    },
  };
}

// ===== Lembrete por voz (CLAUDE.md §6/§8) =====

export interface CartaoLembrete {
  texto: string;
  quandoISO: string;
  quandoRotulo: string;
  placa: string | null;
  avisos: string[];
}

/** São Paulo é fixo em UTC−3 (sem horário de verão desde 2019). */
function localSpParaISO(quando: string): Date | null {
  // Aceita "YYYY-MM-DDTHH:mm" (ou com segundos). Trata como hora de São Paulo.
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(quando.trim());
  if (!m) return null;
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00-03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Monta o cartão de confirmação de um lembrete (sem dinheiro, qualquer papel). */
export function montarCartaoLembrete(r: RespostaIa): CartaoLembrete {
  const avisos: string[] = [];
  const texto = (r.lembrete?.texto || r.transcricao || "Lembrete").trim();

  const parsed = r.lembrete?.quando ? localSpParaISO(r.lembrete.quando) : null;
  let quandoISO: string;
  if (parsed) {
    quandoISO = parsed.toISOString();
    if (parsed.getTime() < Date.now() - 60_000) {
      avisos.push("Esse horário já passou — confira a data.");
    }
  } else {
    quandoISO = new Date(Date.now() + 3_600_000).toISOString();
    avisos.push(
      "Não peguei o horário — deixei pra daqui a 1 hora. Corrija se precisar.",
    );
  }

  return {
    texto,
    quandoISO,
    quandoRotulo: formatarQuando(quandoISO),
    placa: r.veiculo?.placa ? normalizarPlaca(r.veiculo.placa) : null,
    avisos,
  };
}
