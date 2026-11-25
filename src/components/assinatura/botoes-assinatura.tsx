"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { abrirPortal, criarAssinatura } from "@/server/assinatura";

function useIr(acao: () => Promise<{ ok: boolean; url?: string; erro?: string }>) {
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  async function ir() {
    setErro(null);
    setOcupado(true);
    const r = await acao();
    if (!r.ok || !r.url) {
      setErro(r.erro ?? "Não consegui abrir. Tente de novo.");
      setOcupado(false);
      return;
    }
    window.location.assign(r.url);
  }
  return { erro, ocupado, ir };
}

/** Botão que abre o Checkout do Stripe para assinar. */
export function BotaoAssinar({
  children,
  className,
  variant = "principal",
}: {
  children?: ReactNode;
  className?: string;
  variant?: "principal" | "secundario" | "destaque";
}) {
  const { erro, ocupado, ir } = useIr(criarAssinatura);
  return (
    <div className={className}>
      {erro ? (
        <p className="mb-2 rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      <Button onClick={ir} disabled={ocupado} variant={variant} className="w-full">
        {ocupado ? "Abrindo pagamento..." : (children ?? "Assinar")}
      </Button>
    </div>
  );
}

/** Botão que abre o portal do cliente do Stripe (cartão, cancelar, faturas). */
export function BotaoPortal({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { erro, ocupado, ir } = useIr(abrirPortal);
  return (
    <div className={className}>
      {erro ? (
        <p className="mb-2 rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      <Button
        onClick={ir}
        disabled={ocupado}
        variant="secundario"
        className="w-full"
      >
        {ocupado ? "Abrindo..." : (children ?? "Gerenciar assinatura")}
      </Button>
    </div>
  );
}
