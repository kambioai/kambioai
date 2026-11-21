// Camada única de acesso a dados — a costura frontend ↔ backend (PLAN.md).
//
// Nas fases de FRONTEND, estas funções devolvem dados fictícios de src/lib/mock.
// Nas fases de BACKEND, a implementação de dentro passa a chamar o Supabase/servidor,
// SEM mudar a assinatura nem os componentes que as consomem.

import { catalogoMock, ordensMock } from "@/lib/mock";

export async function listarCatalogo() {
  return catalogoMock;
}

export async function listarOrdens() {
  return ordensMock;
}
