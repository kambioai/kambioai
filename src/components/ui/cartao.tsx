import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Cartão do Kambio (Identidade visual §9).
 * - padrao: branco, cantos 16px, borda `linha`, sem sombra pesada.
 * - lucro: marinho com texto branco (usado no cartão de lucro do Painel).
 */
export function Cartao({
  className,
  variante = "padrao",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variante?: "padrao" | "lucro";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        variante === "lucro"
          ? "border-transparent bg-principal text-white"
          : "border-linha bg-superficie text-texto",
        className,
      )}
      {...props}
    />
  );
}

/** Título curto dentro de um cartão. */
export function CartaoTitulo({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("mb-1 text-legenda font-medium opacity-80", className)}
      {...props}
    />
  );
}
