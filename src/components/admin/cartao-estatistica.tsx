import type { ReactNode } from "react";

import { Cartao, CartaoTitulo } from "@/components/ui/cartao";

/**
 * Cartão de número do painel admin: um rótulo, um número grande e uma legenda.
 * `variante="lucro"` deixa o cartão marinho (usado no número principal).
 */
export function CartaoEstatistica({
  rotulo,
  valor,
  legenda,
  variante = "padrao",
}: {
  rotulo: string;
  valor: ReactNode;
  legenda?: string;
  variante?: "padrao" | "lucro";
}) {
  const corLegenda =
    variante === "lucro" ? "text-white/70" : "text-texto-secundario";
  return (
    <Cartao variante={variante}>
      <CartaoTitulo>{rotulo}</CartaoTitulo>
      <p className="font-grotesk text-painel font-bold leading-tight">{valor}</p>
      {legenda ? (
        <p className={`mt-1 text-legenda ${corLegenda}`}>{legenda}</p>
      ) : null}
    </Cartao>
  );
}
