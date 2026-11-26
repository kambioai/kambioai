import {
  BotaoAssinar,
  BotaoPortal,
} from "@/components/assinatura/botoes-assinatura";
import { BotaoSair } from "@/components/auth/botao-sair";
import { AtivarPush } from "@/components/push/ativar-push";
import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { lerAssinatura, lerDadosConta } from "@/lib/dados";
import type { StatusAssinatura } from "@/lib/stripe/acesso";

const ASSINATURA_ROTULO: Record<
  StatusAssinatura,
  { texto: string; classe: string }
> = {
  ativa: { texto: "Ativa", classe: "bg-confirmado/10 text-confirmado" },
  teste: { texto: "Em teste", classe: "bg-fundo text-texto-secundario" },
  inadimplente: {
    texto: "Pagamento pendente",
    classe: "bg-atencao-fundo text-atencao",
  },
  bloqueada: { texto: "Bloqueada", classe: "bg-erro-fundo text-erro" },
  cancelada: { texto: "Cancelada", classe: "bg-fundo text-texto-secundario" },
};

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
  const [{ empresa, alteracoes }, assinatura] = await Promise.all([
    lerDadosConta(),
    lerAssinatura(),
  ]);
  const badge = ASSINATURA_ROTULO[assinatura.status];

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
              Kambio {assinatura.plano}
            </p>
            <p className="mt-1 text-corpo text-texto-secundario">
              <ValorReais
                centavos={assinatura.valorCentavos}
                className="text-texto"
              />
              /mês
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-legenda font-medium ${badge.classe}`}
          >
            {badge.texto}
          </span>
        </div>
        {assinatura.jaAssinou ? (
          <BotaoPortal className="mt-3" />
        ) : (
          <BotaoAssinar className="mt-3">Assinar o Kambio</BotaoAssinar>
        )}
      </Cartao>

      <AtivarPush />

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
