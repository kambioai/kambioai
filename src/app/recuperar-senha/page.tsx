import Link from "next/link";

import { CascaAuth } from "@/components/auth/casca-auth";
import { FormularioRecuperar } from "@/components/auth/formulario-recuperar";

export default function RecuperarSenha() {
  return (
    <CascaAuth
      titulo="Recuperar senha"
      subtitulo="Informe seu e-mail e enviamos um link pra criar uma senha nova."
      rodape={
        <Link
          href="/entrar"
          className="font-medium text-principal hover:underline"
        >
          Voltar para o login
        </Link>
      }
    >
      <FormularioRecuperar />
    </CascaAuth>
  );
}
