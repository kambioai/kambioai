import { LifeBuoy } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function SuporteAdmin() {
  return (
    <TelaPlaceholder
      titulo="Suporte"
      descricao="Chamados das oficinas e o modo suporte (somente leitura, registrado)."
      fasePrevista="a Fase 5"
      icone={LifeBuoy}
    />
  );
}
