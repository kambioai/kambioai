import { cn, formatarReais } from "@/lib/utils";

/**
 * Valor em reais a partir de centavos inteiros (Convenções §3).
 * Formata com `Intl.NumberFormat('pt-BR')` — a tela só formata, nunca calcula.
 * `tamanho`: "corpo" (padrão), "titulo" (24px) ou "painel" (40px, número principal).
 */
export function ValorReais({
  centavos,
  tamanho = "corpo",
  className,
}: {
  centavos: number;
  tamanho?: "corpo" | "titulo" | "painel";
  className?: string;
}) {
  const estilo =
    tamanho === "painel"
      ? "font-grotesk text-painel font-bold"
      : tamanho === "titulo"
        ? "font-grotesk text-titulo font-bold"
        : "font-medium";

  return (
    <span className={cn("tabular-nums", estilo, className)}>
      {formatarReais(centavos)}
    </span>
  );
}
