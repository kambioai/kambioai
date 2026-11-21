import { UserPlus } from "lucide-react";

import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { Button } from "@/components/ui/button";
import { Cartao } from "@/components/ui/cartao";
import { listarFuncionarios } from "@/lib/dados";

export default async function Equipe() {
  const funcionarios = await listarFuncionarios();

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Equipe
        </h1>
        <Button size="sm">
          <UserPlus className="h-5 w-5" aria-hidden="true" />
          Convidar
        </Button>
      </div>

      {funcionarios.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum funcionário ainda"
          mensagem="Convide alguém para registrar OS por você. Cada funcionário tem o próprio login."
          icone={UserPlus}
          acao={<Button variant="principal">Convidar funcionário</Button>}
        />
      ) : (
        <ul className="space-y-3">
          {funcionarios.map((f) => (
            <Cartao
              key={f.id}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-medium text-texto">{f.nome}</p>
                <p className="text-legenda text-texto-secundario">
                  {f.osNoMes} OS no mês
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-confirmado/10 px-3 py-1 text-legenda font-medium text-confirmado">
                  {f.ativo ? "Ativo" : "Inativo"}
                </span>
                <Button variant="secundario" size="sm">
                  Desativar
                </Button>
              </div>
            </Cartao>
          ))}
        </ul>
      )}
    </section>
  );
}
