"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import type { LinhaFechamento } from "@/lib/dados";
import { rotuloPagamento } from "@/lib/rotulos";
import { fecharCaixa } from "@/server/operacao";
import type { FormaPagamento } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Conferência do caixa por forma de pagamento. O patrão digita quanto contou,
 * a tela mostra Bateu / Sobrou / Faltam, e "Fechar o caixa" grava o fechamento.
 */
export function FechamentoForm({ linhas }: { linhas: LinhaFechamento[] }) {
  const router = useRouter();
  const [informados, setInformados] = useState<Record<string, string>>({});
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function centavosDe(forma: string): number | null {
    const texto = informados[forma];
    if (!texto || texto.trim() === "") return null;
    const n = Math.round(Number(texto.replace(",", ".")) * 100);
    return Number.isNaN(n) ? null : n;
  }

  async function fechar() {
    setSalvando(true);
    setErro(null);
    const valores: Partial<Record<FormaPagamento, number>> = {};
    for (const linha of linhas) {
      const c = centavosDe(linha.forma);
      if (c !== null) valores[linha.forma] = c;
    }
    const r = await fecharCaixa({ valores });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setSalvo(true);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {linhas.map((linha) => {
        const informadoCentavos = centavosDe(linha.forma);
        const valido = informadoCentavos !== null;
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
                  value={informados[linha.forma] ?? ""}
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

      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}

      {salvo ? (
        <p className="rounded-xl bg-confirmado/10 px-3 py-2 text-corpo font-medium text-confirmado">
          Caixa fechado! A partir de agora, só o patrão altera lançamentos de
          hoje.
        </p>
      ) : (
        <Button className="w-full" onClick={fechar} disabled={salvando}>
          {salvando ? "Fechando..." : "Fechar o caixa"}
        </Button>
      )}
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
