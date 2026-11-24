import Link from "next/link";

import { CascaAuth } from "@/components/auth/casca-auth";
import { FormularioAceitarConvite } from "@/components/auth/formulario-aceitar-convite";
import { lerConvitePublico } from "@/lib/convite/servidor";

const MENSAGEM_INVALIDO: Record<string, string> = {
  nao_encontrado: "Esse link de convite não existe ou está incompleto.",
  usado: "Esse convite já foi usado. Se já tem conta, é só entrar.",
  expirado: "Esse convite expirou. Peça um novo link ao patrão.",
};

// Aceitar convite por link (Fase 10). O funcionário chega aqui pelo link que o
// patrão copiou, confirma pra qual oficina foi convidado e cria a senha.
export default async function ConvitePorToken({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const convite = await lerConvitePublico(token);

  if (!convite.valido) {
    return (
      <CascaAuth
        titulo="Convite indisponível"
        subtitulo={MENSAGEM_INVALIDO[convite.motivo ?? "nao_encontrado"]}
        rodape={
          <Link
            href="/entrar"
            className="font-medium text-principal hover:underline"
          >
            Ir para o login
          </Link>
        }
      >
        <div />
      </CascaAuth>
    );
  }

  return (
    <CascaAuth
      titulo="Você foi convidado"
      subtitulo={`Entre na equipe da ${convite.empresaNome} como funcionário. Crie sua senha pra começar.`}
    >
      <FormularioAceitarConvite
        token={token}
        nome={convite.nome ?? ""}
        email={convite.email ?? ""}
      />
    </CascaAuth>
  );
}
