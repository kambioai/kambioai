import Link from "next/link";
import { Car, Package, TriangleAlert } from "lucide-react";

import { BuscaPlaca } from "@/components/busca-placa";
import { FiltrosPeriodo } from "@/components/filtros-periodo";
import { GraficoLucro } from "@/components/grafico-lucro";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { Button } from "@/components/ui/button";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import {
  lerContasDoMes,
  lerResumoPainel,
  listarAlertas,
  listarLucroPorDia,
  listarOrdens,
  listarOrdensAbertas,
  listarRanking,
  periodos,
  type Periodo,
} from "@/lib/dados";
import { rotuloStatus } from "@/lib/rotulos";

const CORES_BARRA = [
  "bg-principal",
  "bg-principal/75",
  "bg-principal/55",
  "bg-destaque",
  "bg-destaque/70",
];

export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const sp = await searchParams;
  const periodo: Periodo = periodos.some((p) => p.chave === sp.periodo)
    ? (sp.periodo as Periodo)
    : "7dias";

  const [resumo, lucroDia, ranking, alertas, contas, abertas, ordens] =
    await Promise.all([
      lerResumoPainel(periodo),
      listarLucroPorDia(),
      listarRanking(),
      listarAlertas(),
      lerContasDoMes(),
      listarOrdensAbertas(),
      listarOrdens(),
    ]);

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Painel
      </h1>

      <BuscaPlaca />
      <FiltrosPeriodo atual={periodo} base="/patrao/painel" />

      <Cartao variante="lucro">
        <CartaoTitulo className="text-white/80">Lucro no período</CartaoTitulo>
        <ValorReais centavos={resumo.lucroCentavos} tamanho="painel" />
      </Cartao>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Numero rotulo="Entrou" centavos={resumo.faturamentoCentavos} />
        <Numero rotulo="Custos" centavos={resumo.custosCentavos} />
        <Numero rotulo="Taxas" centavos={resumo.taxasCentavos} />
        <Numero rotulo="Despesas" centavos={resumo.despesasCentavos} />
        <Cartao>
          <CartaoTitulo>OS pagas</CartaoTitulo>
          <p className="font-grotesk text-titulo font-bold text-principal">
            {resumo.numeroOS}
          </p>
        </Cartao>
      </div>

      <Cartao>
        <CartaoTitulo>Lucro por dia (últimos 7 dias)</CartaoTitulo>
        <GraficoLucro dados={lucroDia} />
      </Cartao>

      {/* Contas do mês */}
      <Cartao>
        <div className="mb-3 flex items-center justify-between gap-3">
          <CartaoTitulo>Contas do mês</CartaoTitulo>
          <Button asChild variant="secundario" size="sm">
            <Link href="/patrao/conta">Editar custos</Link>
          </Button>
        </div>
        <p className="mb-2 font-grotesk text-titulo font-bold text-principal">
          <ValorReais centavos={contas.totalCentavos} />
        </p>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-fundo">
          {contas.itens.map((item, i) => (
            <div
              key={item.nome}
              className={CORES_BARRA[i % CORES_BARRA.length]}
              style={{
                width: `${(item.valorCentavos / contas.totalCentavos) * 100}%`,
              }}
              title={item.nome}
            />
          ))}
        </div>
        <ul className="mt-3 space-y-1">
          {contas.itens.map((item) => (
            <li
              key={item.nome}
              className="flex items-center justify-between gap-3 text-legenda"
            >
              <span className="text-texto-secundario">{item.nome}</span>
              <ValorReais
                centavos={item.valorCentavos}
                className="text-texto"
              />
            </li>
          ))}
        </ul>
      </Cartao>

      {/* Alertas */}
      <div className="space-y-2">
        <h2 className="font-grotesk text-titulo font-bold text-principal">
          Alertas
        </h2>
        {alertas.length === 0 ? (
          <EstadoVazio titulo="Sem alertas" mensagem="Tudo em dia por aqui." />
        ) : (
          <ul className="space-y-2">
            {alertas.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl bg-atencao-fundo px-4 py-3 text-corpo text-atencao"
              >
                {a.tipo === "estoque" ? (
                  <Package className="h-5 w-5 shrink-0" aria-hidden="true" />
                ) : (
                  <TriangleAlert
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {a.texto}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pátio */}
      <div className="space-y-2">
        <h2 className="font-grotesk text-titulo font-bold text-principal">
          Pátio
        </h2>
        {abertas.length === 0 ? (
          <EstadoVazio
            titulo="Pátio vazio"
            mensagem="Nenhuma OS em aberto agora."
            icone={Car}
          />
        ) : (
          <ul className="space-y-2">
            {abertas.map((os) => (
              <li
                key={os.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-linha bg-superficie px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-texto">
                    {os.placa} · {os.modelo}
                  </p>
                  <p className="text-legenda text-texto-secundario">
                    Registrado por {os.autor}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-principal">
                  {rotuloStatus[os.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Ranking de serviços */}
      <Cartao>
        <CartaoTitulo>Serviços que mais saem</CartaoTitulo>
        <ol className="mt-2 space-y-2">
          {ranking.map((s, i) => (
            <li
              key={s.nome}
              className="flex items-center justify-between gap-3 text-corpo"
            >
              <span className="text-texto">
                <span className="mr-2 text-texto-secundario">{i + 1}.</span>
                {s.nome}
              </span>
              <span className="font-medium text-texto-secundario">
                {s.quantidade}×
              </span>
            </li>
          ))}
        </ol>
      </Cartao>

      {/* Últimos lançamentos */}
      <div className="space-y-2">
        <h2 className="font-grotesk text-titulo font-bold text-principal">
          Últimos lançamentos
        </h2>
        <ul className="divide-y divide-linha overflow-hidden rounded-2xl border border-linha bg-superficie">
          {ordens.map((os) => (
            <li
              key={os.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-texto">
                  {os.placa} · {os.modelo}
                </p>
                <p className="text-legenda text-texto-secundario">
                  {rotuloStatus[os.status]}
                </p>
              </div>
              {os.totalCentavos > 0 ? (
                <ValorReais
                  centavos={os.totalCentavos}
                  className="text-principal"
                />
              ) : (
                <span className="text-legenda text-texto-secundario">—</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Numero({ rotulo, centavos }: { rotulo: string; centavos: number }) {
  return (
    <Cartao>
      <CartaoTitulo>{rotulo}</CartaoTitulo>
      <ValorReais
        centavos={centavos}
        tamanho="titulo"
        className="text-principal"
      />
    </Cartao>
  );
}
