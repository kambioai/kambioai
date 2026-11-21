"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { SeloStatus } from "@/components/admin/selo-status";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import type { EmpresaAdmin } from "@/lib/mock/admin";
import { rotuloSegmento } from "@/lib/rotulos";

/** Lista de empresas do admin, com busca por nome/cidade. Cada linha → ficha. */
export function ListaEmpresas({ empresas }: { empresas: EmpresaAdmin[] }) {
  const [busca, setBusca] = useState("");

  const termo = busca.trim().toLowerCase();
  const lista = empresas.filter(
    (e) =>
      e.nome.toLowerCase().includes(termo) ||
      e.cidade.toLowerCase().includes(termo),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-secundario"
          aria-hidden="true"
        />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar empresa"
          placeholder="Buscar por nome ou cidade..."
          className="h-12 w-full rounded-xl border border-linha bg-superficie pl-10 pr-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
        />
      </div>

      {lista.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma empresa"
          mensagem="Ajuste a busca para encontrar uma oficina."
        />
      ) : (
        <ul className="space-y-2">
          {lista.map((e) => (
            <li key={e.id}>
              <Link
                href={`/admin/empresas/${e.id}`}
                className="flex items-center gap-3 rounded-xl border border-linha bg-superficie p-4 outline-none hover:border-principal focus-visible:ring-2 focus-visible:ring-principal"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-texto">{e.nome}</p>
                  <p className="text-legenda text-texto-secundario">
                    {rotuloSegmento[e.segmento]} · {e.cidade} · Kambio {e.plano}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <ValorReais
                    centavos={e.mrrCentavos}
                    className="text-texto"
                  />
                  <p className="text-legenda text-texto-secundario">/mês</p>
                </div>
                <SeloStatus status={e.status} />
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-texto-secundario"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
