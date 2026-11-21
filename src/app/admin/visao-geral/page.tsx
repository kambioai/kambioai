import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CartaoEstatistica } from "@/components/admin/cartao-estatistica";
import { GraficoMrr } from "@/components/admin/grafico-mrr";
import { SeloStatus } from "@/components/admin/selo-status";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerVisaoGeralAdmin } from "@/lib/dados/admin";
import { rotuloStatusAssinatura } from "@/lib/rotulos";

export default async function VisaoGeralAdmin() {
  const dados = await lerVisaoGeralAdmin();
  const maiorStatus = Math.max(...dados.porStatus.map((s) => s.quantidade), 1);

  return (
    <section className="space-y-6">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Visão geral
      </h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoEstatistica
          rotulo="Receita recorrente (MRR)"
          valor={<ValorReais centavos={dados.mrrCentavos} tamanho="painel" />}
          legenda="Assinaturas ativas"
          variante="lucro"
        />
        <CartaoEstatistica
          rotulo="Empresas ativas"
          valor={`${dados.ativas}`}
          legenda={`de ${dados.totalEmpresas} no total`}
        />
        <CartaoEstatistica
          rotulo="Custo de IA / mês"
          valor={
            <ValorReais centavos={dados.custoIaMesCentavos} tamanho="painel" />
          }
          legenda="Soma de todas as oficinas"
        />
        <CartaoEstatistica
          rotulo="Margem (MRR − IA)"
          valor={<ValorReais centavos={dados.margemCentavos} tamanho="painel" />}
          legenda="Antes dos demais custos"
        />
      </div>

      <Cartao>
        <CartaoTitulo>Receita recorrente por mês</CartaoTitulo>
        <GraficoMrr dados={dados.mrrPorMes} />
      </Cartao>

      <div className="grid gap-4 lg:grid-cols-2">
        <Cartao>
          <CartaoTitulo>Empresas por status</CartaoTitulo>
          <ul className="mt-3 space-y-3">
            {dados.porStatus.map((s) => (
              <li key={s.status}>
                <div className="flex items-center justify-between text-corpo">
                  <span className="text-texto">
                    {rotuloStatusAssinatura[s.status]}
                  </span>
                  <span className="font-medium text-texto">{s.quantidade}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-fundo">
                  <div
                    className="h-full rounded-full bg-principal"
                    style={{ width: `${(s.quantidade / maiorStatus) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Cartao>

        <Cartao>
          <CartaoTitulo>Empresas em risco</CartaoTitulo>
          <ul className="mt-3 space-y-2">
            {dados.emRisco.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/empresas/${e.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-linha p-3 outline-none hover:border-principal focus-visible:ring-2 focus-visible:ring-principal"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-texto">
                      {e.nome}
                    </span>
                    <span className="block text-legenda text-texto-secundario">
                      Último acesso há {e.ultimoAcessoDias}{" "}
                      {e.ultimoAcessoDias === 1 ? "dia" : "dias"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <SeloStatus status={e.status} />
                    <ArrowRight
                      className="h-4 w-4 text-texto-secundario"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>
    </section>
  );
}
