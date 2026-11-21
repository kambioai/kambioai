import type { FormaPagamento, StatusOS } from "@/types";

/** Rótulos em pt-BR para exibição (Regras de UX §5: linguagem de oficina). */
export const rotuloStatus: Record<StatusOS, string> = {
  orcamento: "Orçamento",
  em_servico: "Em serviço",
  aguardando_peca: "Aguardando peça",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const rotuloPagamento: Record<FormaPagamento, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  debito: "Débito",
  credito: "Crédito",
};
