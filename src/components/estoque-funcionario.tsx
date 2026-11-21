"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";

import { AvisoDesfazer } from "@/components/aviso-desfazer/aviso-desfazer";
import { Button } from "@/components/ui/button";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import type { ItemCatalogoFuncionario } from "@/lib/dados";
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
  const [ultimoAviso, setUltimoAviso] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const termo = busca.trim().toLowerCase();
  const lista = itens
    .filter((i) => i.tipo === aba)
    .filter((i) => i.nome.toLowerCase().includes(termo));

  function avisarFalta(id: string, nome: string) {
    setAvisados((s) => new Set(s).add(id));
    setUltimoAviso({ id, nome });
  }

  function desfazer(id: string) {
    setAvisados((s) => {
      const novo = new Set(s);
      novo.delete(id);
      return novo;
    });
    setUltimoAviso(null);
  }

  return (
    <div className="space-y-4">
      {ultimoAviso ? (
        <AvisoDesfazer
          mensagem={`Falta de "${ultimoAviso.nome}" avisada ao patrão.`}
          aoDesfazer={() => desfazer(ultimoAviso.id)}
          aoFechar={() => setUltimoAviso(null)}
        />
      ) : null}

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
  onAvisar,
}: {
  item: ItemCatalogoFuncionario;
  avisado: boolean;
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
            <span className="text-legenda font-medium text-confirmado">
              Falta avisada
            </span>
          ) : (
            <Button variant="secundario" size="sm" onClick={onAvisar}>
              Avisar falta
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
