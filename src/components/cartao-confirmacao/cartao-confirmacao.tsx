import type { ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { cn } from "@/lib/utils";

/**
 * Cartão de confirmação de voz (CLAUDE.md §6). Nada salva sem passar por aqui.
 * Para o PATRÃO mostra custo e lucro; para o FUNCIONÁRIO esses campos somem
 * (`mostrarDinheiro=false`) — a tela nunca revela custo/lucro ao funcionário.
 */
export interface DadosConfirmacao {
  placa: string;
  modelo: string;
  cliente: string | null;
  pagamento: string;
  itens: { descricao: string; quantidade: number; precoCentavos: number }[];
  totalCentavos: number;
  custoCentavos: number;
  taxaCentavos: number;
}

export function CartaoConfirmacao({
  dados,
  mostrarDinheiro = true,
  campoCustoPeca = false,
  onConfirmar,
  onCorrigir,
  salvando = false,
}: {
  dados: DadosConfirmacao;
  mostrarDinheiro?: boolean;
  /** Ação do "Cadastrar agora" (quando ausente, botão fica só visual). */
  onConfirmar?: () => void;
  /** Ação do "Corrigir". */
  onCorrigir?: () => void;
  salvando?: boolean;
  /**
   * Campo onde o FUNCIONÁRIO informa quanto pagou numa peça que ele mesmo
   * comprou (CLAUDE.md §11). É um valor que ele digita — não revela custo nem
   * lucro do catálogo. Só o patrão enxerga esse número depois.
   */
  campoCustoPeca?: boolean;
}) {
  const lucroCentavos =
    dados.totalCentavos - dados.custoCentavos - dados.taxaCentavos;
  const prejuizo = lucroCentavos < 0;

  return (
    <div className="space-y-4 rounded-2xl border border-linha bg-superficie p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-grotesk text-titulo font-bold text-principal">
            {dados.placa}
          </p>
          <p className="text-corpo text-texto-secundario">
            {dados.modelo}
            {dados.cliente ? ` · ${dados.cliente}` : ""}
          </p>
        </div>
        <span className="rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-principal">
          {dados.pagamento}
        </span>
      </div>

      <ul className="divide-y divide-linha rounded-xl border border-linha">
        {dados.itens.map((item, i) => (
          <li
            key={`${item.descricao}-${i}`}
            className="flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <span className="text-corpo text-texto">
              {item.quantidade > 1 ? `${item.quantidade}× ` : ""}
              {item.descricao}
            </span>
            <ValorReais
              centavos={item.precoCentavos * item.quantidade}
              className="text-texto"
            />
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <Linha rotulo="Total" destaque>
          <ValorReais centavos={dados.totalCentavos} tamanho="titulo" />
        </Linha>
        {mostrarDinheiro ? (
          <>
            <Linha rotulo="Custo">
              <ValorReais centavos={dados.custoCentavos} />
            </Linha>
            <Linha rotulo="Taxa">
              <ValorReais centavos={dados.taxaCentavos} />
            </Linha>
            <Linha rotulo="Lucro" destaque>
              <ValorReais
                centavos={lucroCentavos}
                tamanho="titulo"
                className={prejuizo ? "text-erro" : "text-confirmado"}
              />
            </Linha>
          </>
        ) : null}
      </div>

      {mostrarDinheiro && prejuizo ? (
        <div className="flex items-center gap-2 rounded-xl bg-atencao-fundo px-3 py-2 text-legenda text-atencao">
          <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          Atenção: esse serviço está dando prejuízo.
        </div>
      ) : null}

      {campoCustoPeca ? (
        <div className="space-y-1.5 rounded-xl border border-linha bg-fundo p-3">
          <label
            htmlFor="custo-peca-comprada"
            className="block text-legenda font-medium text-texto"
          >
            Comprou alguma peça pra esse serviço?
          </label>
          <p className="text-legenda text-texto-secundario">
            Informe quanto você pagou. Só o patrão vê esse valor.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-corpo text-texto-secundario">R$</span>
            <input
              id="custo-peca-comprada"
              inputMode="decimal"
              placeholder="0,00"
              className="h-12 flex-1 rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="principal"
          className="flex-1"
          onClick={onConfirmar}
          disabled={salvando}
        >
          {salvando ? "Salvando..." : "Cadastrar agora"}
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

function Linha({
  rotulo,
  children,
  destaque = false,
}: {
  rotulo: string;
  children: ReactNode;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          "text-corpo",
          destaque ? "font-medium text-texto" : "text-texto-secundario",
        )}
      >
        {rotulo}
      </span>
      {children}
    </div>
  );
}
