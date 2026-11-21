// Camada única de acesso a dados — a costura frontend ↔ backend (PLAN.md).
//
// Nas fases de FRONTEND, estas funções devolvem dados fictícios de src/lib/mock.
// Nas fases de BACKEND, a implementação de dentro passa a chamar o Supabase/servidor,
// SEM mudar a assinatura nem os componentes que as consomem.

import {
  catalogoMock,
  ordensMock,
  veiculosMock,
  type ItemCatalogoMock,
  type OrdemMock,
  type VeiculoMock,
} from "@/lib/mock";

export async function listarCatalogo(): Promise<ItemCatalogoMock[]> {
  return catalogoMock;
}

export async function listarVeiculos(): Promise<VeiculoMock[]> {
  return veiculosMock;
}

export async function listarOrdens(): Promise<OrdemMock[]> {
  return ordensMock;
}

/** OS ainda em andamento (para o Pátio). */
export async function listarOrdensAbertas(): Promise<OrdemMock[]> {
  return ordensMock.filter(
    (os) => os.status !== "entregue" && os.status !== "cancelado",
  );
}

export interface ResumoPainel {
  lucroCentavos: number;
  faturamentoCentavos: number;
  custosCentavos: number;
  numeroOS: number;
}

/**
 * Resumo do Painel do patrão. IMPORTANTE: na vida real este cálculo é feito no
 * SERVIDOR (CLAUDE.md §3). Aqui é só um agregado dos dados fictícios para a
 * tela de demonstração da Fase 1.
 */
export async function lerResumoPainel(): Promise<ResumoPainel> {
  const faturadas = ordensMock.filter((os) => os.status === "entregue");
  const faturamentoCentavos = faturadas.reduce(
    (soma, os) => soma + os.totalCentavos,
    0,
  );
  const custosCentavos = faturadas.reduce(
    (soma, os) => soma + os.custoCentavos,
    0,
  );
  return {
    lucroCentavos: faturamentoCentavos - custosCentavos,
    faturamentoCentavos,
    custosCentavos,
    numeroOS: faturadas.length,
  };
}
