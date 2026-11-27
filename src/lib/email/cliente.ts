import "server-only";

import type { ReactElement } from "react";
import { Resend } from "resend";

// Envio de e-mail (Resend + React Email). Só no servidor (chave secreta). Tudo é
// best-effort: sem RESEND_API_KEY o app não envia (retorna false), sem quebrar o
// fluxo — push e link copiável continuam funcionando.

let cliente: Resend | null = null;

export function emailConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function obterResend(): Resend | null {
  if (!emailConfigurado()) return null;
  if (!cliente) cliente = new Resend(process.env.RESEND_API_KEY);
  return cliente;
}

const FROM = process.env.EMAIL_FROM || "Kambio <onboarding@resend.dev>";

/** URL absoluta do app (para links em e-mails). */
export function urlApp(caminho = "/"): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

/** Envia um e-mail. Retorna true se saiu; false se não configurado ou falhou. */
export async function enviarEmail(params: {
  to: string;
  subject: string;
  react: ReactElement;
}): Promise<boolean> {
  const resend = obterResend();
  if (!resend) return false;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      react: params.react,
    });
    return !error;
  } catch {
    return false;
  }
}
