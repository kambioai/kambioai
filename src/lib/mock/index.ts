// Dados fictícios para as fases de frontend (Bloco 1 do PLAN.md).
// Serão substituídos por dados reais do Supabase nas fases de backend,
// sem mudar os componentes de tela.

import type { StatusOS } from "@/types";

export interface ItemCatalogoMock {
  id: string;
  nome: string;
  tipo: "produto" | "servico";
  custoCentavos: number;
  precoCentavos: number;
  estoque: number;
}

export const empresaMock = {
  nome: "Oficina do Zé Motos",
  segmento: "oficina_moto" as const,
  cidade: "Goiânia",
};

export const catalogoMock: ItemCatalogoMock[] = [
  {
    id: "pastilha-freio",
    nome: "Pastilha de freio",
    tipo: "produto",
    custoCentavos: 4000,
    precoCentavos: 9000,
    estoque: 8,
  },
  {
    id: "oleo-20w50",
    nome: "Óleo 20W50",
    tipo: "produto",
    custoCentavos: 2200,
    precoCentavos: 4500,
    estoque: 12,
  },
  {
    id: "alinhamento",
    nome: "Alinhamento",
    tipo: "servico",
    custoCentavos: 0,
    precoCentavos: 6000,
    estoque: 0,
  },
];

export interface OrdemMock {
  id: string;
  placa: string;
  modelo: string;
  status: StatusOS;
  totalCentavos: number;
  autor: string;
}

export const ordensMock: OrdemMock[] = [
  {
    id: "os-1",
    placa: "ABC1D23",
    modelo: "Gol",
    status: "entregue",
    totalCentavos: 35000,
    autor: "Zé",
  },
  {
    id: "os-2",
    placa: "XYZ9K88",
    modelo: "Civic",
    status: "em_servico",
    totalCentavos: 0,
    autor: "Zé",
  },
];
