import { Building2 } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function EmpresasAdmin() {
  return (
    <TelaPlaceholder
      titulo="Empresas"
      descricao="Lista de oficinas, ficha de cada uma e ações (plano, cupom, bloqueio, suporte)."
      fasePrevista="a Fase 5"
      icone={Building2}
    />
  );
}
