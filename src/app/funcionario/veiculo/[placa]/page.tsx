import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";

import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { Cartao } from "@/components/ui/cartao";
import {
  buscarVeiculo,
  listarOrdensDoVeiculoFuncionario,
} from "@/lib/dados";
import { rotuloStatus } from "@/lib/rotulos";

function diasLabel(dias: number): string {
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `Há ${dias} dias`;
}

// Histórico por placa para o funcionário: serviços e status, SEM total gasto
// do cliente e SEM lucro (CLAUDE.md §11). Os dados já chegam sem valores.
export default async function FichaVeiculoFuncionario({
  params,
}: {
  params: Promise<{ placa: string }>;
}) {
  const { placa } = await params;
  const placaDec = decodeURIComponent(placa);
  const [veiculo, ordens] = await Promise.all([
    buscarVeiculo(placaDec),
    listarOrdensDoVeiculoFuncionario(placaDec),
  ]);

  return (
    <section className="space-y-5">
      <Link
        href="/funcionario/patio"
        className="inline-flex items-center gap-1 text-legenda text-texto-secundario outline-none hover:text-principal focus-visible:text-principal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      {!veiculo ? (
        <EstadoVazio
          titulo="Placa não encontrada"
          mensagem={`Não achei nenhum veículo com a placa ${placaDec}.`}
          icone={Car}
        />
      ) : (
        <>
          <div>
            <h1 className="font-grotesk text-titulo font-bold text-principal">
              {veiculo.placa}
            </h1>
            <p className="text-corpo text-texto">
              {veiculo.modelo} · {veiculo.ano} · {veiculo.cor}
            </p>
            <p className="text-legenda text-texto-secundario">{veiculo.dono}</p>
          </div>

          <h2 className="font-grotesk text-titulo font-bold text-principal">
            Histórico de serviços
          </h2>
          {ordens.length === 0 ? (
            <EstadoVazio
              titulo="Sem OS ainda"
              mensagem="Este veículo ainda não tem ordens de serviço."
            />
          ) : (
            <ol className="space-y-3">
              {ordens.map((os) => (
                <Cartao key={os.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-legenda text-texto-secundario">
                      {diasLabel(os.diasAtras)}
                    </span>
                    <span className="rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-principal">
                      {rotuloStatus[os.status]}
                    </span>
                  </div>
                  <p className="text-corpo text-texto">
                    {os.itens.map((i) => i.nome).join(" · ")}
                  </p>
                </Cartao>
              ))}
            </ol>
          )}
        </>
      )}
    </section>
  );
}
