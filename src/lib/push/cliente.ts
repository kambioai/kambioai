// Helpers de push no NAVEGADOR (usados por um Client Component). Pedem permissão,
// registram o service worker e inscrevem/cancelam o aparelho. A inscrição é
// enviada para /api/push/inscrever, que a grava em `push_inscricoes` sob RLS.

export type EstadoPush =
  | "nao-suportado"
  | "negado"
  | "inscrito"
  | "nao-inscrito";

export function pushSuportado(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Converte a chave pública VAPID (base64url) no formato que o PushManager pede. */
function base64ParaUint8(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) arr[i] = raw.charCodeAt(i);
  return arr;
}

async function registrarSW(): Promise<ServiceWorkerRegistration> {
  const existente = await navigator.serviceWorker.getRegistration();
  if (existente) return existente;
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

/** Estado atual, para a tela mostrar o botão certo. */
export async function estadoPush(): Promise<EstadoPush> {
  if (!pushSuportado()) return "nao-suportado";
  if (Notification.permission === "denied") return "negado";
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return sub ? "inscrito" : "nao-inscrito";
  } catch {
    return "nao-inscrito";
  }
}

/** Pede permissão, inscreve e salva no servidor. Retorna o novo estado. */
export async function assinarPush(): Promise<EstadoPush> {
  if (!pushSuportado()) return "nao-suportado";
  const chave = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!chave) return "nao-suportado";

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") {
    return permissao === "denied" ? "negado" : "nao-inscrito";
  }

  const reg = await registrarSW();
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64ParaUint8(chave),
    }));

  const json = sub.toJSON();
  const res = await fetch("/api/push/inscrever", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint, chaves: json.keys }),
  });
  if (!res.ok) {
    await sub.unsubscribe().catch(() => {});
    throw new Error("Não consegui ativar os avisos.");
  }
  return "inscrito";
}

/** Cancela a inscrição deste aparelho (e remove do servidor). */
export async function cancelarPush(): Promise<EstadoPush> {
  if (!pushSuportado()) return "nao-suportado";
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await fetch("/api/push/inscrever", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {});
    await sub.unsubscribe().catch(() => {});
  }
  return "nao-inscrito";
}
