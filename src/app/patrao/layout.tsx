import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/navegacao/app-shell";
import { membroAtual } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/server";

// Área do patrão. Exige vínculo ATIVO de patrão; funcionário é mandado pra área
// dele; sem vínculo volta pro login. Só libera com o onboarding completo
// (CLAUDE.md §5b).
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
    .select("onboarding_completo")
    .limit(1)
    .maybeSingle();

  if (!emp || !emp.onboarding_completo) redirect("/comecar");

  return <AppShell perfil="patrao">{children}</AppShell>;
}
