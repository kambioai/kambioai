import "server-only";

import webpush from "web-push";

import type { criarClienteServico } from "@/lib/supabase/service";

// Envio de Web Push (CLAUDE.md §2/§8). Só roda no servidor (chave privada VAPID).
// A IA/telas nunca tocam aqui. As inscrições vivem em `push_inscricoes`; quando
// o navegador descarta uma (expira), o provedor responde 404/410 e nós apagamos.

type Svc = ReturnType<typeof criarClienteServico>;

export interface PushPayload {
  titulo: string;
  corpo: string;
  /** Para onde a notificação leva ao ser tocada (rota do app). */
  url?: string;
  /** Agrupa notificações do mesmo assunto (evita empilhar). */
  tag?: string;
}

let configurado = false;

/** True se as chaves VAPID estão no ambiente (sem elas, não há push). */
export function pushConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

function garantirConfig(): boolean {
  if (configurado) return true;
  if (!pushConfigurado()) return false;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:contato@kambio.com.br",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string,
  );
  configurado = true;
  return true;
}

interface InscricaoRow {
  id: string;
  endpoint: string;
  chaves: unknown; // { p256dh, auth }
}

/**
 * Envia um push para uma lista de inscrições e limpa as que expiraram.
 * Retorna quantas foram entregues. Nunca lança — falha de uma não derruba o lote.
 */
async function enviarParaInscricoes(
  svc: Svc,
  inscricoes: InscricaoRow[],
  payload: PushPayload,
): Promise<number> {
  if (!garantirConfig() || inscricoes.length === 0) return 0;

  const corpo = JSON.stringify(payload);
  const expiradas: string[] = [];
  let entregues = 0;

  await Promise.all(
    inscricoes.map(async (ins) => {
      const chaves = ins.chaves as { p256dh?: string; auth?: string } | null;
      if (!chaves?.p256dh || !chaves?.auth) {
        expiradas.push(ins.id);
        return;
      }
      try {
        await webpush.sendNotification(
          { endpoint: ins.endpoint, keys: { p256dh: chaves.p256dh, auth: chaves.auth } },
          corpo,
        );
        entregues += 1;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) expiradas.push(ins.id);
      }
    }),
  );

  if (expiradas.length > 0) {
    await svc.from("push_inscricoes").delete().in("id", expiradas);
  }
  return entregues;
}

/** Push para TODOS os membros ativos de uma empresa (lembretes operacionais). */
export async function enviarPushEmpresa(
  svc: Svc,
  empresaId: string,
  payload: PushPayload,
): Promise<number> {
  const { data } = await svc
    .from("push_inscricoes")
    .select("id, endpoint, chaves")
    .eq("empresa_id", empresaId);
  return enviarParaInscricoes(svc, (data ?? []) as InscricaoRow[], payload);
}

/**
 * Push só para os PATRÕES ativos de uma empresa (resumo do dia, régua de
 * cobrança, falta de estoque — assuntos de dono, nunca do funcionário).
 */
export async function enviarPushPatrao(
  svc: Svc,
  empresaId: string,
  payload: PushPayload,
): Promise<number> {
  const { data: patroes } = await svc
    .from("membros")
    .select("usuario_id")
    .eq("empresa_id", empresaId)
    .eq("papel", "patrao")
    .eq("ativo", true);
  const ids = (patroes ?? [])
    .map((m) => m.usuario_id)
    .filter((v): v is string => Boolean(v));
  if (ids.length === 0) return 0;

  const { data } = await svc
    .from("push_inscricoes")
    .select("id, endpoint, chaves")
    .eq("empresa_id", empresaId)
    .in("usuario_id", ids);
  return enviarParaInscricoes(svc, (data ?? []) as InscricaoRow[], payload);
}
