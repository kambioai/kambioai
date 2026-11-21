import { CascaAuth } from "@/components/auth/casca-auth";
import { FormularioConvite } from "@/components/auth/formulario-convite";
import { lerDadosConta } from "@/lib/dados";

// Aceitar convite: o funcionário chega por um link, vê pra qual oficina foi
// convidado e cria a senha. (Fictício — o convite real entra na Fase 10.)
export default async function Convite() {
  const { empresa } = await lerDadosConta();

  return (
    <CascaAuth
      titulo="Você foi convidado"
      subtitulo={`Entre na equipe da ${empresa.nome} como funcionário. Crie sua senha pra começar.`}
    >
      <FormularioConvite />
    </CascaAuth>
  );
}
