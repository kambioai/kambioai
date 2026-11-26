import { describe, expect, it } from "vitest";

import { mrrEmpresaCentavos, taxaCorrecao } from "@/lib/admin/metricas";
import { PRECOS } from "@/lib/stripe/planos";

describe("MRR por empresa (admin)", () => {
  it("só conta receita quando a assinatura está ativa", () => {
    expect(mrrEmpresaCentavos("basico", "teste", 0)).toBe(0);
    expect(mrrEmpresaCentavos("pro", "inadimplente", 3)).toBe(0);
    expect(mrrEmpresaCentavos("pro", "bloqueada", 3)).toBe(0);
    expect(mrrEmpresaCentavos("pro", "cancelada", 3)).toBe(0);
  });

  it("Básico ativo = preço do Básico", () => {
    expect(mrrEmpresaCentavos("basico", "ativa", 0)).toBe(PRECOS.basico);
  });

  it("PRO ativo com até 2 funcionários = preço do PRO", () => {
    expect(mrrEmpresaCentavos("pro", "ativa", 0)).toBe(PRECOS.pro);
    expect(mrrEmpresaCentavos("pro", "ativa", 2)).toBe(PRECOS.pro);
  });

  it("PRO ativo soma adicionais a partir do 3º funcionário", () => {
    expect(mrrEmpresaCentavos("pro", "ativa", 4)).toBe(
      PRECOS.pro + 2 * PRECOS.funcionarioAdicional,
    );
  });
});

describe("taxa de correção", () => {
  it("é 0 quando não houve uso da IA", () => {
    expect(taxaCorrecao(0, 0)).toBe(0);
  });
  it("é corrigidas / total", () => {
    expect(taxaCorrecao(1, 4)).toBe(0.25);
  });
});
