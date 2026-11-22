import { ClipboardList } from "lucide-react";

import { BotaoSair } from "@/components/auth/botao-sair";
import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { listarMeusLancamentos, lerDadosContaFuncionario } from "@/lib/dados";
import { rotuloStatus } from "@/lib/rotulos";

function diasLabel(dias: number): string {
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Ontem";
  return `Há ${dias} dias`;
}

// Conta do funcionário: quem ele é, Meus lançamentos e sair.
// Nenhum valor financeiro aparece aqui (CLAUDE.md §11).
export default async function ContaFuncionario() {
  const [conta, lancamentos] = await Promise.all([
    lerDadosContaFuncionario(),
    listarMeusLancamentos(),
  ]);

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Conta
      </h1>

      <Cartao>
        <CartaoTitulo>Você</CartaoTitulo>
        <p className="font-grotesk text-titulo font-bold text-principal">
          {conta.nome}
        </p>
        <p className="text-legenda text-texto-secundario">
          Funcionário · {conta.empresaNome}
        </p>
      </Cartao>

      <div>
        <h2 className="mb-3 font-grotesk text-titulo font-bold text-principal">
          Meus lançamentos
        </h2>
        {lancamentos.length === 0 ? (
          <EstadoVazio
            titulo="Nada lançado ainda"
            mensagem="Toque em Falar pra registrar seu primeiro serviço."
            icone={ClipboardList}
          />
        ) : (
          <ul className="space-y-3">
            {lancamentos.map((os) => {
              // Só dá pra corrigir o próprio lançamento até o fechamento do dia.
              const podeCorrigir = os.diasAtras === 0;
              return (
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
                    {os.placa} · {os.itens.map((i) => i.nome).join(" · ")}
                  </p>
                  {podeCorrigir ? (
                    <Button variant="secundario" size="sm">
                      Corrigir
                    </Button>
                  ) : (
                    <p className="text-legenda text-texto-secundario">
                      Dia fechado — só o patrão pode alterar.
                    </p>
                  )}
                </Cartao>
              );
            })}
          </ul>
        )}
      </div>

      <BotaoSair className="w-full" />
    </section>
  );
}
