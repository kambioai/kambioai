import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import type { NivelAcesso } from "@/lib/stripe/acesso";

/**
 * Faixa de aviso de cobrança no topo da área logada. Em modo leitura/aviso,
 * leva o patrão para a Conta resolver o pagamento. Laranja (atenção), nunca
 * vermelho de marca.
 */
export function AvisoCobranca({
  texto,
  nivel,
}: {
  texto: string;
  nivel: NivelAcesso;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-atencao-fundo px-4 py-3">
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-atencao"
        aria-hidden="true"
      />
      <div className="space-y-1">
        <p className="text-corpo font-medium text-atencao">{texto}</p>
        {nivel !== "completo" ? (
          <Link
            href="/patrao/conta"
            className="inline-block text-legenda font-medium text-atencao underline"
          >
            Atualizar pagamento
          </Link>
        ) : null}
      </div>
    </div>
  );
}
