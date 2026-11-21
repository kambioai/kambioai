import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Ban,
  LifeBuoy,
  Send,
  Ticket,
} from "lucide-react";

import { SeloStatus } from "@/components/admin/selo-status";
import { Button } from "@/components/ui/button";
import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { buscarEmpresaAdmin } from "@/lib/dados/admin";
import { rotuloSegmento } from "@/lib/rotulos";

function diasLabel(dias: number): string {
  if (dias === 0) return "hoje";
  if (dias === 1) return "há 1 dia";
  return `há ${dias} dias`;
}

export default async function FichaEmpresa({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const empresa = await buscarEmpresaAdmin(id);

  return (
    <section className="space-y-5">
      <Link
        href="/admin/empresas"
        className="inline-flex items-center gap-1 text-legenda text-texto-secundario outline-none hover:text-principal focus-visible:text-principal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      {!empresa ? (
        <EstadoVazio
          titulo="Empresa não encontrada"
          mensagem="Não achei nenhuma oficina com esse identificador."
          icone={Building2}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-grotesk text-titulo font-bold text-principal">
                {empresa.nome}
              </h1>
              <p className="text-corpo text-texto-secundario">
                {rotuloSegmento[empresa.segmento]} · {empresa.cidade}
              </p>
            </div>
            <SeloStatus status={empresa.status} />
          </div>

          <Cartao>
            <CartaoTitulo>Assinatura</CartaoTitulo>
            <dl className="mt-1 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Dado rotulo="Plano">Kambio {empresa.plano}</Dado>
              <Dado rotulo="Mensalidade">
                <ValorReais centavos={empresa.mrrCentavos} />
              </Dado>
              <Dado rotulo="Funcionários">{empresa.funcionarios}</Dado>
              <Dado rotulo="Cliente desde">
                {diasLabel(empresa.desdeDias)}
              </Dado>
              <Dado rotulo="Último acesso">
                {diasLabel(empresa.ultimoAcessoDias)}
              </Dado>
              <Dado rotulo="Custo de IA / mês">
                <ValorReais centavos={empresa.custoIaMesCentavos} />
              </Dado>
            </dl>
          </Cartao>

          <Cartao>
            <CartaoTitulo>Monitor da IA</CartaoTitulo>
            <p className="mt-1 text-corpo text-texto">
              Taxa de correção do cartão:{" "}
              <strong>{Math.round(empresa.taxaCorrecao * 100)}%</strong> das OS
            </p>
            <p className="text-legenda text-texto-secundario">
              Quanto menor, mais a IA está acertando as frases dessa oficina.
            </p>
          </Cartao>

          <div className="space-y-3">
            <h2 className="font-grotesk text-corpo font-bold text-principal">
              Ações
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secundario" className="justify-start">
                <CalendarClock className="h-5 w-5" aria-hidden="true" />
                Estender teste
              </Button>
              <Button variant="secundario" className="justify-start">
                <Ticket className="h-5 w-5" aria-hidden="true" />
                Aplicar cupom
              </Button>
              <Button variant="secundario" className="justify-start">
                <Send className="h-5 w-5" aria-hidden="true" />
                Reenviar convite
              </Button>
              <Button variant="secundario" className="justify-start">
                <Ban className="h-5 w-5" aria-hidden="true" />
                {empresa.status === "bloqueada" ? "Desbloquear" : "Bloquear"}
              </Button>
            </div>

            <Cartao className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 font-medium text-texto">
                  <LifeBuoy
                    className="h-5 w-5 text-principal"
                    aria-hidden="true"
                  />
                  Modo suporte
                </p>
                <p className="text-legenda text-texto-secundario">
                  Acesso somente leitura aos dados da oficina. Cada entrada é
                  registrada com data, hora e motivo (LGPD).
                </p>
              </div>
              <Button variant="principal" className="shrink-0">
                Entrar em modo suporte
              </Button>
            </Cartao>
          </div>
        </>
      )}
    </section>
  );
}

function Dado({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-legenda text-texto-secundario">{rotulo}</dt>
      <dd className="mt-0.5 font-medium text-texto">{children}</dd>
    </div>
  );
}
