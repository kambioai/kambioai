"use client";

import { EstadoErro } from "@/components/estado-erro";

export default function Erro({ reset }: { reset: () => void }) {
  return <EstadoErro reset={reset} />;
}
