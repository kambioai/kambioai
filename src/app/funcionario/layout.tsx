import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/navegacao/app-shell";
import { membroAtual } from "@/lib/permissoes";

// Área do funcionário. Só entra quem tem vínculo ATIVO; desativar o funcionário
// corta o acesso na hora (CLAUDE.md §11). O patrão, se cair aqui, vai pra área
// dele.
export default async function LayoutFuncionario({
  children,
}: {
  children: ReactNode;
}) {
  const membro = await membroAtual();
  if (!membro) redirect("/entrar");
  if (membro.papel === "patrao") redirect("/patrao/painel");

  return <AppShell perfil="funcionario">{children}</AppShell>;
}
