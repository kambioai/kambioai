import type { Segmento, TipoItem } from "@/types";

// Catálogo modelo do segmento (CLAUDE.md §5b): itens prontos que o patrão só
// ajusta no onboarding — ele não começa do zero. Valores SUGERIDOS em centavos.
// Na Fase 13 isso passa a ser mantido pelo admin (hoje é referência fixa).

export interface ModeloItem {
  nome: string;
  tipo: TipoItem;
  custoCentavos: number;
  precoCentavos: number;
  estoque: number;
  estoqueMinimo: number;
}

const p = (
  nome: string,
  custo: number,
  preco: number,
  estoque = 0,
  minimo = 0,
): ModeloItem => ({
  nome,
  tipo: "produto",
  custoCentavos: custo,
  precoCentavos: preco,
  estoque,
  estoqueMinimo: minimo,
});

const s = (nome: string, preco: number): ModeloItem => ({
  nome,
  tipo: "servico",
  custoCentavos: 0,
  precoCentavos: preco,
  estoque: 0,
  estoqueMinimo: 0,
});

export const modelosCatalogo: Record<Segmento, ModeloItem[]> = {
  oficina_moto: [
    p("Pastilha de freio", 4000, 9000, 0, 4),
    p("Óleo 20W50", 2200, 4500, 0, 6),
    p("Pneu 90/90-18", 10000, 15000, 0, 4),
    p("Vela de ignição", 1500, 3500, 0, 8),
    p("Kit relação", 12000, 19000, 0, 3),
    s("Alinhamento", 6000),
    s("Troca de óleo", 3000),
    s("Revisão geral", 12000),
  ],
  mecanica: [
    p("Óleo de motor 5W30", 3500, 7000, 0, 6),
    p("Filtro de óleo", 1800, 4000, 0, 6),
    p("Pastilha de freio", 6000, 13000, 0, 4),
    p("Correia dentada", 9000, 18000, 0, 3),
    s("Troca de óleo", 4000),
    s("Alinhamento e balanceamento", 8000),
    s("Revisão completa", 20000),
  ],
  funilaria: [
    p("Massa plástica", 2500, 6000, 0, 4),
    p("Tinta (lata)", 8000, 16000, 0, 3),
    p("Lixa d'água", 300, 800, 0, 20),
    s("Polimento", 15000),
    s("Pintura de para-choque", 25000),
    s("Reparo de amassado", 18000),
  ],
  estetica: [
    p("Cera automotiva", 2000, 5000, 0, 5),
    p("Shampoo automotivo", 1500, 3500, 0, 5),
    s("Lavagem simples", 3000),
    s("Lavagem completa", 6000),
    s("Polimento e cristalização", 20000),
    s("Higienização interna", 12000),
  ],
  troca_oleo: [
    p("Óleo 15W40", 3000, 6000, 0, 8),
    p("Óleo 5W30", 3500, 7000, 0, 8),
    p("Filtro de óleo", 1800, 4000, 0, 8),
    p("Filtro de ar", 2200, 5000, 0, 6),
    s("Troca de óleo", 3000),
  ],
  borracharia: [
    p("Pneu aro 14", 18000, 28000, 0, 4),
    p("Câmara de ar", 2500, 5000, 0, 6),
    p("Válvula", 200, 600, 0, 20),
    s("Conserto de furo", 2500),
    s("Montagem e balanceamento", 4000),
    s("Alinhamento", 6000),
  ],
};

export interface ModeloCusto {
  nome: string;
  valorCentavos: number;
}

/** Custos fixos sugeridos (o patrão ajusta os valores e adiciona/remove). */
export const custosFixosPadrao: ModeloCusto[] = [
  { nome: "Aluguel", valorCentavos: 0 },
  { nome: "Funcionários", valorCentavos: 0 },
  { nome: "Luz", valorCentavos: 0 },
  { nome: "Internet", valorCentavos: 0 },
  { nome: "Contador", valorCentavos: 0 },
];
