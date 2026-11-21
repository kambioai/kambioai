import Link from "next/link";
import { Check } from "lucide-react";

import { CascaAuth } from "@/components/auth/casca-auth";
import { ValorReais } from "@/components/valor-reais/valor-reais";

interface Plano {
  nome: string;
  precoCentavos: number;
  destaque: boolean;
  itens: string[];
}

const planos: Plano[] = [
  {
    nome: "Básico",
    precoCentavos: 12990,
    destaque: false,
    itens: [
      "Registro por voz ilimitado pra você",
      "Painel, estoque, fechamento e histórico",
      "Alertas de estoque e retorno de cliente",
    ],
  },
  {
    nome: "PRO",
    precoCentavos: 17990,
    destaque: true,
    itens: [
      "Tudo do Básico",
      "2 funcionários inclusos",
      "Funcionário a mais por R$ 29,90/mês",
    ],
  },
];

export default function EscolherPlano() {
  return (
    <CascaAuth
      titulo="Escolha seu plano"
      subtitulo="Dá pra trocar de plano depois, quando quiser."
      largura="larga"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={
              plano.destaque
                ? "rounded-2xl border-2 border-principal bg-superficie p-5"
                : "rounded-2xl border border-linha bg-superficie p-5"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-grotesk text-titulo font-bold text-principal">
                Kambio {plano.nome}
              </h2>
              {plano.destaque ? (
                <span className="rounded-full bg-destaque px-3 py-1 text-legenda font-medium text-white">
                  Mais popular
                </span>
              ) : null}
            </div>

            <p className="mt-2">
              <ValorReais
                centavos={plano.precoCentavos}
                tamanho="titulo"
                className="text-texto"
              />
              <span className="text-corpo text-texto-secundario">/mês</span>
            </p>

            <ul className="mt-4 space-y-2">
              {plano.itens.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-corpo text-texto"
                >
                  <Check
                    className="mt-0.5 h-5 w-5 shrink-0 text-confirmado"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/comecar"
              className={
                plano.destaque
                  ? "mt-5 flex h-[52px] w-full items-center justify-center rounded-lg bg-principal px-5 text-corpo font-medium text-white outline-none transition-colors hover:bg-principal/90 focus-visible:ring-2 focus-visible:ring-principal focus-visible:ring-offset-2"
                  : "mt-5 flex h-[52px] w-full items-center justify-center rounded-lg border border-linha bg-superficie px-5 text-corpo font-medium text-principal outline-none transition-colors hover:bg-fundo focus-visible:ring-2 focus-visible:ring-principal focus-visible:ring-offset-2"
              }
            >
              Assinar o {plano.nome}
            </Link>
          </div>
        ))}
      </div>

      <p className="mt-5 text-center text-legenda text-texto-secundario">
        A assinatura é no cartão. Pagamento de verdade entra na Fase 11 — aqui é
        só pra você ver o fluxo.
      </p>
    </CascaAuth>
  );
}
