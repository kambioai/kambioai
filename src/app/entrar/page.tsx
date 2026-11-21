import Link from "next/link";

import { CascaAuth } from "@/components/auth/casca-auth";
import { FormularioEntrar } from "@/components/auth/formulario-entrar";

export default function Entrar() {
  return (
    <CascaAuth
      titulo="Entrar"
      subtitulo="Acesse a sua oficina."
      rodape={
        <>
          Ainda não tem conta?{" "}
          <Link
            href="/criar-conta"
            className="font-medium text-principal hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <FormularioEntrar />
    </CascaAuth>
  );
}
