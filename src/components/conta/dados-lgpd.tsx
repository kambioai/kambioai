"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, ShieldAlert, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { excluirMinhaOficina } from "@/server/conta";

/**
 * Dados e privacidade (LGPD) na tela Conta. Exportar baixa um JSON; excluir
 * remove tudo em definitivo (pede a palavra de confirmação). Links para os
 * termos e a política de privacidade.
 */
export function DadosLgpd() {
  const [abrindo, setAbrindo] = useState(false);
  const [palavra, setPalavra] = useState("");
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function excluir() {
    setExcluindo(true);
    setErro(null);
    const r = await excluirMinhaOficina(palavra);
    if (!r.ok) {
      setErro(r.erro);
      setExcluindo(false);
      return;
    }
    // Conta sem oficina: volta pro login.
    window.location.assign("/entrar");
  }

  return (
    <Cartao className="space-y-4">
      <div>
        <CartaoTitulo>Seus dados</CartaoTitulo>
        <p className="mt-1 text-legenda text-texto-secundario">
          Baixe uma cópia ou exclua tudo em definitivo. Veja os{" "}
          <Link href="/termos" className="text-principal underline">
            Termos
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="text-principal underline">
            Privacidade
          </Link>
          .
        </p>
      </div>

      <Button asChild variant="secundario" className="w-full">
        <a href="/api/exportar" download>
          <Download className="h-5 w-5" aria-hidden="true" />
          Exportar meus dados (JSON)
        </a>
      </Button>

      <div className="rounded-xl border border-erro/30 bg-erro-fundo/40 p-3">
        <p className="flex items-center gap-2 text-legenda font-medium text-erro">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          Excluir a oficina
        </p>
        <p className="mt-1 text-legenda text-texto-secundario">
          Remove todos os dados e cancela a assinatura. Não dá para desfazer.
        </p>

        {erro ? (
          <p className="mt-2 rounded-lg bg-erro-fundo px-3 py-2 text-legenda text-erro">
            {erro}
          </p>
        ) : null}

        {!abrindo ? (
          <Button
            variant="secundario"
            size="sm"
            className="mt-3 border-erro/40 text-erro"
            onClick={() => setAbrindo(true)}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Excluir oficina e dados
          </Button>
        ) : (
          <div className="mt-3 space-y-2">
            <label htmlFor="confirmar-exclusao" className="block text-legenda text-texto">
              Digite <strong>EXCLUIR</strong> para confirmar:
            </label>
            <input
              id="confirmar-exclusao"
              value={palavra}
              onChange={(e) => setPalavra(e.target.value)}
              placeholder="EXCLUIR"
              className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-erro"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-erro hover:bg-erro/90"
                onClick={excluir}
                disabled={excluindo || palavra.trim().toUpperCase() !== "EXCLUIR"}
              >
                {excluindo ? "Excluindo..." : "Excluir em definitivo"}
              </Button>
              <Button
                variant="secundario"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setAbrindo(false);
                  setPalavra("");
                  setErro(null);
                }}
                disabled={excluindo}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </Cartao>
  );
}
