"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  assinarPush,
  cancelarPush,
  estadoPush,
  type EstadoPush,
} from "@/lib/push/cliente";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";

/**
 * Liga/desliga os avisos no celular (push). Fica na tela Conta. Sem push os
 * lembretes e o resumo do dia chegam só dentro do app; com push, no aparelho.
 */
export function AtivarPush() {
  const [estado, setEstado] = useState<EstadoPush | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    estadoPush().then(setEstado);
  }, []);

  async function ligar() {
    setOcupado(true);
    setErro(null);
    try {
      setEstado(await assinarPush());
    } catch {
      setErro("Não consegui ativar os avisos. Tente de novo.");
    } finally {
      setOcupado(false);
    }
  }

  async function desligar() {
    setOcupado(true);
    setErro(null);
    try {
      setEstado(await cancelarPush());
    } catch {
      setErro("Não consegui desligar os avisos.");
    } finally {
      setOcupado(false);
    }
  }

  // Enquanto detecta (SSR/primeiro render), mostra um texto neutro.
  const inscrito = estado === "inscrito";

  return (
    <Cartao>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-principal">
          {inscrito ? (
            <BellRing className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Bell className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CartaoTitulo>Avisos no celular</CartaoTitulo>
          <p className="mt-1 text-legenda text-texto-secundario">
            {estado === "nao-suportado"
              ? "Este aparelho ou navegador não aceita avisos. Abra pelo app instalado na tela inicial."
              : estado === "negado"
                ? "Os avisos estão bloqueados nas configurações do navegador. Libere para ativar."
                : inscrito
                  ? "Ligado. Você recebe lembretes, retorno de cliente e o resumo do dia."
                  : "Receba lembretes, retorno de cliente e o resumo do dia neste aparelho."}
          </p>

          {erro ? (
            <p className="mt-2 rounded-lg bg-erro-fundo px-3 py-2 text-legenda text-erro">
              {erro}
            </p>
          ) : null}

          {estado && estado !== "nao-suportado" && estado !== "negado" ? (
            <div className="mt-3">
              {inscrito ? (
                <Button
                  variant="secundario"
                  size="sm"
                  onClick={desligar}
                  disabled={ocupado}
                >
                  <BellOff className="mr-2 h-4 w-4" aria-hidden="true" />
                  {ocupado ? "Desligando..." : "Desligar avisos"}
                </Button>
              ) : (
                <Button size="sm" onClick={ligar} disabled={ocupado}>
                  <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                  {ocupado ? "Ativando..." : "Ativar avisos"}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Cartao>
  );
}
