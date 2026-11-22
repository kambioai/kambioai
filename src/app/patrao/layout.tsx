import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/navegacao/app-shell";
import { criarClienteServidor } from "@/lib/supabase/server";

// Área do patrão: só libera depois que o onboarding estiver completo
// (CLAUDE.md §5b). Sem empresa ou onboarding pela metade → volta pro /comecar.
export default async function LayoutPatrao({
  children,
}: {
  children: ReactNode;
}) {
  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("onboarding_completo")
    .limit(1)
    .maybeSingle();

  if (!emp || !emp.onboarding_completo) redirect("/comecar");

  return <AppShell perfil="patrao">{children}</AppShell>;
}
