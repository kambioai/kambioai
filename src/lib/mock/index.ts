// Dados fictícios para as fases de frontend (Bloco 1 do PLAN.md).
// Oficina de moto: catálogo, 3 veículos e OS dos últimos 7 dias.
// Serão substituídos por dados reais do Supabase nas fases de backend,
// SEM mudar os componentes de tela (a troca acontece em src/lib/dados).

import type { FormaPagamento, StatusOS, TipoItem } from "@/types";

export const empresaMock = {
  nome: "Oficina do Zé Motos",
  segmento: "oficina_moto" as const,
  cidade: "Goiânia",
};

export interface ItemCatalogoMock {
  id: string;
  nome: string;
  tipo: TipoItem;
  custoCentavos: number;
  precoCentavos: number;
  estoque: number;
  estoqueMinimo: number;
}

export const catalogoMock: ItemCatalogoMock[] = [
  {
    id: "pastilha-freio",
    nome: "Pastilha de freio",
    tipo: "produto",
    custoCentavos: 4000,
    precoCentavos: 9000,
    estoque: 8,
    estoqueMinimo: 4,
  },
  {
    id: "oleo-20w50",
    nome: "Óleo 20W50",
    tipo: "produto",
    custoCentavos: 2200,
    precoCentavos: 4500,
    estoque: 12,
    estoqueMinimo: 6,
  },
  {
    id: "pneu-90-90",
    nome: "Pneu 90/90-18",
    tipo: "produto",
    custoCentavos: 10000,
    precoCentavos: 15000,
    estoque: 3,
    estoqueMinimo: 4,
  },
  {
    id: "vela-ignicao",
    nome: "Vela de ignição",
    tipo: "produto",
    custoCentavos: 1500,
    precoCentavos: 3500,
    estoque: 20,
    estoqueMinimo: 8,
  },
  {
    id: "alinhamento",
    nome: "Alinhamento",
    tipo: "servico",
    custoCentavos: 0,
    precoCentavos: 6000,
    estoque: 0,
    estoqueMinimo: 0,
  },
  {
    id: "troca-oleo",
    nome: "Troca de óleo",
    tipo: "servico",
    custoCentavos: 0,
    precoCentavos: 3000,
    estoque: 0,
    estoqueMinimo: 0,
  },
];

export interface VeiculoMock {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  cor: string;
  dono: string;
}

export const veiculosMock: VeiculoMock[] = [
  {
    id: "v-1",
    placa: "ABC1D23",
    modelo: "Honda CG 160",
    ano: 2021,
    cor: "Vermelha",
    dono: "João",
  },
  {
    id: "v-2",
    placa: "XYZ9K88",
    modelo: "Yamaha Factor 125",
    ano: 2019,
    cor: "Preta",
    dono: "Marcos",
  },
  {
    id: "v-3",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    ano: 2022,
    cor: "Azul",
    dono: "Ana",
  },
];

export interface OrdemMock {
  id: string;
  placa: string;
  modelo: string;
  status: StatusOS;
  totalCentavos: number;
  custoCentavos: number;
  autor: string;
  formaPagamento: FormaPagamento | null;
  /** Há quantos dias a OS foi criada (0 = hoje). Evita datas que "envelhecem". */
  diasAtras: number;
}

export const ordensMock: OrdemMock[] = [
  {
    id: "os-1",
    placa: "ABC1D23",
    modelo: "Honda CG 160",
    status: "entregue",
    totalCentavos: 15000,
    custoCentavos: 4000,
    autor: "Zé",
    formaPagamento: "pix",
    diasAtras: 0,
  },
  {
    id: "os-2",
    placa: "XYZ9K88",
    modelo: "Yamaha Factor 125",
    status: "em_servico",
    totalCentavos: 0,
    custoCentavos: 0,
    autor: "Zé",
    formaPagamento: null,
    diasAtras: 0,
  },
  {
    id: "os-3",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    status: "entregue",
    totalCentavos: 9000,
    custoCentavos: 2200,
    autor: "Zé",
    formaPagamento: "credito",
    diasAtras: 1,
  },
  {
    id: "os-4",
    placa: "ABC1D23",
    modelo: "Honda CG 160",
    status: "entregue",
    totalCentavos: 18000,
    custoCentavos: 11500,
    autor: "Zé",
    formaPagamento: "debito",
    diasAtras: 3,
  },
  {
    id: "os-5",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    status: "pronto",
    totalCentavos: 6000,
    custoCentavos: 0,
    autor: "Zé",
    formaPagamento: null,
    diasAtras: 5,
  },
];
