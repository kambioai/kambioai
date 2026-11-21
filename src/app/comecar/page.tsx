import { CascaAuth } from "@/components/auth/casca-auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import {
  listarCatalogoModelo,
  listarCustosFixos,
  listarTaxas,
} from "@/lib/dados";

// Onboarding do patrão (CLAUDE.md §5b): empresa → catálogo modelo → estoque →
// custos e taxas → convidar → primeira venda, com barra de progresso.
// Tudo fictício na Fase 4; a gravação real entra na Fase 7.
export default async function Comecar() {
  const [catalogo, custos, taxas] = await Promise.all([
    listarCatalogoModelo(),
    listarCustosFixos(),
    listarTaxas(),
  ]);

  return (
    <CascaAuth
      titulo="Vamos configurar sua oficina"
      subtitulo="Poucos passos e você já registra a primeira venda."
      largura="larga"
    >
      <OnboardingWizard
        catalogoInicial={catalogo}
        custosIniciais={custos}
        taxasIniciais={taxas}
      />
    </CascaAuth>
  );
}
