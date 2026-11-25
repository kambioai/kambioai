// Camada única de acesso a dados — a costura frontend ↔ backend (PLAN.md).
//
// A PARTIR DA FASE 6 esta camada lê do SUPABASE (dados reais), sob RLS, com a
// identidade do usuário logado. As assinaturas e os tipos de retorno NÃO mudam:
// as telas continuam iguais. O patrão lê as tabelas-base; o funcionário lê as
// VIEWS sem colunas de dinheiro (vw_*_funcionario). Dinheiro em centavos.
//
// Ainda fictício (trocado nas fases seguintes): catálogo modelo e custos do
// ONBOARDING (Fase 7) e nomes de autor/funcionário (Fase 10, tabela de perfis).

import { criarClienteServidor } from "@/lib/supabase/server";
import {
  catalogoMock,
  custosFixosMock,
  type CustoFixoMock,
  type ItemCatalogoMock,
  type ItemOrdemMock,
  type OrdemMock,
  type TaxaMock,
  type VeiculoMock,
} from "@/lib/mock";
import type { StatusAssinatura } from "@/lib/stripe/acesso";
import type { FormaPagamento, Segmento, StatusOS, TipoItem } from "@/types";

// Nome de autor ainda não resolvido (vem com a tabela de perfis na Fase 10).
const AUTOR = "—";

export type Periodo = "hoje" | "ontem" | "7dias" | "mes" | "tudo";

export const periodos: { chave: Periodo; rotulo: string }[] = [
  { chave: "hoje", rotulo: "Hoje" },
  { chave: "ontem", rotulo: "Ontem" },
  { chave: "7dias", rotulo: "7 dias" },
  { chave: "mes", rotulo: "Mês" },
  { chave: "tudo", rotulo: "Tudo" },
];

/** Dias (calendário, fuso America/Sao_Paulo) entre uma data e hoje. */
function diasDesde(iso: string): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const diaDe = Date.parse(fmt.format(new Date(iso)));
  const hoje = Date.parse(fmt.format(new Date()));
  return Math.round((hoje - diaDe) / 86_400_000);
}

/** Primeiro dia do mês corrente (fuso America/Sao_Paulo) em ISO, para filtros. */
function primeiroDiaDoMesISO(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const ano = partes.find((p) => p.type === "year")?.value;
  const mes = partes.find((p) => p.type === "month")?.value;
  return `${ano}-${mes}-01T00:00:00-03:00`;
}

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
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("catalogo_itens")
    .select("id, nome, tipo, custo, preco, estoque, estoque_minimo")
    .order("nome");
  return (data ?? []).map((i) => ({
    id: i.id,
    nome: i.nome,
    tipo: i.tipo,
    custoCentavos: i.custo,
    precoCentavos: i.preco,
    estoque: i.estoque,
    estoqueMinimo: i.estoque_minimo,
  }));
}

export async function listarVeiculos(): Promise<VeiculoMock[]> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("veiculos")
    .select("id, placa, modelo, ano, cor, clientes(nome, telefone)")
    .order("placa");
  return (data ?? []).map((v) => ({
    id: v.id,
    placa: v.placa,
    modelo: v.modelo ?? "",
    ano: v.ano ?? 0,
    cor: v.cor ?? "",
    dono: v.clientes?.nome ?? "",
    telefone: v.clientes?.telefone ?? "",
  }));
}

// Seleção padrão de uma OS com veículo e itens (para montar OrdemMock).
const SELECT_OS =
  "id, status, total, custo_total, taxa, forma_pagamento, criado_em, " +
  "veiculos(placa, modelo), os_itens(descricao, quantidade, preco, catalogo_itens(tipo))";

interface LinhaOS {
  id: string;
  status: StatusOS;
  total: number;
  custo_total: number;
  taxa: number;
  forma_pagamento: FormaPagamento | null;
  criado_em: string;
  veiculos: { placa: string; modelo: string | null } | null;
  os_itens: {
    descricao: string;
    quantidade: number;
    preco: number;
    catalogo_itens: { tipo: TipoItem } | null;
  }[];
}

function paraOrdem(o: LinhaOS): OrdemMock {
  const itens: ItemOrdemMock[] = o.os_itens.map((it) => ({
    nome: it.descricao,
    tipo: it.catalogo_itens?.tipo ?? "produto",
    quantidade: it.quantidade,
    precoCentavos: it.preco,
  }));
  return {
    id: o.id,
    placa: o.veiculos?.placa ?? "—",
    modelo: o.veiculos?.modelo ?? "",
    status: o.status,
    totalCentavos: o.total,
    custoCentavos: o.custo_total,
    taxaCentavos: o.taxa,
    autor: AUTOR,
    formaPagamento: o.forma_pagamento,
    itens,
    diasAtras: diasDesde(o.criado_em),
  };
}

export async function listarOrdens(): Promise<OrdemMock[]> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("ordens_servico")
    .select(SELECT_OS)
    .order("criado_em", { ascending: false });
  return ((data ?? []) as unknown as LinhaOS[]).map(paraOrdem);
}

export async function listarOrdensAbertas(): Promise<OrdemMock[]> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("ordens_servico")
    .select(SELECT_OS)
    .not("status", "in", "(entregue,cancelado)")
    .order("criado_em", { ascending: false });
  return ((data ?? []) as unknown as LinhaOS[]).map(paraOrdem);
}

export interface FuncionarioResumo {
  id: string;
  nome: string;
  ativo: boolean;
  osNoMes: number;
}

export async function listarFuncionarios(): Promise<FuncionarioResumo[]> {
  const sb = await criarClienteServidor();
  const { data: membros } = await sb
    .from("membros")
    .select("id, usuario_id, nome, ativo")
    .eq("papel", "funcionario")
    .order("criado_em");

  // OS do mês por funcionário (lançamentos por funcionário — CLAUDE.md §10/§11).
  // Uma consulta só e agrupa em memória (sem N+1).
  const inicioMes = primeiroDiaDoMesISO();
  const { data: oss } = await sb
    .from("ordens_servico")
    .select("autor_id, status")
    .gte("criado_em", inicioMes);
  const contagem = new Map<string, number>();
  for (const o of oss ?? []) {
    if (!o.autor_id || o.status === "cancelado") continue;
    contagem.set(o.autor_id, (contagem.get(o.autor_id) ?? 0) + 1);
  }

  return (membros ?? []).map((m) => ({
    id: m.id,
    nome: m.nome ?? "Funcionário",
    ativo: m.ativo,
    osNoMes: m.usuario_id ? (contagem.get(m.usuario_id) ?? 0) : 0,
  }));
}

export interface ConvitePendente {
  id: string;
  nome: string;
  token: string;
  expiraEm: string;
}

export async function listarConvitesPendentes(): Promise<ConvitePendente[]> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("convites")
    .select("id, nome, token, expira_em")
    .eq("usado", false)
    .order("criado_em", { ascending: false });
  return (data ?? []).map((c) => ({
    id: c.id,
    nome: c.nome,
    token: c.token,
    expiraEm: c.expira_em,
  }));
}

export async function listarTaxas(): Promise<TaxaMock[]> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("taxas_pagamento")
    .select("forma, parcelas, percentual");
  return (data ?? []).map((t) => ({
    forma: t.forma,
    parcelas: t.parcelas,
    percentual: Number(t.percentual),
  }));
}

// ----- Onboarding (ainda fictício até a Fase 7) -----
export async function listarCustosFixos(): Promise<CustoFixoMock[]> {
  return custosFixosMock;
}

export async function listarCatalogoModelo(): Promise<ItemCatalogoMock[]> {
  return catalogoMock;
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
  const sb = await criarClienteServidor();
  const [{ data: osData }, { data: despData }] = await Promise.all([
    sb
      .from("ordens_servico")
      .select("total, custo_total, taxa, criado_em")
      .eq("status", "entregue"),
    sb.from("despesas").select("valor, criado_em"),
  ]);

  const entregues = (osData ?? []).filter((o) =>
    dentroDoPeriodo(diasDesde(o.criado_em), periodo),
  );
  const faturamentoCentavos = entregues.reduce((s, o) => s + o.total, 0);
  const custosCentavos = entregues.reduce((s, o) => s + o.custo_total, 0);
  const taxasCentavos = entregues.reduce((s, o) => s + o.taxa, 0);
  const despesasCentavos = (despData ?? [])
    .filter((d) => dentroDoPeriodo(diasDesde(d.criado_em), periodo))
    .reduce((s, d) => s + d.valor, 0);

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
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("ordens_servico")
    .select("total, custo_total, taxa, criado_em")
    .eq("status", "entregue");

  const porDia = new Map<number, number>();
  for (const o of data ?? []) {
    const d = diasDesde(o.criado_em);
    if (d < 0 || d > 6) continue;
    porDia.set(d, (porDia.get(d) ?? 0) + o.total - o.custo_total - o.taxa);
  }
  return [6, 5, 4, 3, 2, 1, 0].map((d) => ({
    rotulo: d === 0 ? "Hoje" : `${d}d`,
    lucroCentavos: porDia.get(d) ?? 0,
  }));
}

export interface ItemRanking {
  nome: string;
  quantidade: number;
}

export async function listarRanking(): Promise<ItemRanking[]> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("os_itens")
    .select("descricao, quantidade, catalogo_itens(tipo)");

  const contagem = new Map<string, number>();
  for (const item of (data ?? []) as unknown as {
    descricao: string;
    quantidade: number;
    catalogo_itens: { tipo: TipoItem } | null;
  }[]) {
    if (item.catalogo_itens?.tipo === "servico") {
      contagem.set(
        item.descricao,
        (contagem.get(item.descricao) ?? 0) + item.quantidade,
      );
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
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("catalogo_itens")
    .select("nome, estoque, estoque_minimo, tipo");
  return (data ?? [])
    .filter((i) => i.tipo === "produto" && i.estoque <= i.estoque_minimo)
    .map((i) => ({
      tipo: "estoque" as const,
      texto: `${i.nome}: ${i.estoque} em estoque (mínimo ${i.estoque_minimo})`,
    }));
}

export interface ContasDoMes {
  itens: { nome: string; valorCentavos: number }[];
  totalCentavos: number;
}

export async function lerContasDoMes(): Promise<ContasDoMes> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("custos_fixos")
    .select("nome, valor")
    .order("valor", { ascending: false });
  const itens = (data ?? []).map((c) => ({
    nome: c.nome,
    valorCentavos: c.valor,
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
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("ordens_servico")
    .select("total, forma_pagamento, criado_em")
    .eq("status", "entregue");

  const hoje = (data ?? []).filter(
    (o) => o.forma_pagamento !== null && diasDesde(o.criado_em) === 0,
  );

  const formas: FormaPagamento[] = ["dinheiro", "pix", "debito", "credito"];
  const porForma = formas
    .map((forma) => ({
      forma,
      sistemaCentavos: hoje
        .filter((o) => o.forma_pagamento === forma)
        .reduce((s, o) => s + o.total, 0),
    }))
    .filter((l) => l.sistemaCentavos > 0);

  const porAutor: LinhaAutor[] =
    hoje.length > 0
      ? [
          {
            autor: AUTOR,
            totalCentavos: hoje.reduce((s, o) => s + o.total, 0),
            quantidade: hoje.length,
          },
        ]
      : [];

  return {
    porForma,
    porAutor,
    totalCentavos: hoje.reduce((s, o) => s + o.total, 0),
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
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("despesas")
    .select("id, descricao, valor, categoria, criado_em")
    .order("criado_em", { ascending: false });
  return (data ?? [])
    .filter((d) => dentroDoPeriodo(diasDesde(d.criado_em), periodo))
    .map((d) => ({
      id: d.id,
      descricao: d.descricao,
      valorCentavos: d.valor,
      categoria: d.categoria ?? "",
      autor: AUTOR,
    }));
}

// ----- Conta -----
export interface EmpresaConta {
  nome: string;
  cidade: string;
  segmento: Segmento;
  plano: string;
  statusAssinatura: string;
  proximaCobranca: string;
  valorPlanoCentavos: number;
}

export interface AlteracaoView {
  id: string;
  texto: string;
  autor: string;
  diasAtras: number;
}

export interface DadosConta {
  empresa: EmpresaConta;
  alteracoes: AlteracaoView[];
}

export interface AssinaturaInfo {
  plano: "Básico" | "PRO";
  status: StatusAssinatura;
  jaAssinou: boolean;
  valorCentavos: number;
}

/** Estado da assinatura da empresa para a tela Conta. */
export async function lerAssinatura(): Promise<AssinaturaInfo> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("empresas")
    .select("plano, status_assinatura, stripe_subscription_id")
    .limit(1)
    .maybeSingle();
  const pro = data?.plano === "pro";
  return {
    plano: pro ? "PRO" : "Básico",
    status: (data?.status_assinatura ?? "teste") as StatusAssinatura,
    jaAssinou: Boolean(data?.stripe_subscription_id),
    valorCentavos: pro ? 17990 : 12990,
  };
}

const ROTULO_TABELA: Record<string, string> = {
  ordens_servico: "Ordem de serviço",
  despesas: "Despesa",
  catalogo_itens: "Item do catálogo",
};

export async function lerDadosConta(): Promise<DadosConta> {
  const sb = await criarClienteServidor();
  const [{ data: emp }, { data: aud }] = await Promise.all([
    sb
      .from("empresas")
      .select("nome, cidade, segmento, plano, status_assinatura")
      .limit(1)
      .maybeSingle(),
    sb
      .from("auditoria")
      .select("id, tabela, antes, depois, data")
      .order("data", { ascending: false })
      .limit(5),
  ]);

  const planoRotulo = emp?.plano === "pro" ? "PRO" : "Básico";
  const valorPlanoCentavos = emp?.plano === "pro" ? 17990 : 12990;

  const empresa: EmpresaConta = {
    nome: emp?.nome ?? "",
    cidade: emp?.cidade ?? "",
    segmento: emp?.segmento ?? "oficina_moto",
    plano: planoRotulo,
    statusAssinatura: emp?.status_assinatura ?? "ativa",
    proximaCobranca: "—",
    valorPlanoCentavos,
  };

  const alteracoes: AlteracaoView[] = (aud ?? []).map((a) => {
    const acao =
      a.antes === null ? "criado(a)" : a.depois === null ? "excluído(a)" : "alterado(a)";
    return {
      id: a.id,
      texto: `${ROTULO_TABELA[a.tabela] ?? a.tabela} ${acao}`,
      autor: AUTOR,
      diasAtras: diasDesde(a.data),
    };
  });

  return { empresa, alteracoes };
}

// ----- Histórico por placa -----
export async function buscarVeiculo(
  placa: string,
): Promise<VeiculoMock | null> {
  const sb = await criarClienteServidor();
  const alvo = placa.trim().toUpperCase();
  const { data } = await sb
    .from("veiculos")
    .select("id, placa, modelo, ano, cor, clientes(nome, telefone)")
    .ilike("placa", alvo)
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    placa: data.placa,
    modelo: data.modelo ?? "",
    ano: data.ano ?? 0,
    cor: data.cor ?? "",
    dono: data.clientes?.nome ?? "",
    telefone: data.clientes?.telefone ?? "",
  };
}

export async function listarOrdensDoVeiculo(
  placa: string,
): Promise<OrdemMock[]> {
  const sb = await criarClienteServidor();
  const alvo = placa.trim().toUpperCase();
  const { data: v } = await sb
    .from("veiculos")
    .select("id")
    .ilike("placa", alvo)
    .limit(1)
    .maybeSingle();
  if (!v) return [];
  const { data } = await sb
    .from("ordens_servico")
    .select(SELECT_OS)
    .eq("veiculo_id", v.id)
    .order("criado_em", { ascending: false });
  return ((data ?? []) as unknown as LinhaOS[]).map(paraOrdem);
}

/** Uma OS pelo id (tela de detalhe do patrão). */
export async function buscarOrdem(id: string): Promise<OrdemMock | null> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("ordens_servico")
    .select(SELECT_OS)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return paraOrdem(data as unknown as LinhaOS);
}

// ===== Visões do FUNCIONÁRIO (sem dinheiro) =====
//
// O funcionário nunca lê custo, custo_total, taxa nem lucro (CLAUDE.md §4 e §11).
// No banco são VIEWS sem essas colunas; aqui as funções devolvem tipos que nem
// carregam esses campos. Só o preço de venda chega ao funcionário.

export interface ItemCatalogoFuncionario {
  id: string;
  nome: string;
  tipo: TipoItem;
  precoCentavos: number;
  estoque: number;
  estoqueMinimo: number;
}

export async function listarCatalogoFuncionario(): Promise<
  ItemCatalogoFuncionario[]
> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("vw_catalogo_funcionario")
    .select("id, nome, tipo, preco, estoque, estoque_minimo")
    .order("nome");
  return (data ?? []).map((i) => ({
    id: i.id ?? "",
    nome: i.nome ?? "",
    tipo: (i.tipo ?? "produto") as TipoItem,
    precoCentavos: i.preco ?? 0,
    estoque: i.estoque ?? 0,
    estoqueMinimo: i.estoque_minimo ?? 0,
  }));
}

export interface ItemOrdemFuncionario {
  nome: string;
  tipo: TipoItem;
  quantidade: number;
}

export interface OrdemFuncionario {
  id: string;
  placa: string;
  modelo: string;
  status: StatusOS;
  autor: string;
  diasAtras: number;
  itens: ItemOrdemFuncionario[];
}

interface LinhaOSFunc {
  id: string | null;
  status: StatusOS | null;
  veiculo_id: string | null;
  criado_em: string | null;
}

type ClienteServidor = Awaited<ReturnType<typeof criarClienteServidor>>;

// Monta as OS do funcionário SEM embutir relações em views (o PostgREST não faz
// isso de forma confiável): busca veículos e itens em consultas separadas, em
// lote (por IN), evitando N+1.
async function montarOrdensFuncionario(
  sb: ClienteServidor,
  linhas: LinhaOSFunc[],
): Promise<OrdemFuncionario[]> {
  if (linhas.length === 0) return [];

  const veiculoIds = [
    ...new Set(
      linhas.map((l) => l.veiculo_id).filter((v): v is string => v !== null),
    ),
  ];
  const osIds = linhas.map((l) => l.id).filter((v): v is string => v !== null);

  const [{ data: veics }, { data: itens }] = await Promise.all([
    veiculoIds.length > 0
      ? sb.from("veiculos").select("id, placa, modelo").in("id", veiculoIds)
      : Promise.resolve({ data: [] as { id: string; placa: string; modelo: string | null }[] }),
    osIds.length > 0
      ? sb
          .from("vw_os_itens_funcionario")
          .select("os_id, descricao, quantidade")
          .in("os_id", osIds)
      : Promise.resolve({
          data: [] as { os_id: string | null; descricao: string | null; quantidade: number | null }[],
        }),
  ]);

  const mapaVeic = new Map((veics ?? []).map((v) => [v.id, v]));
  const mapaItens = new Map<string, ItemOrdemFuncionario[]>();
  for (const it of itens ?? []) {
    if (!it.os_id) continue;
    const arr = mapaItens.get(it.os_id) ?? [];
    arr.push({
      nome: it.descricao ?? "",
      tipo: "produto",
      quantidade: it.quantidade ?? 1,
    });
    mapaItens.set(it.os_id, arr);
  }

  return linhas.map((o) => {
    const v = o.veiculo_id ? mapaVeic.get(o.veiculo_id) : undefined;
    return {
      id: o.id ?? "",
      placa: v?.placa ?? "—",
      modelo: v?.modelo ?? "",
      status: o.status ?? "orcamento",
      autor: AUTOR,
      diasAtras: o.criado_em ? diasDesde(o.criado_em) : 0,
      itens: o.id ? (mapaItens.get(o.id) ?? []) : [],
    };
  });
}

const SELECT_OS_FUNC = "id, status, veiculo_id, criado_em";

export async function listarOrdensAbertasFuncionario(): Promise<
  OrdemFuncionario[]
> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("vw_ordens_funcionario")
    .select(SELECT_OS_FUNC)
    .not("status", "in", "(entregue,cancelado)")
    .order("criado_em", { ascending: false });
  return montarOrdensFuncionario(sb, (data ?? []) as LinhaOSFunc[]);
}

export async function listarMeusLancamentos(): Promise<OrdemFuncionario[]> {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  const { data } = await sb
    .from("vw_ordens_funcionario")
    .select(SELECT_OS_FUNC)
    .eq("autor_id", user?.id ?? "")
    .order("criado_em", { ascending: false });
  return montarOrdensFuncionario(sb, (data ?? []) as LinhaOSFunc[]);
}

export async function listarOrdensDoVeiculoFuncionario(
  placa: string,
): Promise<OrdemFuncionario[]> {
  const sb = await criarClienteServidor();
  const alvo = placa.trim().toUpperCase();
  const { data: v } = await sb
    .from("veiculos")
    .select("id")
    .ilike("placa", alvo)
    .limit(1)
    .maybeSingle();
  if (!v) return [];
  const { data } = await sb
    .from("vw_ordens_funcionario")
    .select(SELECT_OS_FUNC)
    .eq("veiculo_id", v.id)
    .order("criado_em", { ascending: false });
  return montarOrdensFuncionario(sb, (data ?? []) as LinhaOSFunc[]);
}

export interface ContaFuncionario {
  nome: string;
  empresaNome: string;
}

export async function lerDadosContaFuncionario(): Promise<ContaFuncionario> {
  const sb = await criarClienteServidor();
  const [{ data: user }, { data: emp }] = await Promise.all([
    sb.auth.getUser(),
    sb.from("empresas").select("nome").limit(1).maybeSingle(),
  ]);
  const nome =
    (user.user?.user_metadata?.nome as string | undefined) ?? "Funcionário";
  return { nome, empresaNome: emp?.nome ?? "" };
}
