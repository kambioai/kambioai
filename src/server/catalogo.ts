"use server";

import { z } from "zod";

import { criarClienteServidor } from "@/lib/supabase/server";

// Gestão do catálogo/estoque no app (parte da Fase 9, trazida para a Fase 7).
// Escrita sensível no SERVIDOR, só-patrão (garantido pela RLS), validada com Zod.
// Dinheiro em centavos.

const itemSchema = z.object({
  nome: z.string().min(1, "Informe o nome do item."),
  tipo: z.enum(["produto", "servico"]),
  custoCentavos: z.number().int().min(0),
  precoCentavos: z.number().int().min(0),
  estoque: z.number().int().min(0),
  estoqueMinimo: z.number().int().min(0),
});

const atualizarSchema = itemSchema.extend({ id: z.string().uuid() });

export type EntradaItem = z.infer<typeof itemSchema>;
export type EntradaItemEdicao = z.infer<typeof atualizarSchema>;

type Resultado = { ok: true } | { ok: false; erro: string };

export async function adicionarItem(entrada: EntradaItem): Promise<Resultado> {
  const parsed = itemSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados do item inválidos." };

  const sb = await criarClienteServidor();
  const { data: emp } = await sb
    .from("empresas")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (!emp) return { ok: false, erro: "Oficina não encontrada." };

  const d = parsed.data;
  const { error } = await sb.from("catalogo_itens").insert({
    nome: d.nome.trim(),
    tipo: d.tipo,
    custo: d.tipo === "servico" ? 0 : d.custoCentavos,
    preco: d.precoCentavos,
    estoque: d.tipo === "servico" ? 0 : d.estoque,
    estoque_minimo: d.tipo === "servico" ? 0 : d.estoqueMinimo,
    empresa_id: emp.id,
  });
  if (error) return { ok: false, erro: "Não consegui adicionar o item." };
  return { ok: true };
}

export async function atualizarItem(
  entrada: EntradaItemEdicao,
): Promise<Resultado> {
  const parsed = atualizarSchema.safeParse(entrada);
  if (!parsed.success) return { ok: false, erro: "Dados do item inválidos." };

  const sb = await criarClienteServidor();
  const d = parsed.data;

  // Estoque anterior, para registrar o movimento de ajuste (motivo + autor).
  const { data: antes } = await sb
    .from("catalogo_itens")
    .select("estoque, empresa_id")
    .eq("id", d.id)
    .maybeSingle();

  // A RLS garante que só dá para alterar item da própria oficina (só-patrão).
  const novoEstoque = d.tipo === "servico" ? 0 : d.estoque;
  const { error } = await sb
    .from("catalogo_itens")
    .update({
      nome: d.nome.trim(),
      tipo: d.tipo,
      custo: d.tipo === "servico" ? 0 : d.custoCentavos,
      preco: d.precoCentavos,
      estoque: novoEstoque,
      estoque_minimo: d.tipo === "servico" ? 0 : d.estoqueMinimo,
    })
    .eq("id", d.id);
  if (error) return { ok: false, erro: "Não consegui salvar o item." };

  // Movimento de estoque quando a quantidade muda no ajuste manual.
  if (antes && novoEstoque !== antes.estoque) {
    const {
      data: { user },
    } = await sb.auth.getUser();
    await sb.from("movimentos_estoque").insert({
      item_id: d.id,
      quantidade: novoEstoque - antes.estoque,
      motivo: "ajuste",
      autor_id: user?.id ?? null,
      empresa_id: antes.empresa_id,
    });
  }
  return { ok: true };
}

export async function removerItem(id: string): Promise<Resultado> {
  if (!z.string().uuid().safeParse(id).success) {
    return { ok: false, erro: "Item inválido." };
  }
  const sb = await criarClienteServidor();
  const { error } = await sb.from("catalogo_itens").delete().eq("id", id);
  if (error) return { ok: false, erro: "Não consegui excluir o item." };
  return { ok: true };
}
