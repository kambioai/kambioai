"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Aviso com "Desfazer" (Regras de UX §7): depois de salvar, aparece no topo e
 * some sozinho em 5 s. Aqui fica o visual + o temporizador; quem usa decide
 * o que "Desfazer" faz e onde posicionar (normalmente fixo no topo da tela).
 */
export function AvisoDesfazer({
  mensagem,
  aoDesfazer,
  aoFechar,
  duracaoMs = 5000,
}: {
  mensagem: string;
  aoDesfazer?: () => void;
  aoFechar?: () => void;
  duracaoMs?: number;
}) {
  useEffect(() => {
    const t = setTimeout(() => aoFechar?.(), duracaoMs);
    return () => clearTimeout(t);
  }, [duracaoMs, aoFechar]);

  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border border-principal bg-principal px-4 py-3 text-white shadow-lg"
    >
      <span className="flex-1 text-corpo">{mensagem}</span>
      <button
        type="button"
        onClick={() => {
          aoDesfazer?.();
          aoFechar?.();
        }}
        className="font-grotesk font-bold text-destaque outline-none hover:underline focus-visible:underline"
      >
        Desfazer
      </button>
      <button
        type="button"
        onClick={() => aoFechar?.()}
        aria-label="Fechar aviso"
        className="text-white/70 outline-none hover:text-white focus-visible:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
