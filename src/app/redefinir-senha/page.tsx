import { CascaAuth } from "@/components/auth/casca-auth";
import { FormularioRedefinir } from "@/components/auth/formulario-redefinir";

export default function RedefinirSenha() {
  return (
    <CascaAuth
      titulo="Criar senha nova"
      subtitulo="Escolha uma senha nova para a sua conta."
    >
      <FormularioRedefinir />
    </CascaAuth>
  );
}
