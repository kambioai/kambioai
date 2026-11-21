import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Estado vazio (Regras de UX §8: a tela vazia diz o que fazer).
 * Mostra um ícone, um título, uma orientação e, opcionalmente, uma ação.
 */
export function EstadoVazio({
  titulo,
  mensagem,
  icone: Icone = Inbox,
  acao,
}: {
  titulo: string;
  mensagem: string;
  icone?: LucideIcon;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-linha bg-superficie px-6 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-fundo text-texto-secundario">
        <Icone className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
      </div>
      <p className="font-grotesk text-titulo font-bold text-principal">
        {titulo}
      </p>
      <p className="max-w-sm text-corpo text-texto-secundario">{mensagem}</p>
      {acao ? <div className="pt-1">{acao}</div> : null}
    </div>
  );
}
