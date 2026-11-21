import { LifeBuoy } from "lucide-react";

import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { cn } from "@/lib/utils";
import { listarChamados } from "@/lib/dados/admin";
import type { Chamado } from "@/lib/mock/admin";

const ROTULO_STATUS: Record<Chamado["status"], string> = {
  aberto: "Aberto",
  respondido: "Respondido",
  fechado: "Fechado",
};

const COR_STATUS: Record<Chamado["status"], string> = {
  aberto: "bg-atencao-fundo text-atencao",
  respondido: "bg-fundo text-principal",
  fechado: "bg-confirmado/10 text-confirmado",
};

const ROTULO_PRIORIDADE: Record<Chamado["prioridade"], string> = {
  alta: "Alta",
  normal: "Normal",
  baixa: "Baixa",
};

function diasLabel(dias: number): string {
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export default async function SuporteAdmin() {
  const chamados = await listarChamados();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Suporte
      </h1>

      {chamados.length === 0 ? (
        <EstadoVazio
          titulo="Sem chamados"
          mensagem="Nenhuma oficina abriu chamado por enquanto."
          icone={LifeBuoy}
        />
      ) : (
        <ul className="space-y-2">
          {chamados.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-linha bg-superficie p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-texto">{c.assunto}</p>
                  <p className="text-legenda text-texto-secundario">
                    {c.empresa} · {diasLabel(c.diasAtras)} · Prioridade{" "}
                    {ROTULO_PRIORIDADE[c.prioridade].toLowerCase()}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-legenda font-medium",
                    COR_STATUS[c.status],
                  )}
                >
                  {ROTULO_STATUS[c.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
