import { Users } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function EquipePatrao() {
  return (
    <TelaPlaceholder
      titulo="Equipe"
      descricao="Funcionários da oficina, convites e o que cada um registrou."
      fasePrevista="a Fase 2"
      icone={Users}
    />
  );
}
