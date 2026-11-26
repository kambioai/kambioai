import { Bell, CalendarClock, Car } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Cartão de confirmação de um LEMBRETE falado/digitado (CLAUDE.md §7/§8).
 * Sem dinheiro — vale para patrão e funcionário. Confirma antes de salvar.
 */
export interface DadosLembrete {
  texto: string;
  quandoRotulo: string;
  placa: string | null;
}

export function CartaoLembrete({
  dados,
  onConfirmar,
  onCorrigir,
  salvando = false,
}: {
  dados: DadosLembrete;
  onConfirmar?: () => void;
  onCorrigir?: () => void;
  salvando?: boolean;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-linha bg-superficie p-5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-destaque">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-corpo font-medium text-texto">{dados.texto}</p>
      </div>

      <div className="space-y-2 rounded-xl border border-linha bg-fundo p-3">
        <div className="flex items-center gap-2 text-corpo text-texto">
          <CalendarClock
            className="h-5 w-5 shrink-0 text-principal"
            aria-hidden="true"
          />
          <span className="font-medium">{dados.quandoRotulo}</span>
        </div>
        {dados.placa ? (
          <div className="flex items-center gap-2 text-legenda text-texto-secundario">
            <Car className="h-4 w-4 shrink-0" aria-hidden="true" />
            {dados.placa}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="principal"
          className="flex-1"
          onClick={onConfirmar}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Criar lembrete"}
        </Button>
        <Button
          variant="secundario"
          className="flex-1"
          onClick={onCorrigir}
          disabled={salvando}
        >
          Corrigir
        </Button>
      </div>
    </div>
  );
}
