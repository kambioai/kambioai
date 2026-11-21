import { FechamentoForm } from "@/components/fechamento-form";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerFechamentoHoje } from "@/lib/dados";

export default async function Fechamento() {
  const fechamento = await lerFechamentoHoje();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Fechamento do dia
      </h1>

      <Cartao variante="lucro">
        <CartaoTitulo className="text-white/80">
          Total do dia (sistema)
        </CartaoTitulo>
        <ValorReais centavos={fechamento.totalCentavos} tamanho="painel" />
      </Cartao>

      {fechamento.porForma.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma venda hoje"
          mensagem="Quando houver vendas no dia, a conferência do caixa aparece aqui."
        />
      ) : (
        <div className="space-y-3">
          <h2 className="font-grotesk text-titulo font-bold text-principal">
            Confira o caixa
          </h2>
          <p className="text-legenda text-texto-secundario">
            Digite quanto você contou em cada forma de pagamento.
          </p>
          <FechamentoForm linhas={fechamento.porForma} />
        </div>
      )}

      <Cartao>
        <CartaoTitulo>Por quem registrou</CartaoTitulo>
        <ul className="mt-2 space-y-2">
          {fechamento.porAutor.map((a) => (
            <li
              key={a.autor}
              className="flex items-center justify-between gap-3 text-corpo"
            >
              <span className="text-texto">
                {a.autor}
                <span className="ml-2 text-legenda text-texto-secundario">
                  {a.quantidade} OS
                </span>
              </span>
              <ValorReais centavos={a.totalCentavos} className="text-texto" />
            </li>
          ))}
        </ul>
      </Cartao>

      <Button variant="principal" className="w-full">
        Fechar o caixa
      </Button>
    </section>
  );
}
