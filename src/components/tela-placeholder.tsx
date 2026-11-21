import type { LucideIcon } from "lucide-react";

import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";

/**
 * Tela de espaço reservado para a Fase 1: cada botão da navegação abre uma
 * tela de verdade, ainda que só com título e um estado vazio explicando o que
 * vem depois. O conteúdo real chega nas fases seguintes do PLAN.
 */
export function TelaPlaceholder({
  titulo,
  descricao,
  fasePrevista,
  icone,
}: {
  titulo: string;
  descricao: string;
  fasePrevista: string;
  icone?: LucideIcon;
}) {
  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        {titulo}
      </h1>
      <EstadoVazio
        titulo="Tela em construção"
        mensagem={`${descricao} Conteúdo real previsto para ${fasePrevista}.`}
        icone={icone}
      />
    </section>
  );
}
