// Dados fictícios para as fases de frontend (Bloco 1 do PLAN.md).
// Oficina de moto: catálogo, veículos, OS dos últimos 7 dias, despesas,
// custos fixos, taxas, funcionários e dados da empresa.
// Serão substituídos por dados reais do Supabase nas fases de backend,
// SEM mudar os componentes de tela (a troca acontece em src/lib/dados).

import type { FormaPagamento, StatusOS, TipoItem } from "@/types";

export const empresaMock = {
  nome: "Oficina do Zé Motos",
  segmento: "oficina_moto" as const,
  cidade: "Goiânia",
  plano: "Básico" as const,
  statusAssinatura: "ativa" as const,
  proximaCobranca: "10/12/2026",
  valorPlanoCentavos: 12990,
};

// ----- Catálogo -----
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
    id: "relacao",
    nome: "Kit relação",
    tipo: "produto",
    custoCentavos: 12000,
    precoCentavos: 19000,
    estoque: 2,
    estoqueMinimo: 3,
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
  {
    id: "revisao",
    nome: "Revisão geral",
    tipo: "servico",
    custoCentavos: 0,
    precoCentavos: 12000,
    estoque: 0,
    estoqueMinimo: 0,
  },
];

// ----- Veículos -----
export interface VeiculoMock {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  cor: string;
  dono: string;
  telefone: string;
}

export const veiculosMock: VeiculoMock[] = [
  {
    id: "v-1",
    placa: "ABC1D23",
    modelo: "Honda CG 160",
    ano: 2021,
    cor: "Vermelha",
    dono: "João",
    telefone: "(62) 99111-1111",
  },
  {
    id: "v-2",
    placa: "XYZ9K88",
    modelo: "Yamaha Factor 125",
    ano: 2019,
    cor: "Preta",
    dono: "Marcos",
    telefone: "(62) 99222-2222",
  },
  {
    id: "v-3",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    ano: 2022,
    cor: "Azul",
    dono: "Ana",
    telefone: "(62) 99333-3333",
  },
];

// ----- Ordens de serviço -----
export interface ItemOrdemMock {
  nome: string;
  tipo: TipoItem;
  quantidade: number;
  precoCentavos: number;
}

export interface OrdemMock {
  id: string;
  placa: string;
  modelo: string;
  status: StatusOS;
  totalCentavos: number;
  custoCentavos: number;
  taxaCentavos: number;
  autor: string;
  formaPagamento: FormaPagamento | null;
  itens: ItemOrdemMock[];
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
    taxaCentavos: 0,
    autor: "Zé",
    formaPagamento: "pix",
    diasAtras: 0,
    itens: [
      {
        nome: "Pastilha de freio",
        tipo: "produto",
        quantidade: 1,
        precoCentavos: 9000,
      },
      {
        nome: "Alinhamento",
        tipo: "servico",
        quantidade: 1,
        precoCentavos: 6000,
      },
    ],
  },
  {
    id: "os-6",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    status: "entregue",
    totalCentavos: 10000,
    custoCentavos: 3000,
    taxaCentavos: 0,
    autor: "Carlos",
    formaPagamento: "dinheiro",
    diasAtras: 0,
    itens: [
      {
        nome: "Vela de ignição",
        tipo: "produto",
        quantidade: 2,
        precoCentavos: 3500,
      },
      {
        nome: "Troca de óleo",
        tipo: "servico",
        quantidade: 1,
        precoCentavos: 3000,
      },
    ],
  },
  {
    id: "os-2",
    placa: "XYZ9K88",
    modelo: "Yamaha Factor 125",
    status: "em_servico",
    totalCentavos: 0,
    custoCentavos: 0,
    taxaCentavos: 0,
    autor: "Carlos",
    formaPagamento: null,
    diasAtras: 0,
    itens: [
      {
        nome: "Revisão geral",
        tipo: "servico",
        quantidade: 1,
        precoCentavos: 12000,
      },
    ],
  },
  {
    id: "os-3",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    status: "entregue",
    totalCentavos: 7500,
    custoCentavos: 2200,
    taxaCentavos: 262,
    autor: "Zé",
    formaPagamento: "credito",
    diasAtras: 1,
    itens: [
      {
        nome: "Óleo 20W50",
        tipo: "produto",
        quantidade: 1,
        precoCentavos: 4500,
      },
      {
        nome: "Troca de óleo",
        tipo: "servico",
        quantidade: 1,
        precoCentavos: 3000,
      },
    ],
  },
  {
    id: "os-4",
    placa: "ABC1D23",
    modelo: "Honda CG 160",
    status: "entregue",
    totalCentavos: 18000,
    custoCentavos: 11500,
    taxaCentavos: 360,
    autor: "Zé",
    formaPagamento: "debito",
    diasAtras: 3,
    itens: [
      {
        nome: "Pneu 90/90-18",
        tipo: "produto",
        quantidade: 1,
        precoCentavos: 15000,
      },
      {
        nome: "Troca de óleo",
        tipo: "servico",
        quantidade: 1,
        precoCentavos: 3000,
      },
    ],
  },
  {
    id: "os-5",
    placa: "KLM5J67",
    modelo: "Honda Biz 110",
    status: "pronto",
    totalCentavos: 6000,
    custoCentavos: 0,
    taxaCentavos: 0,
    autor: "Carlos",
    formaPagamento: null,
    diasAtras: 5,
    itens: [
      {
        nome: "Alinhamento",
        tipo: "servico",
        quantidade: 1,
        precoCentavos: 6000,
      },
    ],
  },
];

// ----- Despesas (só o patrão lança) -----
export interface DespesaMock {
  id: string;
  descricao: string;
  valorCentavos: number;
  categoria: string;
  autor: string;
  diasAtras: number;
}

export const despesasMock: DespesaMock[] = [
  {
    id: "d-1",
    descricao: "Almoço da equipe",
    valorCentavos: 4500,
    categoria: "Alimentação",
    autor: "Zé",
    diasAtras: 0,
  },
  {
    id: "d-2",
    descricao: "Compra de estopa e desengraxante",
    valorCentavos: 3800,
    categoria: "Material",
    autor: "Zé",
    diasAtras: 2,
  },
];

// ----- Custos fixos mensais -----
export interface CustoFixoMock {
  id: string;
  nome: string;
  valorCentavos: number;
}

export const custosFixosMock: CustoFixoMock[] = [
  { id: "cf-1", nome: "Aluguel", valorCentavos: 180000 },
  { id: "cf-2", nome: "Funcionário (Carlos)", valorCentavos: 160000 },
  { id: "cf-3", nome: "Luz", valorCentavos: 32000 },
  { id: "cf-4", nome: "Internet", valorCentavos: 12000 },
  { id: "cf-5", nome: "Contador", valorCentavos: 25000 },
];

// ----- Taxas da maquininha -----
export interface TaxaMock {
  forma: FormaPagamento;
  parcelas: number;
  percentual: number;
}

export const taxasMock: TaxaMock[] = [
  { forma: "pix", parcelas: 1, percentual: 0 },
  { forma: "dinheiro", parcelas: 1, percentual: 0 },
  { forma: "debito", parcelas: 1, percentual: 2 },
  { forma: "credito", parcelas: 1, percentual: 3.5 },
];

// ----- Funcionários -----
export interface FuncionarioMock {
  id: string;
  nome: string;
  ativo: boolean;
  osNoMes: number;
}

export const funcionariosMock: FuncionarioMock[] = [
  { id: "f-1", nome: "Carlos", ativo: true, osNoMes: 18 },
];

/**
 * Funcionário "logado" nas fases de frontend (fictício). Serve para filtrar
 * "Meus lançamentos" e saudação da Conta. Na Fase 10 vem do login real.
 */
export const funcionarioLogadoMock = "Carlos";

// ----- Histórico de alterações (tela Conta) -----
export interface AlteracaoMock {
  id: string;
  texto: string;
  autor: string;
  diasAtras: number;
}

export const alteracoesMock: AlteracaoMock[] = [
  {
    id: "a-1",
    texto: "Preço do Pneu 90/90-18 alterado de R$ 140,00 para R$ 150,00",
    autor: "Zé",
    diasAtras: 1,
  },
  {
    id: "a-2",
    texto: "OS da placa ABC1D23 corrigida (forma de pagamento)",
    autor: "Zé",
    diasAtras: 2,
  },
];
