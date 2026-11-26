"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { adminAtual } from "@/lib/permissoes";
import { enviarPushPatrao } from "@/lib/push/servidor";
import { criarClienteServico } from "@/lib/supabase/service";

// Ações do ADMIN do SaaS (Fase 13). Toda ação checa `adminAtual()` de novo
// (defesa em profundidade — a tela já é gated, mas o servidor não confia na
// tela) e usa a service role para agir entre empresas.

type Resultado = { ok: true } | { ok: false; erro: string };

async function exigirAdmin(): Promise<{ id: string } | null> {
  return adminAtual();
}

// ----- Status da empresa (régua/ações da ficha) -----
async function definirStatus(
  empresaId: string,
  status: "ativa" | "teste" | "bloqueada",
): Promise<Resultado> {
  const adm = await exigirAdmin();
  if (!adm) return { ok: false, erro: "Só o admin pode fazer isso." };
  if (!z.string().uuid().safeParse(empresaId).success) {
    return { ok: false, erro: "Empresa inválida." };
  }

  const svc = criarClienteServico();
  const patch: {
    status_assinatura: "ativa" | "teste" | "bloqueada";
    inadimplente_desde?: null;
  } = {
    status_assinatura: status,
  };
  // Reativar/estender limpa a marca de inadimplência (a régua recomeça do zero).
  if (status !== "bloqueada") patch.inadimplente_desde = null;

  const { error } = await svc
    .from("empresas")
    .update(patch)
    .eq("id", empresaId);
  if (error) return { ok: false, erro: "Não consegui atualizar a empresa." };

  revalidatePath(`/admin/empresas/${empresaId}`);
  revalidatePath("/admin/empresas");
  revalidatePath("/admin/visao-geral");
  return { ok: true };
}

export async function bloquearEmpresa(empresaId: string): Promise<Resultado> {
  return definirStatus(empresaId, "bloqueada");
}

export async function desbloquearEmpresa(empresaId: string): Promise<Resultado> {
  return definirStatus(empresaId, "ativa");
}

export async function estenderTeste(empresaId: string): Promise<Resultado> {
  return definirStatus(empresaId, "teste");
}

// ----- Modo suporte (registrado — LGPD) -----
const suporteSchema = z.object({
  empresaId: z.string().uuid(),
  motivo: z.string().min(5, "Diga o motivo do acesso.").max(300),
});

/** Registra a entrada em modo suporte. A leitura em si é feita na página de
 * suporte (service role, só leitura). Cada entrada vira uma linha na auditoria. */
export async function registrarModoSuporte(entrada: {
  empresaId: string;
  motivo: string;
}): Promise<Resultado> {
  const adm = await exigirAdmin();
  if (!adm) return { ok: false, erro: "Só o admin pode fazer isso." };
  const parsed = suporteSchema.safeParse(entrada);
  if (!parsed.success) {
    return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const svc = criarClienteServico();
  const { error } = await svc.from("suporte_acessos").insert({
    admin_id: adm.id,
    empresa_id: parsed.data.empresaId,
    motivo: parsed.data.motivo.trim(),
  });
  if (error) return { ok: false, erro: "Não consegui registrar o acesso." };
  return { ok: true };
}

// ----- Comunicados -----
const comunicadoSchema = z.object({
  titulo: z.string().min(3).max(120),
  corpo: z.string().min(3).max(500),
  publico: z.enum(["todas", "basico", "pro"]),
});

/** Cria e ENVIA um comunicado: push para os patrões das empresas-alvo. */
export async function criarEnviarComunicado(entrada: {
  titulo: string;
  corpo: string;
  publico: "todas" | "basico" | "pro";
}): Promise<{ ok: true; alcance: number } | { ok: false; erro: string }> {
  const adm = await exigirAdmin();
  if (!adm) return { ok: false, erro: "Só o admin pode fazer isso." };
  const parsed = comunicadoSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Preencha título e texto." };
  const { titulo, corpo, publico } = parsed.data;

  const svc = criarClienteServico();

  // Empresas-alvo (com acesso — não manda pra bloqueada/cancelada).
  let q = svc
    .from("empresas")
    .select("id, plano")
    .not("status_assinatura", "in", "(bloqueada,cancelada)");
  if (publico === "basico") q = q.eq("plano", "basico");
  if (publico === "pro") q = q.eq("plano", "pro");
  const { data: empresas } = await q;

  let alcance = 0;
  for (const e of empresas ?? []) {
    alcance += await enviarPushPatrao(svc, e.id, {
      titulo,
      corpo,
      url: "/patrao/painel",
      tag: "comunicado",
    });
  }

  const { error } = await svc.from("comunicados").insert({
    titulo,
    corpo,
    publico,
    status: "enviado",
    alcance,
    criado_por: adm.id,
    enviado_em: new Date().toISOString(),
  });
  if (error) return { ok: false, erro: "Não consegui salvar o comunicado." };

  revalidatePath("/admin/comunicados");
  return { ok: true, alcance };
}
