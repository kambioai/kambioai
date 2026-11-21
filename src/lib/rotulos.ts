import type { FormaPagamento, Segmento, StatusOS } from "@/types";

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

export const rotuloSegmento: Record<Segmento, string> = {
  oficina_moto: "Oficina de moto",
  mecanica: "Mecânica",
  funilaria: "Funilaria",
  estetica: "Estética",
  troca_oleo: "Troca de óleo",
  borracharia: "Borracharia",
};
