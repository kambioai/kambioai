// Cálculo de dinheiro da OS — SÓ no servidor (CLAUDE.md §3 e §6).
// A IA nunca calcula: o servidor calcula total, custo, taxa e lucro a partir do
// catálogo e das taxas. Tudo em CENTAVOS (inteiros); nunca float para dinheiro.

import type { FormaPagamento } from "@/types";

export interface ItemCalculo {
  precoCentavos: number; // preço de venda unitário
  custoCentavos: number; // custo unitário
  quantidade: number;
}

export interface TaxaCalculo {
  forma: FormaPagamento;
  parcelas: number;
  percentual: number; // ex.: 3.5 para 3,5%
}

export interface TotaisOS {
  totalCentavos: number;
  custoTotalCentavos: number;
  taxaCentavos: number;
  lucroCentavos: number;
  /** total − soma dos itens (desconto negativo / acréscimo positivo). */
  ajusteCentavos: number;
}

/** Percentual da taxa para uma forma/parcelas (0 se não houver — Pix/dinheiro). */
export function buscarPercentualTaxa(
  taxas: TaxaCalculo[],
  forma: FormaPagamento | null,
  parcelas: number,
): number {
  if (!forma) return 0;
  const exata = taxas.find(
    (t) => t.forma === forma && t.parcelas === parcelas,
  );
  if (exata) return exata.percentual;
  // fallback: 1x da mesma forma
  const umaVez = taxas.find((t) => t.forma === forma && t.parcelas === 1);
  return umaVez?.percentual ?? 0;
}

/**
 * Calcula os totais da OS.
 * - `totalFaladoCentavos`: total que a pessoa falou (pode diferir da soma).
 * - `usarTotalFalado`: patrão pode usar o total falado; funcionário NÃO
 *   (o servidor ignora valor falado por funcionário — CLAUDE.md §5 invariante 5).
 */
export function calcularOS(params: {
  itens: ItemCalculo[];
  percentualTaxa: number;
  totalFaladoCentavos?: number | null;
  usarTotalFalado: boolean;
}): TotaisOS {
  const { itens, percentualTaxa, totalFaladoCentavos, usarTotalFalado } =
    params;

  const somaItens = itens.reduce(
    (s, i) => s + i.precoCentavos * i.quantidade,
    0,
  );
  const custoTotalCentavos = itens.reduce(
    (s, i) => s + i.custoCentavos * i.quantidade,
    0,
  );

  const totalCentavos =
    usarTotalFalado &&
    totalFaladoCentavos != null &&
    totalFaladoCentavos >= 0
      ? totalFaladoCentavos
      : somaItens;

  const taxaCentavos = Math.round((totalCentavos * percentualTaxa) / 100);
  const lucroCentavos = totalCentavos - custoTotalCentavos - taxaCentavos;

  return {
    totalCentavos,
    custoTotalCentavos,
    taxaCentavos,
    lucroCentavos,
    ajusteCentavos: totalCentavos - somaItens,
  };
}

/** Converte reais (número, como a pessoa fala) para centavos inteiros. */
export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}
