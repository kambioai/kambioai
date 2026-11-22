// Monta o contexto para o Gemini (CLAUDE.md §6): instruções fixas + catálogo da
// empresa + placas/clientes recentes + data/hora + papel de quem fala.
// A IA só INTERPRETA; o servidor calcula dinheiro, valida e grava.

export interface ItemContexto {
  id: string;
  nome: string;
  tipo: "produto" | "servico";
  sinonimos: string[];
}

export interface VeiculoContexto {
  placa: string;
  modelo: string | null;
  cliente: string | null;
}

export function montarPrompt(params: {
  papel: "patrao" | "funcionario";
  catalogo: ItemContexto[];
  veiculosRecentes: VeiculoContexto[];
  agoraISO: string;
}): string {
  const { papel, catalogo, veiculosRecentes, agoraISO } = params;

  const listaItens = catalogo
    .map((i) => {
      const sin = i.sinonimos.length ? ` (também: ${i.sinonimos.join(", ")})` : "";
      return `- id="${i.id}" | ${i.nome} [${i.tipo}]${sin}`;
    })
    .join("\n");

  const listaVeiculos = veiculosRecentes
    .map(
      (v) =>
        `- ${v.placa}${v.modelo ? ` (${v.modelo})` : ""}${v.cliente ? ` — ${v.cliente}` : ""}`,
    )
    .join("\n");

  return `Você é o assistente do Kambio, um sistema para oficinas de veículos.
Sua tarefa: ouvir/ler a frase de um ${papel === "patrao" ? "dono de oficina (patrão)" : "funcionário"} e devolver SOMENTE um JSON no formato exato abaixo. Nunca escreva texto fora do JSON.

Data e hora atual (America/Sao_Paulo): ${agoraISO}

CATÁLOGO DA OFICINA (use o "id" exato ao referenciar um item; se o item falado não existir aqui, coloque em "itens_fora_do_catalogo"):
${listaItens || "(catálogo vazio)"}

VEÍCULOS/CLIENTES RECENTES (para reconhecer a placa falada):
${listaVeiculos || "(nenhum)"}

REGRAS:
- "intencao": uma de os_paga, os_abrir, os_atualizar, despesa, compra_estoque, atualizar_custo, pergunta, lembrete.
- "transcricao": a frase transcrita, em português.
- "veiculo": { placa (formato Mercosul ABC1D23 ou antigo ABC1234), modelo, confianca 0..1 } ou null.
- "cliente": { nome } ou null.
- "itens": lista de { item_id (o id do catálogo, ou null se avulso), quantidade, custo_avulso (em REAIS, se a pessoa disse "comprei por X"; senão null) }.
- "itens_fora_do_catalogo": lista de { descricao, preco (reais|null), custo (reais|null) } para o que não está no catálogo.
- "total_falado": número em REAIS se a pessoa disse um total; senão null.
- "pagamento": { forma (pix|dinheiro|debito|credito), parcelas } ou null. Se a pessoa disser como pagou (ex.: "no crédito", "no pix", "200 no débito", "em 2x no crédito", "pagou 90 no cartão"), SEMPRE preencha "pagamento" e use "intencao": "os_paga". "cartão" sem especificar = credito.
- "status": um de orcamento, em_servico, aguardando_peca, pronto, entregue, cancelado, ou null.
- NÃO calcule totais nem lucro — isso é feito pelo servidor. Só extraia o que foi dito.
- Valores sempre em REAIS (números), nunca com "R$".`;
}
