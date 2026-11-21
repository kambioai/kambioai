import { CreditCard } from "lucide-react";

import { TelaPlaceholder } from "@/components/tela-placeholder";

export default function PlanosAdmin() {
  return (
    <TelaPlaceholder
      titulo="Planos"
      descricao="Planos e preços, cupons e preço de fundador."
      fasePrevista="a Fase 5"
      icone={CreditCard}
    />
  );
}
