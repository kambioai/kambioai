import type { ReactNode } from "react";

import { AppShell } from "@/components/navegacao/app-shell";

export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return <AppShell perfil="admin">{children}</AppShell>;
}
