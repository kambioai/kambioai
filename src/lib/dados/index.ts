// Camada única de acesso a dados — a costura frontend ↔ backend (PLAN.md).
//
// Nas fases de FRONTEND, estas funções devolvem dados fictícios de src/lib/mock.
// Nas fases de BACKEND, a implementação de dentro passa a chamar o Supabase/servidor,
// SEM mudar a assinatura nem os componentes que as consomem.
//
// IMPORTANTE: os cálculos de dinheiro aqui são um faz-de-conta do servidor. Na
// vida real eles acontecem no SERVIDOR (CLAUDE.md §3). Valores em centavos.

import {
  alteracoesMock,
  catalogoMock,
  custosFixosMock,
  despesasMock,
  empresaMock,
  funcionariosMock,
  ordensMock,
  taxasMock,
  veiculosMock,
  type AlteracaoMock,
  type FuncionarioMock,
  type ItemCatalogoMock,
  type OrdemMock,
  type TaxaMock,
  type VeiculoMock,
} from "@/lib/mock";
import type { FormaPagamento } from "@/types";

export type Periodo = "hoje" | "ontem" | "7dias" | "mes" | "tudo";

export const periodos: { chave: Periodo; rotulo: string }[] = [
  { chave: "hoje", rotulo: "Hoje" },
  { chave: "ontem", rotulo: "Ontem" },
  { chave: "7dias", rotulo: "7 dias" },
  { chave: "mes", rotulo: "Mês" },
  { chave: "tudo", rotulo: "Tudo" },
];

function dentroDoPeriodo(diasAtras: number, periodo: Periodo): boolean {
  switch (periodo) {
    case "hoje":
      return diasAtras === 0;
    case "ontem":
      return diasAtras === 1;
    case "7dias":
      return diasAtras <= 6;
    case "mes":
      return diasAtras <= 30;
    case "tudo":
      return true;
  }
}

// ----- Listagens simples -----
export async function listarCatalogo(): Promise<ItemCatalogoMock[]> {
  return catalogoMock;
}

export async function listarVeiculos(): Promise<VeiculoMock[]> {
  return veiculosMock;
}

export async function listarOrdens(): Promise<OrdemMock[]> {
  return ordensMock;
}

export async function listarOrdensAbertas(): Promise<OrdemMock[]> {
  return ordensMock.filter(
    (os) => os.status !== "entregue" && os.status !== "cancelado",
  );
}

export async function listarFuncionarios(): Promise<FuncionarioMock[]> {
  return funcionariosMock;
}

export async function listarTaxas(): Promise<TaxaMock[]> {
  return taxasMock;
}

// ----- Painel -----
export interface ResumoPainel {
  lucroCentavos: number;
  faturamentoCentavos: number;
  custosCentavos: number;
  taxasCentavos: number;
  despesasCentavos: number;
  numeroOS: number;
}

export async function lerResumoPainel(periodo: Periodo): Promise<ResumoPainel> {
  const entregues = ordensMock.filter(
    (os) => os.status === "entregue" && dentroDoPeriodo(os.diasAtras, periodo),
  );
  const faturamentoCentavos = entregues.reduce(
    (s, o) => s + o.totalCentavos,
    0,
  );
  const custosCentavos = entregues.reduce((s, o) => s + o.custoCentavos, 0);
  const taxasCentavos = entregues.reduce((s, o) => s + o.taxaCentavos, 0);
  const despesasCentavos = despesasMock
    .filter((d) => dentroDoPeriodo(d.diasAtras, periodo))
    .reduce((s, d) => s + d.valorCentavos, 0);

  return {
    faturamentoCentavos,
    custosCentavos,
    taxasCentavos,
    despesasCentavos,
    lucroCentavos:
      faturamentoCentavos - custosCentavos - taxasCentavos - despesasCentavos,
    numeroOS: entregues.length,
  };
}

export interface PontoLucro {
  rotulo: string;
  lucroCentavos: number;
}

export async function listarLucroPorDia(): Promise<PontoLucro[]> {
  const dias = [6, 5, 4, 3, 2, 1, 0];
  return dias.map((d) => {
    const entregues = ordensMock.filter(
      (o) => o.status === "entregue" && o.diasAtras === d,
    );
    const lucroCentavos = entregues.reduce(
      (s, o) => s + o.totalCentavos - o.custoCentavos - o.taxaCentavos,
      0,
    );
    return { rotulo: d === 0 ? "Hoje" : `${d}d`, lucroCentavos };
  });
}

export interface ItemRanking {
  nome: string;
  quantidade: number;
}

export async function listarRanking(): Promise<ItemRanking[]> {
  const contagem = new Map<string, number>();
  for (const os of ordensMock) {
    for (const item of os.itens) {
      if (item.tipo === "servico") {
        contagem.set(
          item.nome,
          (contagem.get(item.nome) ?? 0) + item.quantidade,
        );
      }
    }
  }
  return [...contagem.entries()]
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5);
}

export interface Alerta {
  tipo: "estoque" | "retorno";
  texto: string;
}

export async function listarAlertas(): Promise<Alerta[]> {
  const estoque: Alerta[] = catalogoMock
    .filter((i) => i.tipo === "produto" && i.estoque <= i.estoqueMinimo)
    .map((i) => ({
      tipo: "estoque",
      texto: `${i.nome}: ${i.estoque} em estoque (mínimo ${i.estoqueMinimo})`,
    }));
  const retorno: Alerta[] = [
    {
      tipo: "retorno",
      texto: "Honda Biz 110 (KLM5J67): troca de óleo vence em 3 dias",
    },
  ];
  return [...estoque, ...retorno];
}

export interface ContasDoMes {
  itens: { nome: string; valorCentavos: number }[];
  totalCentavos: number;
}

export async function lerContasDoMes(): Promise<ContasDoMes> {
  const itens = custosFixosMock.map((c) => ({
    nome: c.nome,
    valorCentavos: c.valorCentavos,
  }));
  return {
    itens,
    totalCentavos: itens.reduce((s, i) => s + i.valorCentavos, 0),
  };
}

// ----- Fechamento do dia -----
export interface LinhaFechamento {
  forma: FormaPagamento;
  sistemaCentavos: number;
}

export interface LinhaAutor {
  autor: string;
  totalCentavos: number;
  quantidade: number;
}

export interface Fechamento {
  porForma: LinhaFechamento[];
  porAutor: LinhaAutor[];
  totalCentavos: number;
}

export async function lerFechamentoHoje(): Promise<Fechamento> {
  const entregues = ordensMock.filter(
    (o) => o.status === "entregue" && o.diasAtras === 0 && o.formaPagamento,
  );
  const formas: FormaPagamento[] = ["dinheiro", "pix", "debito", "credito"];
  const porForma = formas
    .map((forma) => ({
      forma,
      sistemaCentavos: entregues
        .filter((o) => o.formaPagamento === forma)
        .reduce((s, o) => s + o.totalCentavos, 0),
    }))
    .filter((l) => l.sistemaCentavos > 0);

  const autores = [...new Set(entregues.map((o) => o.autor))];
  const porAutor = autores.map((autor) => {
    const doAutor = entregues.filter((o) => o.autor === autor);
    return {
      autor,
      totalCentavos: doAutor.reduce((s, o) => s + o.totalCentavos, 0),
      quantidade: doAutor.length,
    };
  });

  return {
    porForma,
    porAutor,
    totalCentavos: entregues.reduce((s, o) => s + o.totalCentavos, 0),
  };
}

// ----- Despesas -----
export interface DespesaView {
  id: string;
  descricao: string;
  valorCentavos: number;
  categoria: string;
  autor: string;
}

export async function listarDespesas(periodo: Periodo): Promise<DespesaView[]> {
  return despesasMock
    .filter((d) => dentroDoPeriodo(d.diasAtras, periodo))
    .map(({ id, descricao, valorCentavos, categoria, autor }) => ({
      id,
      descricao,
      valorCentavos,
      categoria,
      autor,
    }));
}

// ----- Conta -----
export interface DadosConta {
  empresa: typeof empresaMock;
  alteracoes: AlteracaoMock[];
}

export async function lerDadosConta(): Promise<DadosConta> {
  return { empresa: empresaMock, alteracoes: alteracoesMock };
}

// ----- Histórico por placa -----
export async function buscarVeiculo(
  placa: string,
): Promise<VeiculoMock | null> {
  const alvo = placa.trim().toUpperCase();
  return veiculosMock.find((v) => v.placa.toUpperCase() === alvo) ?? null;
}

export async function listarOrdensDoVeiculo(
  placa: string,
): Promise<OrdemMock[]> {
  const alvo = placa.trim().toUpperCase();
  return ordensMock.filter((o) => o.placa.toUpperCase() === alvo);
}
