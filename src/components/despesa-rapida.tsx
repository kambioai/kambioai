"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { registrarDespesa } from "@/server/operacao";

/** Lançar despesa do dia (só patrão). Botão que abre um formulário rápido. */
export function DespesaRapida() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function salvar() {
    const centavos = Math.round(Number(valor.replace(",", ".")) * 100);
    if (descricao.trim() === "" || !centavos || centavos <= 0) {
      setErro("Informe a descrição e um valor.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const r = await registrarDespesa({
      descricao,
      valorCentavos: centavos,
      categoria,
    });
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setDescricao("");
    setValor("");
    setCategoria("");
    setOk(true);
    setTimeout(() => setOk(false), 2500);
    router.refresh();
  }

  if (!aberto) {
    return (
      <Button
        variant="secundario"
        className="w-full"
        onClick={() => setAberto(true)}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Lançar despesa
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-linha bg-superficie p-4">
      <p className="font-grotesk font-bold text-principal">Nova despesa</p>
      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      {ok ? (
        <p className="flex items-center gap-2 rounded-xl bg-confirmado/10 px-3 py-2 text-legenda font-medium text-confirmado">
          <Check className="h-4 w-4" aria-hidden="true" /> Despesa lançada!
        </p>
      ) : null}
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição (ex.: almoço da equipe)"
        className={entrada}
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-corpo text-texto-secundario">
            R$
          </span>
          <input
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            aria-label="Valor"
            className={entrada + " pl-10"}
          />
        </div>
        <input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoria"
          aria-label="Categoria"
          className={entrada + " flex-1"}
        />
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
        <Button variant="secundario" onClick={() => setAberto(false)}>
          Fechar
        </Button>
      </div>
    </div>
  );
}

const entrada =
  "h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal";
