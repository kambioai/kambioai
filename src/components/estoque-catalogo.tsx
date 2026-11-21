"use client";

import { useState, type ReactNode } from "react";
import { Search } from "lucide-react";

import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import type { ItemCatalogoMock } from "@/lib/mock";
import { cn } from "@/lib/utils";
import type { TipoItem } from "@/types";

/** Estoque e catálogo do patrão: abas Produtos/Serviços, busca e filtro de estoque baixo. */
export function EstoqueCatalogo({ itens }: { itens: ItemCatalogoMock[] }) {
  const [aba, setAba] = useState<TipoItem>("produto");
  const [busca, setBusca] = useState("");
  const [soBaixo, setSoBaixo] = useState(false);

  const termo = busca.trim().toLowerCase();
  const lista = itens
    .filter((i) => i.tipo === aba)
    .filter((i) => i.nome.toLowerCase().includes(termo))
    .filter((i) =>
      soBaixo && aba === "produto" ? i.estoque <= i.estoqueMinimo : true,
    );

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
          aria-label="Buscar no catálogo"
          placeholder="Buscar..."
          className="h-12 w-full rounded-xl border border-linha bg-superficie pl-10 pr-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
        />
      </div>

      {aba === "produto" ? (
        <label className="flex items-center gap-2 text-corpo text-texto-secundario">
          <input
            type="checkbox"
            checked={soBaixo}
            onChange={(e) => setSoBaixo(e.target.checked)}
            className="h-4 w-4 accent-principal"
          />
          Só estoque baixo
        </label>
      ) : null}

      {lista.length === 0 ? (
        <EstadoVazio
          titulo="Nada encontrado"
          mensagem="Ajuste a busca ou o filtro para ver os itens."
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((item) => (
            <ItemLinha key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemLinha({ item }: { item: ItemCatalogoMock }) {
  const lucroCentavos = item.precoCentavos - item.custoCentavos;
  const lucroPercent =
    item.precoCentavos > 0
      ? Math.round((lucroCentavos / item.precoCentavos) * 100)
      : 0;
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
      <dl className="mt-3 grid grid-cols-3 gap-2 text-legenda">
        <Campo rotulo="Custo">
          <ValorReais centavos={item.custoCentavos} className="text-texto" />
        </Campo>
        <Campo rotulo="Preço">
          <ValorReais centavos={item.precoCentavos} className="text-texto" />
        </Campo>
        <Campo rotulo="Lucro">
          <span className="font-medium text-confirmado">
            <ValorReais centavos={lucroCentavos} /> ({lucroPercent}%)
          </span>
        </Campo>
      </dl>
    </li>
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-texto-secundario">{rotulo}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
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
