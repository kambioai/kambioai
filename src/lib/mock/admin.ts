// Dados fictícios do PAINEL ADMIN (Fase 5). Visão do dono do SaaS, cruzando
// várias empresas — é o único lugar que enxerga mais de uma oficina.
// Dinheiro em centavos. Será substituído por dados reais na Fase 13.

import type { StatusAssinatura } from "@/lib/rotulos";
import type { Segmento } from "@/types";

export interface EmpresaAdmin {
  id: string;
  nome: string;
  segmento: Segmento;
  cidade: string;
  plano: "Básico" | "PRO";
  status: StatusAssinatura;
  funcionarios: number;
  /** Valor mensal da assinatura (0 se em teste, bloqueada ou cancelada). */
  mrrCentavos: number;
  custoIaMesCentavos: number;
  /** Fração das OS em que o patrão corrigiu o cartão da IA (0..1). */
  taxaCorrecao: number;
  desdeDias: number;
  ultimoAcessoDias: number;
}

export const empresasAdminMock: EmpresaAdmin[] = [
  {
    id: "emp-1",
    nome: "Oficina do Zé Motos",
    segmento: "oficina_moto",
    cidade: "Goiânia",
    plano: "PRO",
    status: "ativa",
    funcionarios: 3,
    mrrCentavos: 20980,
    custoIaMesCentavos: 1850,
    taxaCorrecao: 0.08,
    desdeDias: 142,
    ultimoAcessoDias: 0,
  },
  {
    id: "emp-2",
    nome: "Mecânica Central",
    segmento: "mecanica",
    cidade: "Aparecida de Goiânia",
    plano: "PRO",
    status: "ativa",
    funcionarios: 2,
    mrrCentavos: 17990,
    custoIaMesCentavos: 2400,
    taxaCorrecao: 0.12,
    desdeDias: 98,
    ultimoAcessoDias: 0,
  },
  {
    id: "emp-3",
    nome: "Funilaria Silva",
    segmento: "funilaria",
    cidade: "Trindade",
    plano: "Básico",
    status: "ativa",
    funcionarios: 0,
    mrrCentavos: 12990,
    custoIaMesCentavos: 900,
    taxaCorrecao: 0.05,
    desdeDias: 61,
    ultimoAcessoDias: 1,
  },
  {
    id: "emp-4",
    nome: "Moto Peças & Serviços",
    segmento: "oficina_moto",
    cidade: "Senador Canedo",
    plano: "PRO",
    status: "ativa",
    funcionarios: 4,
    mrrCentavos: 23970,
    custoIaMesCentavos: 3100,
    taxaCorrecao: 0.09,
    desdeDias: 203,
    ultimoAcessoDias: 2,
  },
  {
    id: "emp-5",
    nome: "Estética Brilho",
    segmento: "estetica",
    cidade: "Goiânia",
    plano: "Básico",
    status: "inadimplente",
    funcionarios: 0,
    mrrCentavos: 12990,
    custoIaMesCentavos: 1100,
    taxaCorrecao: 0.1,
    desdeDias: 54,
    ultimoAcessoDias: 4,
  },
  {
    id: "emp-6",
    nome: "Troca Rápida Óleo",
    segmento: "troca_oleo",
    cidade: "Goiânia",
    plano: "Básico",
    status: "teste",
    funcionarios: 0,
    mrrCentavos: 0,
    custoIaMesCentavos: 420,
    taxaCorrecao: 0.15,
    desdeDias: 5,
    ultimoAcessoDias: 0,
  },
  {
    id: "emp-7",
    nome: "Borracharia do João",
    segmento: "borracharia",
    cidade: "Hidrolândia",
    plano: "Básico",
    status: "bloqueada",
    funcionarios: 0,
    mrrCentavos: 0,
    custoIaMesCentavos: 180,
    taxaCorrecao: 0.22,
    desdeDias: 37,
    ultimoAcessoDias: 20,
  },
];

/** Receita recorrente (MRR) dos últimos 6 meses, em centavos. */
export interface PontoMrr {
  rotulo: string;
  valorCentavos: number;
}

export const mrrPorMesMock: PontoMrr[] = [
  { rotulo: "Jun", valorCentavos: 31960 },
  { rotulo: "Jul", valorCentavos: 42900 },
  { rotulo: "Ago", valorCentavos: 51890 },
  { rotulo: "Set", valorCentavos: 60880 },
  { rotulo: "Out", valorCentavos: 69870 },
  { rotulo: "Nov", valorCentavos: 75930 },
];

/** Frases que a IA não entendeu — alimentam o ajuste do vocabulário. */
export interface FraseFalhou {
  id: string;
  empresa: string;
  frase: string;
  motivo: string;
  diasAtras: number;
}

export const frasesFalharamMock: FraseFalhou[] = [
  {
    id: "ff-1",
    empresa: "Troca Rápida Óleo",
    frase: "Troquei o óleo do carro do seu Pedro",
    motivo: "Placa não informada",
    diasAtras: 0,
  },
  {
    id: "ff-2",
    empresa: "Mecânica Central",
    frase: "Vendi umas peças aí pro cliente",
    motivo: "Item fora do catálogo",
    diasAtras: 1,
  },
  {
    id: "ff-3",
    empresa: "Estética Brilho",
    frase: "Fiz aquele polimento completo, sabe?",
    motivo: "Serviço não reconhecido",
    diasAtras: 2,
  },
];

export interface Chamado {
  id: string;
  empresa: string;
  assunto: string;
  status: "aberto" | "respondido" | "fechado";
  prioridade: "alta" | "normal" | "baixa";
  diasAtras: number;
}

export const chamadosMock: Chamado[] = [
  {
    id: "ch-1",
    empresa: "Mecânica Central",
    assunto: "App travou ao fechar o caixa",
    status: "aberto",
    prioridade: "alta",
    diasAtras: 0,
  },
  {
    id: "ch-2",
    empresa: "Funilaria Silva",
    assunto: "Como mudo o preço de um serviço?",
    status: "respondido",
    prioridade: "normal",
    diasAtras: 1,
  },
  {
    id: "ch-3",
    empresa: "Oficina do Zé Motos",
    assunto: "Quero adicionar mais um funcionário",
    status: "fechado",
    prioridade: "baixa",
    diasAtras: 3,
  },
];

export interface Comunicado {
  id: string;
  titulo: string;
  publico: string;
  status: "enviado" | "rascunho";
  alcance: number;
  diasAtras: number;
}

export const comunicadosMock: Comunicado[] = [
  {
    id: "co-1",
    titulo: "Novidade: histórico por placa",
    publico: "Todas as oficinas",
    status: "enviado",
    alcance: 7,
    diasAtras: 2,
  },
  {
    id: "co-2",
    titulo: "Dica: feche o caixa todo dia",
    publico: "Plano Básico",
    status: "enviado",
    alcance: 4,
    diasAtras: 5,
  },
  {
    id: "co-3",
    titulo: "Manutenção programada no domingo",
    publico: "Todas as oficinas",
    status: "rascunho",
    alcance: 0,
    diasAtras: 0,
  },
];

export interface Cupom {
  codigo: string;
  descricao: string;
  usos: number;
  validade: string;
}

export const cuponsMock: Cupom[] = [
  {
    codigo: "FUNDADOR50",
    descricao: "50% nos 3 primeiros meses",
    usos: 8,
    validade: "31/12/2026",
  },
  {
    codigo: "INDICACAO",
    descricao: "1 mês grátis por indicação",
    usos: 3,
    validade: "Sem validade",
  },
];

export interface PlanoAdmin {
  nome: string;
  precoCentavos: number;
  descricao: string;
  assinantes: number;
}

export const planosAdminMock: PlanoAdmin[] = [
  {
    nome: "Básico",
    precoCentavos: 12990,
    descricao: "1 patrão, registro por voz ilimitado",
    assinantes: 4,
  },
  {
    nome: "PRO",
    precoCentavos: 17990,
    descricao: "2 funcionários inclusos",
    assinantes: 3,
  },
  {
    nome: "Funcionário adicional",
    precoCentavos: 2990,
    descricao: "A partir do 3º funcionário, cada um",
    assinantes: 5,
  },
];

export const precoFundadorCentavos = 9990;
