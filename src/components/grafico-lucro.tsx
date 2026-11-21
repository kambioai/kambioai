"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

import type { PontoLucro } from "@/lib/dados";
import { formatarReais } from "@/lib/utils";

/** Gráfico de lucro por dia (últimos 7 dias) — Recharts. */
export function GraficoLucro({ dados }: { dados: PontoLucro[] }) {
  const data = dados.map((d) => ({
    rotulo: d.rotulo,
    lucro: d.lucroCentavos / 100,
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="#E2E6EC" />
          <XAxis
            dataKey="rotulo"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "#556070" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 12, fill: "#556070" }}
            tickFormatter={(v: number) => `R$${v}`}
          />
          <Tooltip cursor={{ fill: "#F3F5F8" }} content={<DicaLucro />} />
          <Bar dataKey="lucro" fill="#E8590C" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DicaLucro({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;
  const valor = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border border-linha bg-superficie px-3 py-2 text-legenda shadow-md">
      <p className="text-texto-secundario">{label}</p>
      <p className="font-medium text-texto">
        {formatarReais(Math.round(valor * 100))}
      </p>
    </div>
  );
}
