"use server";

import { membroAtual } from "@/lib/permissoes";
import { obterStripe, stripeConfigurado } from "@/lib/stripe/cliente";
import { criarClienteServidor } from "@/lib/supabase/server";

// Ações da tela Conta (patrão). A exclusão é definitiva (LGPD): apaga todos os
// dados da oficina. Antes, cancela a assinatura no Stripe para não cobrar mais.

type Resultado = { ok: true } | { ok: false; erro: string };

/**
 * Exclui a oficina do patrão logado e todos os seus dados. Exige a palavra de
 * confirmação exata (evita clique acidental). A checagem de permissão é feita
 * também no banco (função `excluir_empresa` valida que é o patrão/admin).
 */
export async function excluirMinhaOficina(confirmacao: string): Promise<Resultado> {
  if (confirmacao.trim().toUpperCase() !== "EXCLUIR") {
    return { ok: false, erro: 'Digite EXCLUIR para confirmar.' };
  }

  const membro = await membroAtual();
  if (!membro) return { ok: false, erro: "Não autenticado." };
  if (membro.papel !== "patrao") {
    return { ok: false, erro: "Só o dono pode excluir a oficina." };
  }

  const sb = await criarClienteServidor();

  // Cancela a assinatura no Stripe antes de apagar (best-effort — não bloqueia
  // a exclusão se falhar; o importante para a LGPD é remover os dados).
  const { data: emp } = await sb
    .from("empresas")
    .select("stripe_subscription_id")
    .eq("id", membro.empresaId)
    .maybeSingle();
  if (emp?.stripe_subscription_id && stripeConfigurado()) {
    try {
      await obterStripe().subscriptions.cancel(emp.stripe_subscription_id);
    } catch {
      // segue mesmo assim
    }
  }

  const { error } = await sb.rpc("excluir_empresa", {
    p_empresa_id: membro.empresaId,
  });
  if (error) {
    return { ok: false, erro: "Não consegui excluir agora. Tente de novo." };
  }

  // Encerra a sessão: a conta não tem mais oficina.
  await sb.auth.signOut();
  return { ok: true };
}
