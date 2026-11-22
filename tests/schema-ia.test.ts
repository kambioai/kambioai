import { describe, expect, it } from "vitest";

import { validarRespostaIa } from "@/lib/ia/schema";
import { normalizarPlaca, placaValida } from "@/lib/placa";

describe("validarRespostaIa", () => {
  it("aceita o JSON completo do exemplo", () => {
    const bruto = {
      intencao: "os_paga",
      transcricao: "Gol placa ABC1D23, troquei pastilha e fiz alinhamento",
      veiculo: { placa: "ABC1D23", modelo: "Gol", confianca: 0.92 },
      cliente: null,
      itens: [
        { item_id: "pastilha-freio", quantidade: 1, custo_avulso: 80 },
        { item_id: "alinhamento", quantidade: 1, custo_avulso: null },
      ],
      itens_fora_do_catalogo: [],
      total_falado: 350,
      pagamento: { forma: "credito", parcelas: 2 },
      status: null,
    };
    const r = validarRespostaIa(bruto);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dados.intencao).toBe("os_paga");
      expect(r.dados.itens).toHaveLength(2);
      expect(r.dados.pagamento?.forma).toBe("credito");
    }
  });

  it("preenche defaults quando campos opcionais faltam", () => {
    const r = validarRespostaIa({ intencao: "pergunta" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dados.itens).toEqual([]);
      expect(r.dados.veiculo).toBeNull();
      expect(r.dados.total_falado).toBeNull();
    }
  });

  it("recusa intenção inválida", () => {
    const r = validarRespostaIa({ intencao: "fazer_cafe" });
    expect(r.ok).toBe(false);
  });

  it("recusa forma de pagamento inválida", () => {
    const r = validarRespostaIa({
      intencao: "os_paga",
      pagamento: { forma: "boleto", parcelas: 1 },
    });
    expect(r.ok).toBe(false);
  });

  it("recusa entrada que não é objeto", () => {
    expect(validarRespostaIa("texto solto").ok).toBe(false);
    expect(validarRespostaIa(null).ok).toBe(false);
  });
});

describe("placa", () => {
  it("valida Mercosul e antigo", () => {
    expect(placaValida("ABC1D23")).toBe(true);
    expect(placaValida("ABC1234")).toBe(true);
  });
  it("normaliza e valida com espaço/hífen/minúscula", () => {
    expect(placaValida("abc-1d23")).toBe(true);
    expect(normalizarPlaca("abc 1d23")).toBe("ABC1D23");
  });
  it("recusa placa inválida", () => {
    expect(placaValida("AB1234")).toBe(false);
    expect(placaValida("ABCD123")).toBe(false);
    expect(placaValida("")).toBe(false);
  });
});
