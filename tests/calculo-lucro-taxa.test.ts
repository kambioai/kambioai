import { describe, expect, it } from "vitest";

import {
  buscarPercentualTaxa,
  calcularOS,
  reaisParaCentavos,
  type ItemCalculo,
  type TaxaCalculo,
} from "@/lib/dinheiro/calculo";

const itens: ItemCalculo[] = [
  { precoCentavos: 9000, custoCentavos: 4000, quantidade: 1 }, // pastilha
  { precoCentavos: 6000, custoCentavos: 0, quantidade: 1 }, // alinhamento
];

const taxas: TaxaCalculo[] = [
  { forma: "pix", parcelas: 1, percentual: 0 },
  { forma: "debito", parcelas: 1, percentual: 2 },
  { forma: "credito", parcelas: 1, percentual: 3.5 },
  { forma: "credito", parcelas: 2, percentual: 5 },
];

describe("buscarPercentualTaxa", () => {
  it("acha a taxa exata por forma e parcelas", () => {
    expect(buscarPercentualTaxa(taxas, "credito", 2)).toBe(5);
  });
  it("faz fallback para 1x quando a parcela não existe", () => {
    expect(buscarPercentualTaxa(taxas, "credito", 3)).toBe(3.5);
  });
  it("retorna 0 para Pix/dinheiro ou forma nula", () => {
    expect(buscarPercentualTaxa(taxas, "pix", 1)).toBe(0);
    expect(buscarPercentualTaxa(taxas, null, 1)).toBe(0);
  });
});

describe("calcularOS", () => {
  it("calcula total, custo, taxa e lucro (crédito 2x = 5%)", () => {
    const r = calcularOS({
      itens,
      percentualTaxa: 5,
      usarTotalFalado: false,
    });
    expect(r.totalCentavos).toBe(15000);
    expect(r.custoTotalCentavos).toBe(4000);
    expect(r.taxaCentavos).toBe(750); // 15000 * 5%
    expect(r.lucroCentavos).toBe(10250); // 15000 - 4000 - 750
    expect(r.ajusteCentavos).toBe(0);
  });

  it("usa o total falado do patrão e mostra o ajuste", () => {
    const r = calcularOS({
      itens,
      percentualTaxa: 5,
      totalFaladoCentavos: 14000,
      usarTotalFalado: true,
    });
    expect(r.totalCentavos).toBe(14000);
    expect(r.taxaCentavos).toBe(700);
    expect(r.lucroCentavos).toBe(9300);
    expect(r.ajusteCentavos).toBe(-1000); // desconto de R$10
  });

  it("IGNORA o total falado do funcionário (usa o catálogo)", () => {
    const r = calcularOS({
      itens,
      percentualTaxa: 5,
      totalFaladoCentavos: 14000,
      usarTotalFalado: false,
    });
    expect(r.totalCentavos).toBe(15000); // ignorou os 14000 falados
  });

  it("arredonda a taxa para centavos inteiros", () => {
    const r = calcularOS({
      itens: [{ precoCentavos: 3333, custoCentavos: 0, quantidade: 1 }],
      percentualTaxa: 3.5,
      usarTotalFalado: false,
    });
    expect(Number.isInteger(r.taxaCentavos)).toBe(true);
    expect(r.taxaCentavos).toBe(117); // round(3333 * 3.5%) = round(116.655)
  });
});

describe("reaisParaCentavos", () => {
  it("converte reais em centavos inteiros", () => {
    expect(reaisParaCentavos(350)).toBe(35000);
    expect(reaisParaCentavos(80)).toBe(8000);
    expect(reaisParaCentavos(12.5)).toBe(1250);
  });
});
