"use client";

import { useState, type ReactNode } from "react";
import { Check, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import type { ItemCatalogoFuncionario } from "@/lib/dados";
import { avisarFalta as avisarFaltaAcao } from "@/server/funcionario";
import { cn } from "@/lib/utils";
import type { TipoItem } from "@/types";

/**
 * Estoque do FUNCIONÁRIO: consulta de quantidade e preço de venda — nunca custo
 * nem lucro (CLAUDE.md §11). O funcionário não ajusta estoque; só **avisa falta**
 * pro patrão. Os dados chegam já sem as colunas de dinheiro (ver src/lib/dados).
 */
export function EstoqueFuncionario({
  itens,
}: {
  itens: ItemCatalogoFuncionario[];
}) {
  const [aba, setAba] = useState<TipoItem>("produto");
  const [busca, setBusca] = useState("");
  const [avisados, setAvisados] = useState<Set<string>>(new Set());
  const [ocupado, setOcupado] = useState<string | null>(null);

  const termo = busca.trim().toLowerCase();
  const lista = itens
    .filter((i) => i.tipo === aba)
    .filter((i) => i.nome.toLowerCase().includes(termo));

  async function avisarFalta(id: string, nome: string) {
    setOcupado(id);
    const r = await avisarFaltaAcao({ nome });
    setOcupado(null);
    if (r.ok) setAvisados((s) => new Set(s).add(id));
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Tipo de item">
        <Aba ativa={aba === "produto"} onClick={() => setAba("produto")}>
          Produtos
        </Aba>
        <Aba ativa={aba === "servico"} onClick={() => setAba("servico")}>
          Serviços
        </Aba>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-secundario"
          aria-hidden="true"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar no estoque"
          placeholder="Buscar..."
          className="h-12 w-full rounded-xl border border-linha bg-superficie pl-10 pr-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
        />
      </div>

      {lista.length === 0 ? (
        <EstadoVazio
          titulo="Nada encontrado"
          mensagem="Ajuste a busca para ver os itens."
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((item) => (
            <ItemLinha
              key={item.id}
              item={item}
              avisado={avisados.has(item.id)}
              ocupado={ocupado === item.id}
              onAvisar={() => avisarFalta(item.id, item.nome)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemLinha({
  item,
  avisado,
  ocupado,
  onAvisar,
}: {
  item: ItemCatalogoFuncionario;
  avisado: boolean;
  ocupado: boolean;
  onAvisar: () => void;
}) {
  const baixo = item.tipo === "produto" && item.estoque <= item.estoqueMinimo;

  return (
    <li className="rounded-2xl border border-linha bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-texto">{item.nome}</p>
        {item.tipo === "produto" ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-legenda font-medium",
              baixo
                ? "bg-atencao-fundo text-atencao"
                : "bg-fundo text-principal",
            )}
          >
            {item.estoque} em estoque
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-legenda text-texto-secundario">Preço de venda</p>
          <ValorReais
            centavos={item.precoCentavos}
            tamanho="titulo"
            className="text-principal"
          />
        </div>
        {item.tipo === "produto" ? (
          avisado ? (
            <span className="inline-flex items-center gap-1 text-legenda font-medium text-confirmado">
              <Check className="h-4 w-4" aria-hidden="true" />
              Falta avisada
            </span>
          ) : (
            <Button
              variant="secundario"
              size="sm"
              onClick={onAvisar}
              disabled={ocupado}
            >
              {ocupado ? "Avisando..." : "Avisar falta"}
            </Button>
          )
        ) : null}
      </div>
    </li>
  );
}

function Aba({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-corpo font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-principal",
        ativa
          ? "bg-principal text-white"
          : "border border-linha bg-superficie text-texto-secundario hover:text-principal",
      )}
    >
      {children}
    </button>
  );
}
