import { z } from "zod";

// Esquema FIXO da resposta da IA (CLAUDE.md §6). O Gemini devolve JSON nesse
// formato (nunca texto livre); o servidor valida com Zod antes de usar.
// A IA só interpreta a fala — quem calcula dinheiro é o servidor.

export const intencoes = [
  "os_paga",
  "os_abrir",
  "os_atualizar",
  "despesa",
  "compra_estoque",
  "atualizar_custo",
  "pergunta",
  "lembrete",
] as const;
export type Intencao = (typeof intencoes)[number];

export const statusOs = [
  "orcamento",
  "em_servico",
  "aguardando_peca",
  "pronto",
  "entregue",
  "cancelado",
] as const;

const veiculo = z
  .object({
    placa: z.string(),
    modelo: z.string().nullable().default(null),
    confianca: z.number().min(0).max(1).default(0.5),
  })
  .nullable()
  .default(null);

const cliente = z
  .object({ nome: z.string() })
  .nullable()
  .default(null);

const item = z.object({
  item_id: z.string().nullable().default(null),
  quantidade: z.number().int().positive().default(1),
  // valores que a pessoa falou, em REAIS (o servidor converte e recalcula).
  custo_avulso: z.number().nonnegative().nullable().default(null),
});

const itemFora = z.object({
  descricao: z.string(),
  preco: z.number().nonnegative().nullable().default(null),
  custo: z.number().nonnegative().nullable().default(null),
});

const pagamento = z
  .object({
    forma: z.enum(["pix", "dinheiro", "debito", "credito"]),
    parcelas: z.number().int().positive().default(1),
  })
  .nullable()
  .default(null);

export const respostaIaSchema = z.object({
  intencao: z.enum(intencoes),
  transcricao: z.string().default(""),
  veiculo,
  cliente,
  itens: z.array(item).default([]),
  itens_fora_do_catalogo: z.array(itemFora).default([]),
  total_falado: z.number().nonnegative().nullable().default(null),
  pagamento,
  status: z.enum(statusOs).nullable().default(null),
});

export type RespostaIa = z.infer<typeof respostaIaSchema>;

/** Valida o JSON da IA. Retorna {ok, dados} ou {ok:false, erro}. */
export function validarRespostaIa(
  bruto: unknown,
): { ok: true; dados: RespostaIa } | { ok: false; erro: string } {
  const r = respostaIaSchema.safeParse(bruto);
  if (!r.success) {
    return { ok: false, erro: "Resposta da IA fora do formato esperado." };
  }
  return { ok: true, dados: r.data };
}
