import type { ReactNode } from "react";

import { AppShell } from "@/components/navegacao/app-shell";

export default function LayoutFuncionario({
  children,
}: {
  children: ReactNode;
}) {
  return <AppShell perfil="funcionario">{children}</AppShell>;
}
