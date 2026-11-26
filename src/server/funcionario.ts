"use server";

import { z } from "zod";

import { criarClienteServidor } from "@/lib/supabase/server";

// Ações do funcionário que escrevem (CLAUDE.md §11). O funcionário NÃO ajusta
// estoque (catálogo é só-patrão na RLS) — ele apenas **avisa falta**, o que
// vira um lembrete pro patrão. A RLS de `lembretes` já permite o membro criar.

type Resultado = { ok: true } | { ok: false; erro: string };

const faltaSchema = z.object({
  nome: z.string().min(1, "Informe o item."),
});

/** Avisa o patrão que um item está faltando (não mexe no estoque). */
export async function avisarFalta(
  entrada: z.infer<typeof faltaSchema>,
): Promise<Resultado> {
  const parsed = faltaSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados inválidos." };

  const sb = await criarClienteServidor();
  const { data: emp } = await sb.from("empresas").select("id").limit(1).maybeSingle();
  if (!emp) return { ok: false, erro: "Oficina não encontrada." };

  const { error } = await sb.from("lembretes").insert({
    texto: `Falta no estoque: ${parsed.data.nome.trim()}`,
    data_hora: new Date().toISOString(),
    tipo: "falta",
    empresa_id: emp.id,
  });
  if (error) return { ok: false, erro: "Não consegui avisar o patrão." };
  return { ok: true };
}
