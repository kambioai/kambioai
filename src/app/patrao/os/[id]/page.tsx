import Link from "next/link";
import { ArrowLeft, FileX } from "lucide-react";

import { AcoesOS } from "@/components/os/acoes-os";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { buscarOrdem } from "@/lib/dados";
import { rotuloPagamento, rotuloStatus } from "@/lib/rotulos";

function diasLabel(dias: number): string {
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `Há ${dias} dias`;
}

export default async function OrdemDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const os = await buscarOrdem(id);

  return (
    <section className="space-y-5">
      <Link
        href="/patrao/painel"
        className="inline-flex items-center gap-1 text-legenda text-texto-secundario outline-none hover:text-principal focus-visible:text-principal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      {!os ? (
        <EstadoVazio
          titulo="OS não encontrada"
          mensagem="Essa ordem de serviço não existe ou foi removida."
          icone={FileX}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-grotesk text-titulo font-bold text-principal">
                {os.placa === "—" ? "Venda de balcão" : os.placa}
              </h1>
              <p className="text-corpo text-texto-secundario">
                {os.modelo || "Sem veículo"} · {diasLabel(os.diasAtras)}
              </p>
            </div>
            <span className="rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-principal">
              {rotuloStatus[os.status]}
            </span>
          </div>

          <Cartao>
            <CartaoTitulo>Itens</CartaoTitulo>
            <ul className="mt-1 divide-y divide-linha">
              {os.itens.map((it, i) => (
                <li
                  key={`${it.nome}-${i}`}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <span className="text-corpo text-texto">
                    {it.quantidade > 1 ? `${it.quantidade}× ` : ""}
                    {it.nome}
                  </span>
                  <ValorReais
                    centavos={it.precoCentavos * it.quantidade}
                    className="text-texto"
                  />
                </li>
              ))}
            </ul>
          </Cartao>

          <Cartao variante="lucro">
            <div className="flex items-center justify-between gap-3">
              <span className="text-corpo text-white/80">Total</span>
              <ValorReais
                centavos={os.totalCentavos}
                tamanho="titulo"
                className="text-white"
              />
            </div>
            <dl className="mt-3 space-y-1 text-corpo text-white/80">
              <Linha rotulo="Custo">
                <ValorReais centavos={os.custoCentavos} className="text-white" />
              </Linha>
              <Linha rotulo="Taxa">
                <ValorReais centavos={os.taxaCentavos} className="text-white" />
              </Linha>
              {os.formaPagamento ? (
                <Linha rotulo="Pagamento">
                  <span className="text-white">
                    {rotuloPagamento[os.formaPagamento]}
                  </span>
                </Linha>
              ) : null}
              <Linha rotulo="Lucro">
                <ValorReais
                  centavos={
                    os.totalCentavos - os.custoCentavos - os.taxaCentavos
                  }
                  tamanho="titulo"
                  className="text-white"
                />
              </Linha>
            </dl>
          </Cartao>

          <AcoesOS osId={os.id} status={os.status} />
        </>
      )}
    </section>
  );
}

function Linha({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt>{rotulo}</dt>
      <dd>{children}</dd>
    </div>
  );
}
