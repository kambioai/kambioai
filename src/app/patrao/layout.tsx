import type { ReactNode } from "react";

import { AppShell } from "@/components/navegacao/app-shell";

export default function LayoutPatrao({ children }: { children: ReactNode }) {
  return <AppShell perfil="patrao">{children}</AppShell>;
}
