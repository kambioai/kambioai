import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade — Kambio",
};

export default function Privacidade() {
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
        Política de Privacidade
      </h1>
      <p className="mt-2 text-legenda text-texto-secundario">
        Última atualização: 26/11/2026 · Em conformidade com a LGPD (Lei
        13.709/2018)
      </p>

      <div className="mt-6 space-y-6 text-corpo text-texto">
        <Secao titulo="1. Quem trata os seus dados">
          O Kambio é o controlador dos dados que você registra no aplicativo
          (oficina, clientes, veículos, serviços, estoque e caixa). Contato do
          encarregado: contato@kambio.com.br.
        </Secao>
        <Secao titulo="2. Dados que coletamos">
          Dados de cadastro (nome, e-mail, celular), dados da oficina e da
          operação que você registra, e dados técnicos de uso. Não vendemos seus
          dados e não os usamos para publicidade.
        </Secao>
        <Secao titulo="3. Registro por voz e o Google">
          Quando você usa o registro por voz, o áudio é enviado para o serviço
          de inteligência artificial do <strong>Google (Gemini)</strong>, que o
          transcreve e interpreta. <strong>O áudio é apagado logo após o
          processamento</strong> — guardamos apenas a transcrição em texto,
          ligada à ordem de serviço. Ao falar, você concorda com esse
          processamento.
        </Secao>
        <Secao titulo="4. Serviços que usamos (operadores)">
          Para funcionar, o Kambio usa: <strong>Supabase</strong> (banco de
          dados e login), <strong>Vercel</strong> (hospedagem),{" "}
          <strong>Google</strong> (IA de voz), <strong>Stripe</strong>{" "}
          (pagamentos) e <strong>Resend</strong> (e-mails). Cada um trata apenas
          o necessário para o seu serviço.
        </Secao>
        <Secao titulo="5. Isolamento entre oficinas">
          Cada oficina só acessa os próprios dados — o isolamento é garantido no
          banco de dados. O suporte do Kambio só acessa os dados de uma oficina
          em modo somente leitura, e cada acesso fica registrado com data, hora
          e motivo.
        </Secao>
        <Secao titulo="6. Seus direitos (LGPD)">
          Você pode acessar, corrigir, <strong>exportar</strong> e{" "}
          <strong>excluir</strong> os dados da sua oficina. A exportação (em
          arquivo) e a exclusão definitiva estão disponíveis na tela{" "}
          <em>Conta</em>. A exclusão remove os dados de forma permanente.
        </Secao>
        <Secao titulo="7. Retenção">
          Mantemos os dados enquanto a conta existir. Após a exclusão, os dados
          são removidos, salvo o que a lei exigir guardar (por exemplo, registros
          fiscais de pagamento).
        </Secao>
        <Secao titulo="8. Contato">
          Para exercer seus direitos ou tirar dúvidas: contato@kambio.com.br.
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
