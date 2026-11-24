import Link from "next/link";

import { CascaAuth } from "@/components/auth/casca-auth";

// Convite sem token no link: não dá pra saber de qual oficina é. Orienta a
// pessoa. O fluxo real de aceitar convite fica em /convite/[token] (Fase 10).
export default function ConviteSemToken() {
  return (
    <CascaAuth
      titulo="Convite indisponível"
      subtitulo="Abra o link completo que o patrão te enviou. Se você já tem conta, é só entrar."
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
