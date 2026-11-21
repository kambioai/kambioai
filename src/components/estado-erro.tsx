"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Estado de erro de uma tela (Regras de UX §9: erro em português simples).
 * Usado pelos `error.tsx` de cada rota, com o `reset` do Next para tentar de novo.
 */
export function EstadoErro({ reset }: { reset?: () => void }) {
  return (
    <section className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-erro-fundo text-erro">
        <TriangleAlert className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
      </div>
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Algo deu errado
      </h1>
      <p className="max-w-sm text-corpo text-texto-secundario">
        Não consegui carregar esta tela agora. Tente de novo.
      </p>
      {reset ? (
        <Button variant="principal" onClick={reset}>
          Tentar de novo
        </Button>
      ) : null}
    </section>
  );
}
