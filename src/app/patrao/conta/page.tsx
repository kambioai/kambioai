import { BotaoSair } from "@/components/auth/botao-sair";
import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerDadosConta } from "@/lib/dados";

const ROTULO_SEGMENTO: Record<string, string> = {
  oficina_moto: "Oficina de moto",
  mecanica: "Mecânica",
  funilaria: "Funilaria",
  estetica: "Estética",
  troca_oleo: "Troca de óleo",
  borracharia: "Borracharia",
};

function diasLabel(dias: number): string {
  if (dias === 0) return "hoje";
  if (dias === 1) return "ontem";
  return `há ${dias} dias`;
}

export default async function Conta() {
  const { empresa, alteracoes } = await lerDadosConta();

  return (
    <section className="space-y-5">
      <h1 className="font-grotesk text-titulo font-bold text-principal">
        Conta
      </h1>

      <Cartao>
        <CartaoTitulo>Assinatura</CartaoTitulo>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div>
            <p className="font-grotesk text-titulo font-bold text-principal">
              Kambio {empresa.plano}
            </p>
            <p className="text-legenda text-texto-secundario">
              Próxima cobrança em {empresa.proximaCobranca}
            </p>
          </div>
          <span className="rounded-full bg-confirmado/10 px-3 py-1 text-legenda font-medium text-confirmado">
            Ativa
          </span>
        </div>
        <p className="mt-2 text-corpo text-texto-secundario">
          <ValorReais
            centavos={empresa.valorPlanoCentavos}
            className="text-texto"
          />
          /mês
        </p>
        <Button variant="secundario" className="mt-3 w-full">
          Gerenciar assinatura
        </Button>
      </Cartao>

      <Cartao>
        <CartaoTitulo>Empresa</CartaoTitulo>
        <dl className="mt-1 space-y-1 text-corpo">
          <Linha rotulo="Nome" valor={empresa.nome} />
          <Linha rotulo="Cidade" valor={empresa.cidade} />
          <Linha
            rotulo="Segmento"
            valor={ROTULO_SEGMENTO[empresa.segmento] ?? empresa.segmento}
          />
        </dl>
      </Cartao>

      <Cartao>
        <CartaoTitulo>Histórico de alterações</CartaoTitulo>
        <ul className="mt-2 space-y-3">
          {alteracoes.map((a) => (
            <li key={a.id} className="text-corpo">
              <p className="text-texto">{a.texto}</p>
              <p className="text-legenda text-texto-secundario">
                {a.autor} · {diasLabel(a.diasAtras)}
              </p>
            </li>
          ))}
        </ul>
      </Cartao>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secundario" className="flex-1">
          Exportar dados
        </Button>
        <BotaoSair className="flex-1" />
      </div>
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-texto-secundario">{rotulo}</dt>
      <dd className="font-medium text-texto">{valor}</dd>
    </div>
  );
}
