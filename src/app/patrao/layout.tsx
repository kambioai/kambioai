import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AssinaturaBloqueada } from "@/components/assinatura/assinatura-bloqueada";
import { AvisoCobranca } from "@/components/assinatura/aviso-cobranca";
import { AppShell } from "@/components/navegacao/app-shell";
import { membroAtual } from "@/lib/permissoes";
import { avisoCobranca, nivelAcesso, type StatusAssinatura } from "@/lib/stripe/acesso";
import { criarClienteServidor } from "@/lib/supabase/server";

// Área do patrão. Exige vínculo ATIVO de patrão; funcionário é mandado pra área
// dele; sem vínculo volta pro login. Só libera com o onboarding completo
// (CLAUDE.md §5b). Aplica a régua de cobrança (CLAUDE.md §7).
export default async function LayoutPatrao({
  children,
}: {
  children: ReactNode;
}) {
  const membro = await membroAtual();
  if (!membro) redirect("/entrar");
  if (membro.papel === "funcionario") redirect("/funcionario/patio");

  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("onboarding_completo, status_assinatura, inadimplente_desde")
    .limit(1)
    .maybeSingle();

  if (!emp || !emp.onboarding_completo) redirect("/comecar");

  const status = emp.status_assinatura as StatusAssinatura;
  const nivel = nivelAcesso(status, emp.inadimplente_desde);
  const aviso = avisoCobranca(status, emp.inadimplente_desde);

  if (nivel === "bloqueado") {
    return (
      <AppShell perfil="patrao">
        <AssinaturaBloqueada papel="patrao" status={status} />
      </AppShell>
    );
  }

  return (
    <AppShell perfil="patrao">
      {aviso ? (
        <div className="mb-4">
          <AvisoCobranca texto={aviso} nivel={nivel} />
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
