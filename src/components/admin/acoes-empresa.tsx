"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CalendarClock, LifeBuoy, Send, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Cartao } from "@/components/ui/cartao";
import type { StatusAssinatura } from "@/lib/rotulos";
import {
  bloquearEmpresa,
  desbloquearEmpresa,
  estenderTeste,
  registrarModoSuporte,
} from "@/server/admin";

/**
 * Ações do admin na ficha da empresa. Bloquear/desbloquear e estender teste são
 * reais (mudam o status, a régua recalcula na hora). Cupom e reenviar convite
 * dependem de Stripe/e-mail (Fase 14) — ficam desativados com aviso. Modo
 * suporte exige um motivo (LGPD) e leva à visão somente-leitura.
 */
export function AcoesEmpresa({
  empresaId,
  status,
}: {
  empresaId: string;
  status: StatusAssinatura;
}) {
  const router = useRouter();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [abrindoSuporte, setAbrindoSuporte] = useState(false);
  const [motivo, setMotivo] = useState("");

  const bloqueada = status === "bloqueada";

  async function rodar(acao: string, fn: () => Promise<{ ok: boolean; erro?: string }>) {
    setOcupado(acao);
    setErro(null);
    const r = await fn();
    setOcupado(null);
    if (!r.ok) setErro(r.erro ?? "Não consegui concluir.");
    else router.refresh();
  }

  async function entrarSuporte() {
    setOcupado("suporte");
    setErro(null);
    const r = await registrarModoSuporte({ empresaId, motivo });
    setOcupado(null);
    if (!r.ok) {
      setErro(r.erro ?? "Não consegui registrar.");
      return;
    }
    router.push(`/admin/empresas/${empresaId}/suporte`);
  }

  return (
    <div className="space-y-3">
      <h2 className="font-grotesk text-corpo font-bold text-principal">Ações</h2>

      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          variant="secundario"
          className="justify-start"
          onClick={() => rodar("teste", () => estenderTeste(empresaId))}
          disabled={ocupado !== null}
        >
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
          {ocupado === "teste" ? "Aplicando..." : "Estender teste"}
        </Button>

        <Button
          variant="secundario"
          className="justify-start opacity-60"
          disabled
          title="Em breve (depende do Stripe)"
        >
          <Ticket className="h-5 w-5" aria-hidden="true" />
          Aplicar cupom
        </Button>

        <Button
          variant="secundario"
          className="justify-start opacity-60"
          disabled
          title="Em breve (e-mail na Fase 14)"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
          Reenviar convite
        </Button>

        <Button
          variant="secundario"
          className="justify-start"
          onClick={() =>
            rodar("status", () =>
              bloqueada ? desbloquearEmpresa(empresaId) : bloquearEmpresa(empresaId),
            )
          }
          disabled={ocupado !== null}
        >
          <Ban className="h-5 w-5" aria-hidden="true" />
          {ocupado === "status"
            ? "Salvando..."
            : bloqueada
              ? "Desbloquear"
              : "Bloquear"}
        </Button>
      </div>

      <Cartao className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-medium text-texto">
              <LifeBuoy className="h-5 w-5 text-principal" aria-hidden="true" />
              Modo suporte
            </p>
            <p className="text-legenda text-texto-secundario">
              Acesso somente leitura aos dados da oficina. Cada entrada é
              registrada com data, hora e motivo (LGPD).
            </p>
          </div>
          {!abrindoSuporte ? (
            <Button
              variant="principal"
              className="shrink-0"
              onClick={() => setAbrindoSuporte(true)}
            >
              Entrar em modo suporte
            </Button>
          ) : null}
        </div>

        {abrindoSuporte ? (
          <div className="space-y-2">
            <label
              htmlFor="motivo-suporte"
              className="block text-legenda font-medium text-texto"
            >
              Motivo do acesso (fica registrado)
            </label>
            <input
              id="motivo-suporte"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: cliente abriu chamado sobre o fechamento do dia"
              className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
            />
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={entrarSuporte}
                disabled={ocupado !== null || motivo.trim().length < 5}
              >
                {ocupado === "suporte" ? "Registrando..." : "Entrar (somente leitura)"}
              </Button>
              <Button
                variant="secundario"
                className="flex-1"
                onClick={() => {
                  setAbrindoSuporte(false);
                  setMotivo("");
                }}
                disabled={ocupado !== null}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}
      </Cartao>
    </div>
  );
}
