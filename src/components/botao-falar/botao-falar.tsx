import Link from "next/link";
import { Mic } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Botão Falar (Identidade visual §9): círculo laranja, ícone de microfone branco.
 * É o centro da navegação de patrão e funcionário. Leva à tela de registro por voz.
 */
export function BotaoFalar({
  href,
  tamanho = 64,
  rotulo = "Falar",
  className,
}: {
  href: string;
  tamanho?: number;
  rotulo?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={rotulo}
      className={cn(
        "grid place-items-center rounded-full bg-destaque text-white shadow-lg shadow-destaque/30 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-destaque focus-visible:ring-offset-2",
        className,
      )}
      style={{ width: tamanho, height: tamanho }}
    >
      <Mic
        strokeWidth={2}
        style={{ width: tamanho * 0.42, height: tamanho * 0.42 }}
        aria-hidden="true"
      />
    </Link>
  );
}
