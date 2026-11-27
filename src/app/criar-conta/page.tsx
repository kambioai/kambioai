import Link from "next/link";

import { CascaAuth } from "@/components/auth/casca-auth";
import { FormularioCriarConta } from "@/components/auth/formulario-criar-conta";

export default function CriarConta() {
  return (
    <CascaAuth
      titulo="Criar conta"
      subtitulo="Comece a controlar sua oficina pela voz."
      rodape={
        <>
          Já tem conta?{" "}
          <Link
            href="/entrar"
            className="font-medium text-principal hover:underline"
          >
            Entrar
          </Link>
        </>
      }
    >
      <FormularioCriarConta />
      <p className="mt-4 text-center text-legenda text-texto-secundario">
        Ao criar a conta, você concorda com os{" "}
        <Link href="/termos" className="text-principal hover:underline">
          Termos
        </Link>{" "}
        e a{" "}
        <Link href="/privacidade" className="text-principal hover:underline">
          Política de Privacidade
        </Link>
        .
      </p>
    </CascaAuth>
  );
}
