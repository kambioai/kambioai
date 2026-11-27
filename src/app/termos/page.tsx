import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de uso — Kambio",
};

export default function Termos() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-legenda text-texto-secundario hover:text-principal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar
      </Link>

      <h1 className="font-grotesk text-painel font-bold text-principal">
        Termos de uso
      </h1>
      <p className="mt-2 text-legenda text-texto-secundario">
        Última atualização: 26/11/2026
      </p>

      <div className="mt-6 space-y-6 text-corpo text-texto">
        <Secao titulo="1. O que é o Kambio">
          O Kambio é um aplicativo para oficinas registrarem serviços, estoque,
          caixa e lucro — inclusive pela voz. O serviço é oferecido por
          assinatura mensal.
        </Secao>
        <Secao titulo="2. Conta e uso">
          Você é responsável por manter a senha em segurança e pelo uso da conta
          pela sua equipe. Cada oficina só acessa os próprios dados. O
          funcionário tem acesso limitado (não vê custo nem lucro), definido
          pelo dono.
        </Secao>
        <Secao titulo="3. Assinatura e pagamento">
          A cobrança é mensal, no cartão, processada pela Stripe. Em caso de
          falta de pagamento, o acesso pode ser reduzido a somente leitura e
          depois bloqueado, conforme avisado no app. Ao regularizar, o acesso
          volta. Você pode cancelar a qualquer momento pelo portal de
          pagamento.
        </Secao>
        <Secao titulo="4. Registro por voz e a IA">
          O registro por voz usa inteligência artificial apenas para{" "}
          <strong>interpretar</strong> o que foi dito. Todo cálculo de dinheiro
          é feito pelo servidor, e nada é salvo sem a sua confirmação num cartão
          na tela. A IA pode errar — por isso a confirmação é obrigatória.
        </Secao>
        <Secao titulo="5. Disponibilidade">
          Fazemos o possível para manter o serviço no ar, mas pode haver
          manutenções e indisponibilidades. Não nos responsabilizamos por perdas
          decorrentes de interrupções fora do nosso controle.
        </Secao>
        <Secao titulo="6. Seus dados">
          O tratamento dos seus dados segue a nossa{" "}
          <Link href="/privacidade" className="text-principal underline">
            Política de Privacidade
          </Link>
          , em conformidade com a LGPD.
        </Secao>
        <Secao titulo="7. Contato">
          Dúvidas sobre estes termos: contato@kambio.com.br.
        </Secao>
      </div>
    </main>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-grotesk text-corpo font-bold text-principal">
        {titulo}
      </h2>
      <p className="mt-1 leading-relaxed text-texto-secundario">{children}</p>
    </section>
  );
}
