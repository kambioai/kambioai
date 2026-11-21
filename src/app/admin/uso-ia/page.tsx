import { MessageSquareWarning } from "lucide-react";

import { CartaoEstatistica } from "@/components/admin/cartao-estatistica";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerUsoIaAdmin } from "@/lib/dados/admin";

function diasLabel(dias: number): string {
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export default async function UsoIaAdmin() {
  const dados = await lerUsoIaAdmin();

  return (
    <section className="space-y-6">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Uso da IA
      </h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <CartaoEstatistica
          rotulo="Custo de IA no mês"
          valor={<ValorReais centavos={dados.custoMesCentavos} tamanho="painel" />}
          legenda="Somando todas as oficinas"
        />
        <CartaoEstatistica
          rotulo="Taxa de correção média"
          valor={`${Math.round(dados.taxaCorrecaoMedia * 100)}%`}
          legenda="Das OS o patrão ajustou o cartão"
        />
      </div>

      <Cartao>
        <CartaoTitulo>Custo e correção por empresa</CartaoTitulo>
        <ul className="mt-2 divide-y divide-linha">
          {dados.porEmpresa.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span className="min-w-0 truncate text-corpo text-texto">
                {e.nome}
              </span>
              <span className="flex shrink-0 items-center gap-4 text-legenda">
                <span className="text-texto-secundario">
                  correção {Math.round(e.taxaCorrecao * 100)}%
                </span>
                <ValorReais
                  centavos={e.custoMesCentavos}
                  className="text-texto"
                />
              </span>
            </li>
          ))}
        </ul>
      </Cartao>

      <div>
        <h2 className="mb-3 font-grotesk text-corpo font-bold text-principal">
          Frases que a IA não entendeu
        </h2>
        {dados.frasesFalharam.length === 0 ? (
          <EstadoVazio
            titulo="Nada falhou"
            mensagem="Nenhuma frase ficou sem interpretação no período."
            icone={MessageSquareWarning}
          />
        ) : (
          <ul className="space-y-2">
            {dados.frasesFalharam.map((f) => (
              <li
                key={f.id}
                className="rounded-xl border border-linha bg-superficie p-4"
              >
                <p className="text-corpo text-texto">“{f.frase}”</p>
                <p className="mt-1 text-legenda text-texto-secundario">
                  {f.empresa} · {f.motivo} · {diasLabel(f.diasAtras)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
