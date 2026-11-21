import {
  CartaoConfirmacao,
  type DadosConfirmacao,
} from "@/components/cartao-confirmacao/cartao-confirmacao";
import { TelaFalar } from "@/components/tela-falar";

const exemplo: DadosConfirmacao = {
  placa: "ABC1D23",
  modelo: "Honda CG 160",
  cliente: "João",
  pagamento: "Crédito 2×",
  itens: [
    { descricao: "Pastilha de freio", quantidade: 1, precoCentavos: 9000 },
    { descricao: "Alinhamento", quantidade: 1, precoCentavos: 6000 },
  ],
  totalCentavos: 15000,
  custoCentavos: 4000,
  taxaCentavos: 525,
};

export default function FalarPatrao() {
  return (
    <div className="space-y-8">
      <TelaFalar dica='Toque e fale, por exemplo: "Honda CG placa ABC1D23, troquei a pastilha e fiz alinhamento, 150 no crédito em 2 vezes".' />

      <section className="space-y-3">
        <h2 className="font-grotesk text-titulo font-bold text-principal">
          Como fica o cartão de confirmação
        </h2>
        <p className="text-legenda text-texto-secundario">
          Nada é salvo sem você conferir aqui. (Exemplo visual — a voz entra na
          Fase 8.)
        </p>
        <CartaoConfirmacao dados={exemplo} mostrarDinheiro />
      </section>
    </div>
  );
}
