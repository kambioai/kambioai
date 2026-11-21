import { LayoutDashboard } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function VisaoGeralAdmin() {
  return (
    <TelaPlaceholder
      titulo="Visão geral"
      descricao="Receita recorrente, empresas por status, custo de IA e empresas em risco."
      fasePrevista="a Fase 5"
      icone={LayoutDashboard}
    />
  );
}
