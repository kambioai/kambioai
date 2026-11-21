import {
  CartaoConfirmacao,
  type DadosConfirmacao,
} from "@/components/cartao-confirmacao/cartao-confirmacao";
import { TelaFalar } from "@/components/tela-falar";

// Cartão do funcionário: preço de venda e total, SEM custo nem lucro.
// custo/taxa vão zerados — com mostrarDinheiro=false eles nem são exibidos.
const exemplo: DadosConfirmacao = {
  placa: "XYZ9K88",
  modelo: "Yamaha Factor 125",
  cliente: "Marcos",
  pagamento: "Dinheiro",
  itens: [
    { descricao: "Óleo 20W50", quantidade: 1, precoCentavos: 4500 },
    { descricao: "Troca de óleo", quantidade: 1, precoCentavos: 3000 },
  ],
  totalCentavos: 7500,
  custoCentavos: 0,
  taxaCentavos: 0,
};

export default function FalarFuncionario() {
  return (
    <div className="space-y-8">
      <TelaFalar dica='Toque e fale, por exemplo: "Yamaha placa XYZ9K88, troquei o óleo e a vela".' />

      <section className="space-y-3">
        <h2 className="font-grotesk text-titulo font-bold text-principal">
          Como fica o cartão de confirmação
        </h2>
        <p className="text-legenda text-texto-secundario">
          Nada é salvo sem você conferir aqui. Você vê o preço de venda e o
          total — nunca custo ou lucro. (Exemplo visual — a voz entra na Fase 8.)
        </p>
        <CartaoConfirmacao
          dados={exemplo}
          mostrarDinheiro={false}
          campoCustoPeca
        />
      </section>
    </div>
  );
}
