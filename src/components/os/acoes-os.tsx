"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { entregarOS, mudarStatusOS } from "@/server/operacao";
import { rotuloPagamento } from "@/lib/rotulos";
import type { FormaPagamento, StatusOS } from "@/types";

const FORMAS: FormaPagamento[] = ["pix", "dinheiro", "debito", "credito"];

/** Ações do fluxo da OS no pátio: mudar status e entregar com pagamento. */
export function AcoesOS({
  osId,
  status,
}: {
  osId: string;
  status: StatusOS;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [entregando, setEntregando] = useState(false);
  const [forma, setForma] = useState<FormaPagamento>("pix");
  const [parcelas, setParcelas] = useState(1);

  async function mudar(novo: StatusOS) {
    setOcupado(true);
    setErro(null);
    const r = await mudarStatusOS(osId, novo);
    setOcupado(false);
    if (!r.ok) return setErro(r.erro);
    router.refresh();
  }

  async function confirmarEntrega() {
    setOcupado(true);
    setErro(null);
    const r = await entregarOS({
      osId,
      forma,
      parcelas: forma === "credito" ? parcelas : 1,
    });
    setOcupado(false);
    if (!r.ok) return setErro(r.erro);
    setEntregando(false);
    router.refresh();
  }

  if (status === "entregue") {
    return (
      <p className="rounded-xl bg-confirmado/10 px-3 py-2 text-corpo font-medium text-confirmado">
        OS entregue e paga.
      </p>
    );
  }
  if (status === "cancelado") {
    return (
      <p className="rounded-xl bg-fundo px-3 py-2 text-corpo text-texto-secundario">
        OS cancelada.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}

      {entregando ? (
        <div className="space-y-3 rounded-2xl border border-principal bg-superficie p-4">
          <p className="font-grotesk font-bold text-principal">Como pagou?</p>
          <div className="flex flex-wrap gap-2">
            {FORMAS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setForma(f)}
                className={
                  forma === f
                    ? "rounded-lg bg-principal px-4 py-2 text-corpo font-medium text-white"
                    : "rounded-lg border border-linha bg-superficie px-4 py-2 text-corpo font-medium text-texto-secundario hover:text-principal"
                }
              >
                {rotuloPagamento[f]}
              </button>
            ))}
          </div>
          {forma === "credito" ? (
            <label className="block space-y-1.5">
              <span className="block text-legenda font-medium text-texto">
                Parcelas
              </span>
              <select
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={confirmarEntrega}
              disabled={ocupado}
            >
              {ocupado ? "Salvando..." : "Confirmar entrega"}
            </Button>
            <Button
              variant="secundario"
              onClick={() => setEntregando(false)}
              disabled={ocupado}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {status === "orcamento" ? (
            <Button
              variant="secundario"
              onClick={() => mudar("em_servico")}
              disabled={ocupado}
            >
              Começar serviço
            </Button>
          ) : null}
          {status === "em_servico" ? (
            <>
              <Button
                variant="secundario"
                onClick={() => mudar("pronto")}
                disabled={ocupado}
              >
                Marcar pronto
              </Button>
              <Button
                variant="secundario"
                onClick={() => mudar("aguardando_peca")}
                disabled={ocupado}
              >
                Aguardando peça
              </Button>
            </>
          ) : null}
          {status === "aguardando_peca" ? (
            <Button
              variant="secundario"
              onClick={() => mudar("em_servico")}
              disabled={ocupado}
            >
              Voltar ao serviço
            </Button>
          ) : null}
          <Button onClick={() => setEntregando(true)} disabled={ocupado}>
            Entregar e receber
          </Button>
          <Button
            variant="secundario"
            onClick={() => mudar("cancelado")}
            disabled={ocupado}
          >
            Cancelar OS
          </Button>
        </div>
      )}
    </div>
  );
}
