import { Megaphone } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function ComunicadosAdmin() {
  return (
    <TelaPlaceholder
      titulo="Comunicados"
      descricao="Avisos segmentados para as oficinas (novidades, manutenção, cobrança)."
      fasePrevista="a Fase 5"
      icone={Megaphone}
    />
  );
}
