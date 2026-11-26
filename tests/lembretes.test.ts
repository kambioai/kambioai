import { describe, expect, it } from "vitest";

import { formatarQuando } from "@/lib/datas";
import { respostaIaSchema } from "@/lib/ia/schema";
import { montarCartaoLembrete } from "@/server/voz-core";

// Monta uma RespostaIa válida (com defaults) e injeta o lembrete pedido.
function respostaLembrete(lembrete: { texto: string; quando: string | null }) {
  return respostaIaSchema.parse({
    intencao: "lembrete",
    transcricao: "fala do lembrete",
    lembrete,
  });
}

describe("lembrete por voz — montagem do cartão", () => {
  it("interpreta uma data/hora futura (sem aviso de horário)", () => {
    const cartao = montarCartaoLembrete(
      respostaLembrete({ texto: "ligar pro cliente", quando: "2999-01-02T09:00" }),
    );
    expect(cartao.texto).toBe("ligar pro cliente");
    // 09:00 local São Paulo (UTC−3) = 12:00Z
    expect(cartao.quandoISO).toBe("2999-01-02T12:00:00.000Z");
    expect(cartao.avisos).toHaveLength(0);
  });

  it("sem horário reconhecido, cai para daqui a 1h e avisa", () => {
    const antes = Date.now();
    const cartao = montarCartaoLembrete(
      respostaLembrete({ texto: "comprar óleo", quando: null }),
    );
    const quando = new Date(cartao.quandoISO).getTime();
    expect(quando).toBeGreaterThan(antes + 50 * 60_000);
    expect(quando).toBeLessThan(antes + 70 * 60_000);
    expect(cartao.avisos.join(" ")).toMatch(/1 hora/i);
  });

  it("avisa quando o horário já passou", () => {
    const cartao = montarCartaoLembrete(
      respostaLembrete({ texto: "revisão", quando: "2000-01-01T09:00" }),
    );
    expect(cartao.avisos.join(" ")).toMatch(/passou/i);
  });

  it("formata o rótulo em horário de São Paulo", () => {
    const rotulo = formatarQuando("2999-01-02T12:00:00.000Z");
    expect(rotulo).toMatch(/09:00/);
    expect(rotulo).toMatch(/02\/01/);
  });
});
