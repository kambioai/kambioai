import { Package } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function EstoquePatrao() {
  return (
    <TelaPlaceholder
      titulo="Estoque e catálogo"
      descricao="Produtos e serviços com custo, preço e lucro, quantidade e alerta de estoque baixo."
      fasePrevista="a Fase 2"
      icone={Package}
    />
  );
}
