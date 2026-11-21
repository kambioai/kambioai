import { Wallet } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function FechamentoPatrao() {
  return (
    <TelaPlaceholder
      titulo="Fechamento do dia"
      descricao="Conferência do caixa por forma de pagamento (bateu, sobrou, faltam) e resumo do dia."
      fasePrevista="a Fase 2"
      icone={Wallet}
    />
  );
}
