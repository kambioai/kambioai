import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerResumoPainel, listarOrdens } from "@/lib/dados";
import { rotuloStatus } from "@/lib/rotulos";

export default async function Painel() {
  const [resumo, ordens] = await Promise.all([
    lerResumoPainel(),
    listarOrdens(),
  ]);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Painel
        </h1>
        <span className="text-legenda text-texto-secundario">
          dados de exemplo
        </span>
      </div>

      <Cartao variante="lucro">
        <CartaoTitulo className="text-white/80">Lucro de hoje</CartaoTitulo>
        <ValorReais centavos={resumo.lucroCentavos} tamanho="painel" />
      </Cartao>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Cartao>
          <CartaoTitulo>Entrou</CartaoTitulo>
          <ValorReais
            centavos={resumo.faturamentoCentavos}
            tamanho="titulo"
            className="text-principal"
          />
        </Cartao>
        <Cartao>
          <CartaoTitulo>Custos</CartaoTitulo>
          <ValorReais
            centavos={resumo.custosCentavos}
            tamanho="titulo"
            className="text-principal"
          />
        </Cartao>
        <Cartao>
          <CartaoTitulo>OS pagas</CartaoTitulo>
          <p className="font-grotesk text-titulo font-bold text-principal">
            {resumo.numeroOS}
          </p>
        </Cartao>
      </div>

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
