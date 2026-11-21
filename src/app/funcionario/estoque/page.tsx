import { Package } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function EstoqueFuncionario() {
  return (
    <TelaPlaceholder
      titulo="Estoque"
      descricao="Consulta de quantidade e preço de venda (sem custo), com o botão de avisar falta."
      fasePrevista="a Fase 3"
      icone={Package}
    />
  );
}
