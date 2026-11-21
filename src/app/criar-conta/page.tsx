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
    </CascaAuth>
  );
}
