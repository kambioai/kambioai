import { redirect } from "next/navigation";

import { CascaAuth } from "@/components/auth/casca-auth";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { membroAtual } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/server";

// Onboarding real do patrão (CLAUDE.md §5b): cria a própria oficina e configura
// catálogo/estoque/custos/taxas. Se já concluiu, vai direto pro painel.
export default async function Comecar() {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/entrar");

  // Funcionário não configura oficina: vai direto pro Pátio.
  const membro = await membroAtual();
  if (membro?.papel === "funcionario") redirect("/funcionario/patio");

  const { data: emp } = await sb
    .from("empresas")
    .select("onboarding_completo")
    .limit(1)
    .maybeSingle();
  if (emp?.onboarding_completo) redirect("/patrao/painel");

  return (
    <CascaAuth
      titulo="Vamos configurar sua oficina"
      subtitulo="Poucos passos e você já registra a primeira venda."
      largura="larga"
    >
      <OnboardingWizard />
    </CascaAuth>
  );
}
