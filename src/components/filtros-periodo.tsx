import Link from "next/link";

import { periodos, type Periodo } from "@/lib/dados";
import { cn } from "@/lib/utils";

/**
 * Filtros de período do Painel (Hoje/Ontem/7 dias/Mês/Tudo).
 * Cada filtro é um link que muda `?periodo=` — a tela recalcula no servidor.
 */
export function FiltrosPeriodo({
  atual,
  base,
}: {
  atual: Periodo;
  base: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
      {periodos.map((p) => (
        <Link
          key={p.chave}
          href={`${base}?periodo=${p.chave}`}
          aria-current={atual === p.chave ? "true" : undefined}
          className={cn(
            "rounded-full px-3 py-1.5 text-legenda font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-principal",
            atual === p.chave
              ? "bg-principal text-white"
              : "border border-linha bg-superficie text-texto-secundario hover:text-principal",
          )}
        >
          {p.rotulo}
        </Link>
      ))}
    </div>
  );
}
