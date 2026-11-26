import "server-only";

// Camada de dados do PAINEL ADMIN (Fase 13 — dados REAIS). O admin enxerga
// várias empresas, então aqui usamos a SERVICE ROLE (fura a RLS) SEMPRE atrás da
// checagem de admin — as telas que chamam estas funções já são gated pelo layout
// do /admin (ehAdmin). Dinheiro em centavos. Dados da oficina em si só em modo
// suporte (outra rota, registrada).

import { mrrEmpresaCentavos, taxaCorrecao } from "@/lib/admin/metricas";
import type { Plano } from "@/lib/stripe/planos";
import { PRECOS } from "@/lib/stripe/planos";
import { criarClienteServico } from "@/lib/supabase/service";
import type {
  Chamado,
  Comunicado,
  Cupom,
  EmpresaAdmin,
  FraseFalhou,
  PlanoAdmin,
  PontoMrr,
} from "@/lib/mock/admin";
import type { StatusAssinatura } from "@/lib/rotulos";
import type { Segmento } from "@/types";

// Preço de fundador: ainda uma constante (editar/aplicar no Stripe fica p/ depois).
const PRECO_FUNDADOR_CENTAVOS = 9990;

/** Dias (calendário, fuso America/Sao_Paulo) entre uma data e hoje. */
function diasDesde(iso: string): number {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const de = Date.parse(fmt.format(new Date(iso)));
  const hoje = Date.parse(fmt.format(new Date()));
  return Math.round((hoje - de) / 86_400_000);
}

function inicioDoMesISO(): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const ano = partes.find((p) => p.type === "year")?.value;
  const mes = partes.find((p) => p.type === "month")?.value;
  return `${ano}-${mes}-01T00:00:00-03:00`;
}

interface AgregadoEmpresa extends EmpresaAdmin {
  criadoEmISO: string;
  planoChave: Plano;
}

/**
 * Carrega todas as empresas com os agregados do admin em poucas consultas
 * (sem N+1): funcionários ativos, custo/correção de IA no mês e última atividade.
 */
async function carregarEmpresas(): Promise<AgregadoEmpresa[]> {
  const svc = criarClienteServico();
  const inicioMes = inicioDoMesISO();

  const [{ data: empresas }, { data: membros }, { data: uso }, { data: oss }] =
    await Promise.all([
      svc
        .from("empresas")
        .select("id, nome, segmento, cidade, plano, status_assinatura, criado_em")
        .order("criado_em"),
      svc
        .from("membros")
        .select("empresa_id")
        .eq("papel", "funcionario")
        .eq("ativo", true),
      svc
        .from("uso_ia")
        .select("empresa_id, custo, corrigido")
        .gte("criado_em", inicioMes),
      svc.from("ordens_servico").select("empresa_id, criado_em"),
    ]);

  const funcPorEmpresa = new Map<string, number>();
  for (const m of membros ?? []) {
    funcPorEmpresa.set(m.empresa_id, (funcPorEmpresa.get(m.empresa_id) ?? 0) + 1);
  }

  const iaPorEmpresa = new Map<
    string,
    { custo: number; total: number; corrigidas: number }
  >();
  for (const u of uso ?? []) {
    const a = iaPorEmpresa.get(u.empresa_id) ?? {
      custo: 0,
      total: 0,
      corrigidas: 0,
    };
    a.custo += u.custo;
    a.total += 1;
    if (u.corrigido) a.corrigidas += 1;
    iaPorEmpresa.set(u.empresa_id, a);
  }

  const ultimaOS = new Map<string, number>();
  for (const o of oss ?? []) {
    const t = new Date(o.criado_em).getTime();
    if (t > (ultimaOS.get(o.empresa_id) ?? 0)) ultimaOS.set(o.empresa_id, t);
  }

  return (empresas ?? []).map((e) => {
    const planoChave: Plano = e.plano === "pro" ? "pro" : "basico";
    const status = (e.status_assinatura ?? "teste") as StatusAssinatura;
    const funcionarios = funcPorEmpresa.get(e.id) ?? 0;
    const ia = iaPorEmpresa.get(e.id);
    const ultima = ultimaOS.get(e.id);
    return {
      id: e.id,
      nome: e.nome,
      segmento: (e.segmento ?? "oficina_moto") as Segmento,
      cidade: e.cidade ?? "",
      plano: planoChave === "pro" ? "PRO" : "Básico",
      status,
      funcionarios,
      mrrCentavos: mrrEmpresaCentavos(planoChave, status, funcionarios),
      custoIaMesCentavos: ia?.custo ?? 0,
      taxaCorrecao: taxaCorrecao(ia?.corrigidas ?? 0, ia?.total ?? 0),
      desdeDias: diasDesde(e.criado_em),
      ultimoAcessoDias: ultima
        ? diasDesde(new Date(ultima).toISOString())
        : diasDesde(e.criado_em),
      criadoEmISO: e.criado_em,
      planoChave,
    };
  });
}

// ----- Listagens / ficha -----
export async function listarEmpresasAdmin(): Promise<EmpresaAdmin[]> {
  return carregarEmpresas();
}

export async function buscarEmpresaAdmin(
  id: string,
): Promise<EmpresaAdmin | null> {
  const empresas = await carregarEmpresas();
  return empresas.find((e) => e.id === id) ?? null;
}

// ----- Visão geral -----
export interface ContagemStatus {
  status: StatusAssinatura;
  quantidade: number;
}

export interface VisaoGeralAdmin {
  mrrCentavos: number;
  custoIaMesCentavos: number;
  margemCentavos: number;
  totalEmpresas: number;
  ativas: number;
  porStatus: ContagemStatus[];
  emRisco: EmpresaAdmin[];
  mrrPorMes: PontoMrr[];
}

const fmtMes = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  month: "short",
});

/** MRR dos últimos 6 meses (aprox.): soma do que as empresas ATIVAS criadas até
 * o fim de cada mês pagam hoje. Sem histórico de status, é uma curva de adesão. */
function mrrPorMes(empresas: AgregadoEmpresa[]): PontoMrr[] {
  const agora = new Date();
  const pontos: PontoMrr[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const fimMes = new Date(
      Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - i + 1, 1),
    ).getTime();
    const valor = empresas
      .filter(
        (e) =>
          e.status === "ativa" && new Date(e.criadoEmISO).getTime() < fimMes,
      )
      .reduce((s, e) => s + e.mrrCentavos, 0);
    const rotulo = fmtMes
      .format(new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - i, 1)))
      .replace(".", "");
    pontos.push({ rotulo, valorCentavos: valor });
  }
  return pontos;
}

export async function lerVisaoGeralAdmin(): Promise<VisaoGeralAdmin> {
  const empresas = await carregarEmpresas();
  const mrrCentavos = empresas
    .filter((e) => e.status === "ativa")
    .reduce((s, e) => s + e.mrrCentavos, 0);
  const custoIaMesCentavos = empresas.reduce(
    (s, e) => s + e.custoIaMesCentavos,
    0,
  );

  const ordem: StatusAssinatura[] = [
    "ativa",
    "teste",
    "inadimplente",
    "bloqueada",
    "cancelada",
  ];
  const porStatus: ContagemStatus[] = ordem
    .map((status) => ({
      status,
      quantidade: empresas.filter((e) => e.status === status).length,
    }))
    .filter((c) => c.quantidade > 0);

  const emRisco = empresas.filter(
    (e) =>
      e.status === "inadimplente" ||
      e.status === "bloqueada" ||
      e.status === "teste",
  );

  return {
    mrrCentavos,
    custoIaMesCentavos,
    margemCentavos: mrrCentavos - custoIaMesCentavos,
    totalEmpresas: empresas.length,
    ativas: empresas.filter((e) => e.status === "ativa").length,
    porStatus,
    emRisco,
    mrrPorMes: mrrPorMes(empresas),
  };
}

// ----- Uso da IA -----
export interface UsoIaEmpresa {
  id: string;
  nome: string;
  custoMesCentavos: number;
  taxaCorrecao: number;
}

export interface UsoIaAdmin {
  custoMesCentavos: number;
  taxaCorrecaoMedia: number;
  porEmpresa: UsoIaEmpresa[];
  frasesFalharam: FraseFalhou[];
}

export async function lerUsoIaAdmin(): Promise<UsoIaAdmin> {
  const empresas = await carregarEmpresas();
  const custoMesCentavos = empresas.reduce(
    (s, e) => s + e.custoIaMesCentavos,
    0,
  );
  const comUso = empresas.filter((e) => e.custoIaMesCentavos > 0 || e.taxaCorrecao > 0);
  const taxaCorrecaoMedia =
    comUso.length > 0
      ? comUso.reduce((s, e) => s + e.taxaCorrecao, 0) / comUso.length
      : 0;

  const porEmpresa: UsoIaEmpresa[] = empresas
    .map((e) => ({
      id: e.id,
      nome: e.nome,
      custoMesCentavos: e.custoIaMesCentavos,
      taxaCorrecao: e.taxaCorrecao,
    }))
    .sort((a, b) => b.custoMesCentavos - a.custoMesCentavos);

  // "Frases que falharam" ainda não é capturado (uso_ia não guarda a transcrição
  // da falha). Fica a lista vazia (estado honesto) até termos essa captura.
  return { custoMesCentavos, taxaCorrecaoMedia, porEmpresa, frasesFalharam: [] };
}

// ----- Planos / Cupons -----
export interface PlanosAdmin {
  planos: PlanoAdmin[];
  cupons: Cupom[];
  precoFundadorCentavos: number;
}

export async function lerPlanosAdmin(): Promise<PlanosAdmin> {
  const svc = criarClienteServico();
  const empresas = await carregarEmpresas();

  const ativas = empresas.filter((e) => e.status === "ativa");
  const assinantesBasico = ativas.filter((e) => e.planoChave === "basico").length;
  const assinantesPro = ativas.filter((e) => e.planoChave === "pro").length;
  const adicionais = ativas.reduce(
    (s, e) => s + Math.max(0, e.funcionarios - 2),
    0,
  );

  const planos: PlanoAdmin[] = [
    {
      nome: "Básico",
      precoCentavos: PRECOS.basico,
      descricao: "1 patrão, registro por voz",
      assinantes: assinantesBasico,
    },
    {
      nome: "PRO",
      precoCentavos: PRECOS.pro,
      descricao: "2 funcionários inclusos",
      assinantes: assinantesPro,
    },
    {
      nome: "Funcionário adicional",
      precoCentavos: PRECOS.funcionarioAdicional,
      descricao: "A partir do 3º funcionário, cada um",
      assinantes: adicionais,
    },
  ];

  const { data: cuponsRaw } = await svc
    .from("cupons")
    .select("codigo, descricao, usos, validade, ativo")
    .eq("ativo", true)
    .order("criado_em", { ascending: false });
  const cupons: Cupom[] = (cuponsRaw ?? []).map((c) => ({
    codigo: c.codigo,
    descricao: c.descricao,
    usos: c.usos,
    validade: c.validade
      ? new Date(c.validade).toLocaleDateString("pt-BR")
      : "Sem validade",
  }));

  return { planos, cupons, precoFundadorCentavos: PRECO_FUNDADOR_CENTAVOS };
}

// ----- Suporte (chamados) -----
export async function listarChamados(): Promise<Chamado[]> {
  const svc = criarClienteServico();
  const [{ data: chamados }, { data: empresas }] = await Promise.all([
    svc
      .from("chamados")
      .select("id, empresa_id, assunto, status, prioridade, criado_em")
      .order("criado_em", { ascending: false }),
    svc.from("empresas").select("id, nome"),
  ]);
  const nomePorId = new Map((empresas ?? []).map((e) => [e.id, e.nome]));
  return (chamados ?? []).map((c) => ({
    id: c.id,
    empresa: nomePorId.get(c.empresa_id) ?? "—",
    assunto: c.assunto,
    status: c.status as Chamado["status"],
    prioridade: c.prioridade as Chamado["prioridade"],
    diasAtras: diasDesde(c.criado_em),
  }));
}

// ----- Comunicados -----
export async function listarComunicados(): Promise<Comunicado[]> {
  const svc = criarClienteServico();
  const { data } = await svc
    .from("comunicados")
    .select("id, titulo, publico, status, alcance, criado_em, enviado_em")
    .order("criado_em", { ascending: false });
  return (data ?? []).map((c) => ({
    id: c.id,
    titulo: c.titulo,
    publico: rotuloPublico(c.publico),
    status: c.status === "enviado" ? "enviado" : "rascunho",
    alcance: c.alcance,
    diasAtras: diasDesde(c.enviado_em ?? c.criado_em),
  }));
}

export function rotuloPublico(publico: string): string {
  if (publico === "todas") return "Todas as oficinas";
  if (publico === "basico") return "Plano Básico";
  if (publico === "pro") return "Plano PRO";
  return `Segmento: ${publico}`;
}
