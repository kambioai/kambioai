import { describe, it, expect } from "vitest";
import { formatarReais } from "@/lib/utils";

describe("formatarReais", () => {
  it("formata centavos como moeda brasileira", () => {
    //   é o espaço não separável que o Intl usa entre "R$" e o número.
    expect(formatarReais(123456)).toBe("R$ 1.234,56");
  });

  it("formata zero", () => {
    expect(formatarReais(0)).toBe("R$ 0,00");
  });
});
