import { rotuloStatusAssinatura, type StatusAssinatura } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

const CORES: Record<StatusAssinatura, string> = {
  ativa: "bg-confirmado/10 text-confirmado",
  teste: "bg-fundo text-principal",
  inadimplente: "bg-atencao-fundo text-atencao",
  bloqueada: "bg-erro-fundo text-erro",
  cancelada: "bg-fundo text-texto-secundario",
};

/** Selo colorido do status de assinatura de uma empresa (painel admin). */
export function SeloStatus({ status }: { status: StatusAssinatura }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-3 py-1 text-legenda font-medium",
        CORES[status],
      )}
    >
      {rotuloStatusAssinatura[status]}
    </span>
  );
}
