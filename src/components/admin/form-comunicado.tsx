"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Cartao } from "@/components/ui/cartao";
import { criarEnviarComunicado } from "@/server/admin";

type Publico = "todas" | "basico" | "pro";

/** Cria e envia um comunicado às oficinas (push ao patrão). */
export function FormComunicado() {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [publico, setPublico] = useState<Publico>("todas");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    setEnviando(true);
    setErro(null);
    setMsg(null);
    const r = await criarEnviarComunicado({ titulo, corpo, publico });
    setEnviando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setMsg(
      r.alcance > 0
        ? `Enviado — ${r.alcance} ${r.alcance === 1 ? "aparelho avisado" : "aparelhos avisados"}.`
        : "Comunicado salvo. Nenhum patrão com avisos ligados ainda.",
    );
    setTitulo("");
    setCorpo("");
    setPublico("todas");
    setAberto(false);
    router.refresh();
  }

  if (!aberto) {
    return (
      <div className="space-y-2">
        <Button size="sm" onClick={() => setAberto(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo comunicado
        </Button>
        {msg ? (
          <p className="rounded-lg bg-confirmado/10 px-3 py-2 text-legenda text-confirmado">
            {msg}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <Cartao className="space-y-3">
      {erro ? (
        <p className="rounded-lg bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <label htmlFor="com-titulo" className="block text-legenda font-medium text-texto">
          Título
        </label>
        <input
          id="com-titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Novidade no app"
          className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="com-corpo" className="block text-legenda font-medium text-texto">
          Mensagem
        </label>
        <textarea
          id="com-corpo"
          value={corpo}
          onChange={(e) => setCorpo(e.target.value)}
          rows={3}
          placeholder="O que você quer avisar às oficinas"
          className="w-full rounded-xl border border-linha bg-superficie p-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="com-publico" className="block text-legenda font-medium text-texto">
          Para quem
        </label>
        <select
          id="com-publico"
          value={publico}
          onChange={(e) => setPublico(e.target.value as Publico)}
          className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
        >
          <option value="todas">Todas as oficinas</option>
          <option value="basico">Plano Básico</option>
          <option value="pro">Plano PRO</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={enviar}
          disabled={enviando || titulo.trim().length < 3 || corpo.trim().length < 3}
        >
          {enviando ? "Enviando..." : "Enviar comunicado"}
        </Button>
        <Button
          variant="secundario"
          className="flex-1"
          onClick={() => setAberto(false)}
          disabled={enviando}
        >
          Cancelar
        </Button>
      </div>
    </Cartao>
  );
}
