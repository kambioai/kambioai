import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerPlanosAdmin } from "@/lib/dados/admin";

export default async function PlanosAdmin() {
  const { planos, cupons, precoFundadorCentavos } = await lerPlanosAdmin();

  return (
    <section className="space-y-6">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Planos
      </h1>

      <div className="grid gap-3 sm:grid-cols-3">
        {planos.map((p) => (
          <Cartao key={p.nome}>
            <CartaoTitulo>{p.nome}</CartaoTitulo>
            <p>
              <ValorReais
                centavos={p.precoCentavos}
                tamanho="titulo"
                className="text-texto"
              />
              <span className="text-corpo text-texto-secundario">/mês</span>
            </p>
            <p className="mt-2 text-legenda text-texto-secundario">
              {p.descricao}
            </p>
            <p className="mt-3 text-corpo text-texto">
              <strong>{p.assinantes}</strong> assinando
            </p>
          </Cartao>
        ))}
      </div>

      <Cartao className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CartaoTitulo>Preço de fundador</CartaoTitulo>
          <p>
            <ValorReais
              centavos={precoFundadorCentavos}
              tamanho="titulo"
              className="text-texto"
            />
            <span className="text-corpo text-texto-secundario">/mês</span>
          </p>
          <p className="mt-1 text-legenda text-texto-secundario">
            Preço especial das primeiras oficinas do piloto.
          </p>
        </div>
        <Button variant="secundario" className="shrink-0">
          Editar preços
        </Button>
      </Cartao>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-grotesk text-corpo font-bold text-principal">
            Cupons
          </h2>
          <Button variant="secundario" size="sm">
            Novo cupom
          </Button>
        </div>
        <ul className="space-y-2">
          {cupons.map((c) => (
            <li
              key={c.codigo}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-linha bg-superficie p-4"
            >
              <div>
                <p className="font-grotesk font-bold text-principal">
                  {c.codigo}
                </p>
                <p className="text-legenda text-texto-secundario">
                  {c.descricao}
                </p>
              </div>
              <div className="text-right text-legenda text-texto-secundario">
                <p>{c.usos} usos</p>
                <p>Validade: {c.validade}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
