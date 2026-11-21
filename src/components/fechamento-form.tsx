"use client";

import { useState } from "react";

import { ValorReais } from "@/components/valor-reais/valor-reais";
import type { LinhaFechamento } from "@/lib/dados";
import { rotuloPagamento } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

/**
 * Conferência do caixa por forma de pagamento. O patrão digita quanto contou
 * e a tela mostra Bateu / Sobrou / Faltam comparando com o sistema.
 */
export function FechamentoForm({ linhas }: { linhas: LinhaFechamento[] }) {
  const [informados, setInformados] = useState<Record<string, string>>({});

  return (
    <div className="space-y-3">
      {linhas.map((linha) => {
        const texto = informados[linha.forma] ?? "";
        const informadoCentavos =
          texto.trim() === ""
            ? null
            : Math.round(Number(texto.replace(",", ".")) * 100);
        const valido =
          informadoCentavos !== null && !Number.isNaN(informadoCentavos);
        const diferenca = valido
          ? informadoCentavos - linha.sistemaCentavos
          : 0;

        return (
          <div
            key={linha.forma}
            className="rounded-2xl border border-linha bg-superficie p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-texto">
                {rotuloPagamento[linha.forma]}
              </span>
              <span className="text-legenda text-texto-secundario">
                Sistema: <ValorReais centavos={linha.sistemaCentavos} />
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-corpo text-texto-secundario">
                  R$
                </span>
                <input
                  inputMode="decimal"
                  value={texto}
                  onChange={(e) =>
                    setInformados((prev) => ({
                      ...prev,
                      [linha.forma]: e.target.value,
                    }))
                  }
                  aria-label={`Quanto você contou em ${rotuloPagamento[linha.forma]}`}
                  placeholder="0,00"
                  className="h-12 w-full rounded-xl border border-linha bg-superficie pl-10 pr-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
                />
              </div>
              <Status valido={valido} diferenca={diferenca} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Status({ valido, diferenca }: { valido: boolean; diferenca: number }) {
  if (!valido) {
    return (
      <span className="w-28 text-right text-legenda text-texto-secundario">
        —
      </span>
    );
  }
  if (diferenca === 0) {
    return (
      <span className="w-28 text-right text-legenda font-medium text-confirmado">
        Bateu
      </span>
    );
  }
  const faltam = diferenca < 0;
  return (
    <span
      className={cn(
        "w-28 text-right text-legenda font-medium",
        faltam ? "text-erro" : "text-atencao",
      )}
    >
      {faltam ? "Faltam " : "Sobrou "}
      <ValorReais centavos={Math.abs(diferenca)} />
    </span>
  );
}
