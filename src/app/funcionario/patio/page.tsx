import { Car } from "lucide-react";

import { Cartao } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { listarOrdensAbertas } from "@/lib/dados";
import { rotuloStatus } from "@/lib/rotulos";

// Área do funcionário: NUNCA mostra custo, lucro ou financeiro (CLAUDE.md §11).
export default async function PatioFuncionario() {
  const ordens = await listarOrdensAbertas();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Pátio
      </h1>

      {ordens.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma OS aberta"
          mensagem="Toque em Falar pra registrar o primeiro serviço do dia."
          icone={Car}
        />
      ) : (
        <ul className="space-y-3">
          {ordens.map((os) => (
            <Cartao
              key={os.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-texto">
                  {os.placa} · {os.modelo}
                </p>
                <p className="text-legenda text-texto-secundario">
                  Registrado por {os.autor}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-principal">
                {rotuloStatus[os.status]}
              </span>
            </Cartao>
          ))}
        </ul>
      )}
    </section>
  );
}
