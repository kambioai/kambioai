import { cn } from "@/lib/utils";

/**
 * Esqueleto de carregamento (Regras de UX §10: nunca tela branca).
 * Um bloco cinza pulsando no lugar do conteúdo que ainda vai chegar.
 */
export function Esqueleto({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-linha/70", className)}
      aria-hidden="true"
    />
  );
}
