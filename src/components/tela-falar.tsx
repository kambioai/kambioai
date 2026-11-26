"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Keyboard,
  Mic,
  Square,
  TriangleAlert,
} from "lucide-react";

import {
  CartaoConfirmacao,
  type DadosConfirmacao,
} from "@/components/cartao-confirmacao/cartao-confirmacao";
import { CartaoLembrete } from "@/components/cartao-confirmacao/cartao-lembrete";
import { Button } from "@/components/ui/button";
import { Esqueleto } from "@/components/ui/esqueleto";

interface CartaoVoz {
  placa: string | null;
  modelo: string | null;
  cliente: string | null;
  pagamentoRotulo: string;
  itens: { descricao: string; quantidade: number; precoCentavos: number }[];
  totalCentavos: number;
  custoTotalCentavos: number;
  taxaCentavos: number;
  lucroCentavos: number;
  mostrarDinheiro: boolean;
  transcricao: string;
  avisos: string[];
  intent: unknown;
}

interface CartaoLembreteDados {
  texto: string;
  quandoISO: string;
  quandoRotulo: string;
  placa: string | null;
  avisos: string[];
}

type Modo =
  | "inicio"
  | "gravando"
  | "processando"
  | "cartao"
  | "lembrete"
  | "salvo";

/**
 * Registro por voz (CLAUDE.md §6). Grava no navegador (até 60 s) ou digita →
 * servidor interpreta (Gemini) e calcula → cartão de confirmação → grava a OS.
 * Tudo que funciona por voz também funciona digitando.
 */
export function TelaFalar({ dica }: { dica: string }) {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("inicio");
  const [erro, setErro] = useState<string | null>(null);
  const [cartao, setCartao] = useState<CartaoVoz | null>(null);
  const [lembrete, setLembrete] = useState<CartaoLembreteDados | null>(null);
  const [digitando, setDigitando] = useState(false);
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [msgSalvo, setMsgSalvo] = useState("A OS foi salva e o estoque foi atualizado.");

  const gravadorRef = useRef<MediaRecorder | null>(null);
  const pedacosRef = useRef<Blob[]>([]);

  async function iniciarGravacao() {
    setErro(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      pedacosRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) pedacosRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(pedacosRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        await enviar({ audio: blob });
      };
      gravadorRef.current = mr;
      mr.start();
      setModo("gravando");
      window.setTimeout(() => {
        if (gravadorRef.current?.state === "recording")
          gravadorRef.current.stop();
      }, 60_000);
    } catch {
      setErro("Não consegui acessar o microfone. Você pode digitar abaixo.");
      setDigitando(true);
    }
  }

  function pararGravacao() {
    if (gravadorRef.current?.state === "recording") gravadorRef.current.stop();
    setModo("processando");
  }

  async function enviar(entrada: { audio?: Blob; texto?: string }) {
    setModo("processando");
    setErro(null);
    try {
      const fd = new FormData();
      if (entrada.audio) fd.append("audio", entrada.audio, "fala.webm");
      if (entrada.texto) fd.append("texto", entrada.texto);
      const res = await fetch("/api/voz", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Não entendi. Tente de novo ou digite.");
        setModo("inicio");
        return;
      }
      if (json.tipo === "lembrete") {
        setLembrete(json.lembrete as CartaoLembreteDados);
        setModo("lembrete");
        return;
      }
      setCartao(json.cartao as CartaoVoz);
      setModo("cartao");
    } catch {
      setErro("Falha de conexão. Tente de novo.");
      setModo("inicio");
    }
  }

  async function confirmar() {
    if (!cartao) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch("/api/voz/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: cartao.intent,
          origem: digitando ? "manual" : "voz",
        }),
      });
      if (!res.ok) {
        setErro("Não consegui salvar. Tente de novo.");
        setSalvando(false);
        return;
      }
      setSalvando(false);
      setMsgSalvo("A OS foi salva e o estoque foi atualizado.");
      setModo("salvo");
      router.refresh();
    } catch {
      setErro("Falha de conexão ao salvar.");
      setSalvando(false);
    }
  }

  async function confirmarLembrete() {
    if (!lembrete) return;
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch("/api/lembrete/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: lembrete.texto,
          quandoISO: lembrete.quandoISO,
          placa: lembrete.placa,
        }),
      });
      if (!res.ok) {
        setErro("Não consegui salvar o lembrete. Tente de novo.");
        setSalvando(false);
        return;
      }
      setSalvando(false);
      setMsgSalvo(
        `Lembrete criado para ${lembrete.quandoRotulo}. Você será avisado.`,
      );
      setModo("salvo");
      router.refresh();
    } catch {
      setErro("Falha de conexão ao salvar.");
      setSalvando(false);
    }
  }

  function recomecar() {
    setCartao(null);
    setLembrete(null);
    setTexto("");
    setErro(null);
    setDigitando(false);
    setModo("inicio");
  }

  // ----- Cartão -----
  if (modo === "cartao" && cartao) {
    const dados: DadosConfirmacao = {
      placa: cartao.placa ?? "Sem placa",
      modelo: cartao.modelo ?? "",
      cliente: cartao.cliente,
      pagamento: cartao.pagamentoRotulo,
      itens: cartao.itens,
      totalCentavos: cartao.totalCentavos,
      custoCentavos: cartao.custoTotalCentavos,
      taxaCentavos: cartao.taxaCentavos,
    };
    return (
      <section className="space-y-4">
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Confere aí
        </h1>
        {cartao.avisos.length > 0 ? (
          <ul className="space-y-1 rounded-xl bg-atencao-fundo px-3 py-2">
            {cartao.avisos.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-legenda text-atencao"
              >
                <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
        ) : null}
        {erro ? (
          <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
            {erro}
          </p>
        ) : null}
        <CartaoConfirmacao
          dados={dados}
          mostrarDinheiro={cartao.mostrarDinheiro}
          onConfirmar={confirmar}
          onCorrigir={recomecar}
          salvando={salvando}
        />
      </section>
    );
  }

  // ----- Cartão de lembrete -----
  if (modo === "lembrete" && lembrete) {
    return (
      <section className="space-y-4">
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Confere aí
        </h1>
        {lembrete.avisos.length > 0 ? (
          <ul className="space-y-1 rounded-xl bg-atencao-fundo px-3 py-2">
            {lembrete.avisos.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-legenda text-atencao"
              >
                <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                {a}
              </li>
            ))}
          </ul>
        ) : null}
        {erro ? (
          <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
            {erro}
          </p>
        ) : null}
        <CartaoLembrete
          dados={{
            texto: lembrete.texto,
            quandoRotulo: lembrete.quandoRotulo,
            placa: lembrete.placa,
          }}
          onConfirmar={confirmarLembrete}
          onCorrigir={recomecar}
          salvando={salvando}
        />
      </section>
    );
  }

  // ----- Salvo -----
  if (modo === "salvo") {
    return (
      <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-5 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-confirmado/10 text-confirmado">
          <CheckCircle2 className="h-9 w-9" strokeWidth={2} aria-hidden="true" />
        </div>
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Registrado!
        </h1>
        <p className="max-w-sm text-corpo text-texto-secundario">{msgSalvo}</p>
        <Button onClick={recomecar}>Registrar outro</Button>
      </section>
    );
  }

  // ----- Processando -----
  if (modo === "processando") {
    return (
      <section className="space-y-4">
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Entendendo...
        </h1>
        <Esqueleto className="h-28 w-full rounded-2xl" />
        <Esqueleto className="h-40 w-full rounded-2xl" />
      </section>
    );
  }

  // ----- Início / gravando -----
  return (
    <section className="flex min-h-[60dvh] flex-col items-center justify-center gap-6 text-center">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Falar
      </h1>
      <p className="max-w-sm text-corpo text-texto-secundario">{dica}</p>

      {erro ? (
        <p className="max-w-sm rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}

      {modo === "gravando" ? (
        <button
          type="button"
          onClick={pararGravacao}
          aria-label="Parar gravação"
          className="grid h-24 w-24 animate-pulse place-items-center rounded-full bg-destaque text-white shadow-lg shadow-destaque/30"
        >
          <Square className="h-9 w-9" fill="currentColor" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={iniciarGravacao}
          aria-label="Começar a falar"
          className="grid h-24 w-24 place-items-center rounded-full bg-destaque text-white shadow-lg shadow-destaque/30 outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-destaque focus-visible:ring-offset-2"
        >
          <Mic className="h-10 w-10" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <p className="text-legenda text-texto-secundario">
        {modo === "gravando" ? "Toque para parar" : "Toque e fale"}
      </p>

      {/* Digitar */}
      {digitando ? (
        <div className="w-full max-w-sm space-y-2">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder='Ex.: "Honda CG placa ABC1D23, troquei a pastilha, 150 no crédito em 2x"'
            className="w-full rounded-xl border border-linha bg-superficie p-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
          />
          <Button
            className="w-full"
            onClick={() => texto.trim() && enviar({ texto })}
            disabled={texto.trim() === ""}
          >
            Interpretar
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDigitando(true)}
          className="inline-flex items-center gap-2 text-corpo font-medium text-principal outline-none hover:underline focus-visible:underline"
        >
          <Keyboard className="h-5 w-5" aria-hidden="true" />
          Prefiro digitar
        </button>
      )}
    </section>
  );
}
