import { Mic } from "lucide-react";

/**
 * Tela do botão Falar. Na Fase 1 é a apresentação do registro por voz —
 * o microfone grande e a frase de exemplo. A gravação e a IA entram na Fase 8;
 * tudo também vai funcionar digitando (CLAUDE.md §6).
 */
export function TelaFalar({ dica }: { dica: string }) {
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Falar
      </h1>
      <p className="max-w-sm text-corpo text-texto-secundario">{dica}</p>
      <div
        className="grid h-24 w-24 place-items-center rounded-full bg-destaque text-white shadow-lg shadow-destaque/30"
        aria-hidden="true"
      >
        <Mic className="h-10 w-10" strokeWidth={2} />
      </div>
      <p className="max-w-xs text-legenda text-texto-secundario">
        O registro por voz entra na Fase 8. Tudo também vai funcionar digitando.
      </p>
    </section>
  );
}
