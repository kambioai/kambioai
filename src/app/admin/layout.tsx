import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/navegacao/app-shell";
import { ehAdmin } from "@/lib/permissoes";
import { rotaPorPapel } from "@/lib/auth/rota-por-papel";
import { criarClienteServidor } from "@/lib/supabase/server";

// Painel admin (CLAUDE.md §1/§11). Só o dono do SaaS entra. Quem está logado mas
// não é admin vai pra própria área; sem login, o middleware já mandou pro /entrar.
export default async function LayoutAdmin({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await ehAdmin())) {
    const sb = await criarClienteServidor();
    redirect(await rotaPorPapel(sb));
  }
  return <AppShell perfil="admin">{children}</AppShell>;
}
