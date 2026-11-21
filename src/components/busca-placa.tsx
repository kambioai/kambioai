"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Busca por placa no topo do Painel → ficha do veículo (histórico de OS). */
export function BuscaPlaca() {
  const router = useRouter();
  const [placa, setPlaca] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const p = placa.trim();
        if (p)
          router.push(`/patrao/veiculo/${encodeURIComponent(p.toUpperCase())}`);
      }}
      className="flex gap-2"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-secundario"
          aria-hidden="true"
        />
        <input
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
          aria-label="Buscar por placa"
          placeholder="Buscar placa (ex.: ABC1D23)"
          className="h-12 w-full rounded-xl border border-linha bg-superficie pl-10 pr-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
        />
      </div>
      <Button type="submit" className="h-12 shrink-0">
        Buscar
      </Button>
    </form>
  );
}
