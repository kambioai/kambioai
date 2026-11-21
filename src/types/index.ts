// Tipos de domínio compartilhados do Kambio.
// Dinheiro sempre em centavos (inteiros). Nomes em português para casar com o banco.

export type Papel = "patrao" | "funcionario";

export type Segmento =
  | "oficina_moto"
  | "mecanica"
  | "funilaria"
  | "estetica"
  | "troca_oleo"
  | "borracharia";

export type TipoItem = "produto" | "servico";

export type StatusOS =
  | "orcamento"
  | "em_servico"
  | "aguardando_peca"
  | "pronto"
  | "entregue"
  | "cancelado";

export type FormaPagamento = "pix" | "dinheiro" | "debito" | "credito";

export type OrigemLancamento = "voz" | "manual";
