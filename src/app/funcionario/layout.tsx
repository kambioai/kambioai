import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AssinaturaBloqueada } from "@/components/assinatura/assinatura-bloqueada";
import { AvisoCobranca } from "@/components/assinatura/aviso-cobranca";
import { AppShell } from "@/components/navegacao/app-shell";
import { membroAtual } from "@/lib/permissoes";
import { avisoCobranca, nivelAcesso, type StatusAssinatura } from "@/lib/stripe/acesso";
import { criarClienteServidor } from "@/lib/supabase/server";

// Área do funcionário. Só entra quem tem vínculo ATIVO; desativar o funcionário
// corta o acesso na hora (CLAUDE.md §11). O patrão, se cair aqui, vai pra área
// dele. A régua de cobrança (CLAUDE.md §7) também vale: oficina bloqueada, o
// funcionário não opera.
export default async function LayoutFuncionario({
  children,
}: {
  children: ReactNode;
}) {
  const membro = await membroAtual();
  if (!membro) redirect("/entrar");
  if (membro.papel === "patrao") redirect("/patrao/painel");

  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("status_assinatura, inadimplente_desde")
    .limit(1)
    .maybeSingle();

  const status = (emp?.status_assinatura ?? "ativa") as StatusAssinatura;
  const nivel = nivelAcesso(status, emp?.inadimplente_desde ?? null);
  const aviso = avisoCobranca(status, emp?.inadimplente_desde ?? null);

  if (nivel === "bloqueado") {
    return (
      <AppShell perfil="funcionario">
        <AssinaturaBloqueada papel="funcionario" status={status} />
      </AppShell>
    );
  }

  return (
    <AppShell perfil="funcionario">
      {aviso ? (
        <div className="mb-4">
          <AvisoCobranca texto={aviso} nivel={nivel} />
        </div>
      ) : null}
      {children}
    </AppShell>
  );
}
