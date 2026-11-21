// Camada de dados do PAINEL ADMIN (Fase 5). Hoje devolve/derivada de mock;
// na Fase 13 passa a ler do Supabase (com modo suporte registrado), sem mudar
// as telas. Dinheiro em centavos; cálculos aqui são faz-de-conta do servidor.

import {
  chamadosMock,
  comunicadosMock,
  cuponsMock,
  empresasAdminMock,
  frasesFalharamMock,
  mrrPorMesMock,
  planosAdminMock,
  precoFundadorCentavos,
  type Chamado,
  type Comunicado,
  type Cupom,
  type EmpresaAdmin,
  type FraseFalhou,
  type PlanoAdmin,
  type PontoMrr,
} from "@/lib/mock/admin";
import type { StatusAssinatura } from "@/lib/rotulos";

// ----- Listagens / ficha -----
export async function listarEmpresasAdmin(): Promise<EmpresaAdmin[]> {
  return empresasAdminMock;
}

export async function buscarEmpresaAdmin(
  id: string,
): Promise<EmpresaAdmin | null> {
  return empresasAdminMock.find((e) => e.id === id) ?? null;
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

export async function lerVisaoGeralAdmin(): Promise<VisaoGeralAdmin> {
  const empresas = empresasAdminMock;
  // MRR realizado: só quem está com assinatura ativa.
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
    mrrPorMes: mrrPorMesMock,
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
  const empresas = empresasAdminMock;
  const custoMesCentavos = empresas.reduce(
    (s, e) => s + e.custoIaMesCentavos,
    0,
  );
  const taxaCorrecaoMedia =
    empresas.length > 0
      ? empresas.reduce((s, e) => s + e.taxaCorrecao, 0) / empresas.length
      : 0;

  const porEmpresa: UsoIaEmpresa[] = empresas
    .map((e) => ({
      id: e.id,
      nome: e.nome,
      custoMesCentavos: e.custoIaMesCentavos,
      taxaCorrecao: e.taxaCorrecao,
    }))
    .sort((a, b) => b.custoMesCentavos - a.custoMesCentavos);

  return {
    custoMesCentavos,
    taxaCorrecaoMedia,
    porEmpresa,
    frasesFalharam: frasesFalharamMock,
  };
}

// ----- Planos / Suporte / Comunicados -----
export interface PlanosAdmin {
  planos: PlanoAdmin[];
  cupons: Cupom[];
  precoFundadorCentavos: number;
}

export async function lerPlanosAdmin(): Promise<PlanosAdmin> {
  return { planos: planosAdminMock, cupons: cuponsMock, precoFundadorCentavos };
}

export async function listarChamados(): Promise<Chamado[]> {
  return chamadosMock;
}

export async function listarComunicados(): Promise<Comunicado[]> {
  return comunicadosMock;
}
