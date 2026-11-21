import { Sparkles } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function UsoIaAdmin() {
  return (
    <TelaPlaceholder
      titulo="Uso da IA"
      descricao="Custo por empresa, taxa de correção do cartão e frases que falharam."
      fasePrevista="a Fase 5"
      icone={Sparkles}
    />
  );
}
