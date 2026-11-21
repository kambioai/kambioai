import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Campo de texto rotulado, com mensagem de erro em pt-BR (Regras de UX §9).
 * Usa forwardRef para funcionar com o `register` do React Hook Form.
 * Altura 52px e texto 16px (evita o zoom do iPhone — Regras de UX §4).
 */
export interface CampoTextoProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  erro?: string;
}

export const CampoTexto = React.forwardRef<HTMLInputElement, CampoTextoProps>(
  ({ label, erro, id, className, ...props }, ref) => {
    const campoId = id ?? props.name;
    const erroId = erro ? `${campoId}-erro` : undefined;
    return (
      <div className="space-y-1.5">
        <label
          htmlFor={campoId}
          className="block text-legenda font-medium text-texto"
        >
          {label}
        </label>
        <input
          id={campoId}
          ref={ref}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erroId}
          className={cn(
            "h-[52px] w-full rounded-xl border bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal",
            erro ? "border-erro" : "border-linha",
            className,
          )}
          {...props}
        />
        {erro ? (
          <p id={erroId} className="text-legenda text-erro">
            {erro}
          </p>
        ) : null}
      </div>
    );
  },
);
CampoTexto.displayName = "CampoTexto";
