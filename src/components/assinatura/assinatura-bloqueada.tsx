import { Lock } from "lucide-react";

import { BotaoAssinar, BotaoPortal } from "@/components/assinatura/botoes-assinatura";
import { BotaoSair } from "@/components/auth/botao-sair";
import type { StatusAssinatura } from "@/lib/stripe/acesso";

/**
 * Tela de bloqueio por pagamento (régua de cobrança, CLAUDE.md §7). Substitui o
 * conteúdo da área quando a conta está bloqueada. O caminho de volta depende do
 * motivo: assinatura CANCELADA → assinar de novo (Checkout); pagamento em
 * atraso → atualizar o cartão no portal (o Stripe retenta). O funcionário vê a
 * mesma mensagem, sem botões de pagamento.
 */
export function AssinaturaBloqueada({
  papel,
  status,
}: {
  papel: "patrao" | "funcionario";
  status: StatusAssinatura;
}) {
  const cancelada = status === "cancelada";
  return (
    <section className="mx-auto max-w-md space-y-5 py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fundo">
        <Lock className="h-8 w-8 text-principal" aria-hidden="true" />
      </div>
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Conta bloqueada
      </h1>

      {papel === "patrao" ? (
        <>
          <p className="text-corpo text-texto-secundario">
            {cancelada
              ? "Sua assinatura foi cancelada. Assine de novo para voltar a usar o Kambio."
              : "O pagamento da assinatura está em atraso. Atualize o cartão para voltar a usar o Kambio agora mesmo."}
          </p>
          <div className="space-y-3">
            {cancelada ? (
              <BotaoAssinar>Assinar de novo</BotaoAssinar>
            ) : (
              <BotaoPortal>Atualizar cartão</BotaoPortal>
            )}
            <BotaoSair className="w-full" />
          </div>
        </>
      ) : (
        <>
          <p className="text-corpo text-texto-secundario">
            A oficina está com o pagamento em atraso. Avise o dono para
            regularizar — assim você volta a lançar.
          </p>
          <BotaoSair className="w-full" />
        </>
      )}
    </section>
  );
}
