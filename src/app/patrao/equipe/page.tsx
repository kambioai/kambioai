import { GerenciarEquipe } from "@/components/equipe/gerenciar-equipe";
import { listarConvitesPendentes, listarFuncionarios } from "@/lib/dados";

// Equipe (patrão): convidar por link, cancelar convite, ativar/desativar e ver
// os lançamentos de cada funcionário no mês (Fase 10).
export default async function Equipe() {
  const [funcionarios, convites] = await Promise.all([
    listarFuncionarios(),
    listarConvitesPendentes(),
  ]);

  return <GerenciarEquipe funcionarios={funcionarios} convites={convites} />;
}
