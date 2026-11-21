import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { Esqueleto } from "@/components/ui/esqueleto";
import { BotaoFalar } from "@/components/botao-falar/botao-falar";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { DemoAvisoDesfazer } from "./demo-aviso";

export const metadata = {
  title: "Componentes — Kambio",
};

const paleta = [
  { nome: "Principal", valor: "#0F2A4A", classe: "bg-principal" },
  { nome: "Destaque", valor: "#E8590C", classe: "bg-destaque" },
  { nome: "Fundo", valor: "#F3F5F8", classe: "bg-fundo" },
  { nome: "Superfície", valor: "#FFFFFF", classe: "bg-superficie" },
  { nome: "Texto", valor: "#0E1726", classe: "bg-texto" },
  { nome: "Texto 2", valor: "#556070", classe: "bg-texto-secundario" },
  { nome: "Linha", valor: "#E2E6EC", classe: "bg-linha" },
  { nome: "Confirmado", valor: "#0B7A4B", classe: "bg-confirmado" },
  { nome: "Atenção", valor: "#B54708", classe: "bg-atencao" },
  { nome: "Erro", valor: "#B42318", classe: "bg-erro" },
];

export default function Vitrine() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-linha bg-superficie/95 px-4 backdrop-blur">
        <Link href="/" aria-label="Início">
          <Logo tamanho={30} comNome />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1 text-legenda text-texto-secundario hover:text-principal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-6">
        <div className="space-y-1">
          <h1 className="font-grotesk text-titulo font-bold text-principal">
            Vitrine de componentes
          </h1>
          <p className="text-corpo text-texto-secundario">
            Os blocos reaproveitáveis do Kambio, para teste visual em 360px e no
            computador (Fase 1).
          </p>
        </div>

        <Secao titulo="Cores da marca">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {paleta.map((cor) => (
              <li
                key={cor.nome}
                className="overflow-hidden rounded-xl border border-linha bg-superficie"
              >
                <div className={`${cor.classe} h-12 w-full`} />
                <div className="px-3 py-2">
                  <p className="text-corpo font-medium text-texto">
                    {cor.nome}
                  </p>
                  <p className="text-legenda text-texto-secundario">
                    {cor.valor}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Secao>

        <Secao titulo="Botões">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="principal">Principal</Button>
            <Button variant="secundario">Secundário</Button>
            <Button variant="destaque">Destaque</Button>
            <Button variant="principal" disabled>
              Desabilitado
            </Button>
          </div>
        </Secao>

        <Secao titulo="Botão Falar">
          <div className="flex items-center gap-4">
            <BotaoFalar href="/patrao/falar" />
            <p className="text-corpo text-texto-secundario">
              Círculo laranja de 64px, o centro da navegação.
            </p>
          </div>
        </Secao>

        <Secao titulo="Cartões">
          <div className="grid gap-3 sm:grid-cols-2">
            <Cartao>
              <CartaoTitulo>Cartão padrão</CartaoTitulo>
              <p className="text-corpo text-texto">
                Branco, cantos 16px, borda leve.
              </p>
            </Cartao>
            <Cartao variante="lucro">
              <CartaoTitulo className="text-white/80">
                Lucro de hoje
              </CartaoTitulo>
              <ValorReais centavos={123456} tamanho="painel" />
            </Cartao>
          </div>
        </Secao>

        <Secao titulo="Valor em reais">
          <div className="flex flex-wrap items-end gap-6">
            <ValorReais
              centavos={123456}
              tamanho="painel"
              className="text-principal"
            />
            <ValorReais
              centavos={9000}
              tamanho="titulo"
              className="text-principal"
            />
            <ValorReais centavos={350} className="text-principal" />
          </div>
        </Secao>

        <Secao titulo="Estado vazio">
          <EstadoVazio
            titulo="Nenhuma OS ainda"
            mensagem="Toque em Falar pra registrar sua primeira OS."
            icone={Wrench}
            acao={<Button variant="principal">Registrar agora</Button>}
          />
        </Secao>

        <Secao titulo="Carregando (esqueleto)">
          <div className="space-y-3 rounded-2xl border border-linha bg-superficie p-5">
            <Esqueleto className="h-5 w-40" />
            <Esqueleto className="h-10 w-full" />
            <Esqueleto className="h-10 w-2/3" />
          </div>
        </Secao>

        <Secao titulo="Aviso com Desfazer">
          <DemoAvisoDesfazer />
        </Secao>
      </main>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-grotesk text-titulo font-bold text-principal">
        {titulo}
      </h2>
      {children}
    </section>
  );
}
