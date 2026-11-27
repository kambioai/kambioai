import { Button, Text } from "@react-email/components";

import { BaseEmail, estilos } from "./base";

// Convite de funcionário (CLAUDE.md §7/§10). Leva ao link de aceite do convite.
export function EmailConvite({
  nome,
  oficina,
  link,
}: {
  nome: string;
  oficina: string;
  link: string;
}) {
  return (
    <BaseEmail preview={`${oficina} te convidou para o Kambio`}>
      <Text style={estilos.titulo}>Você foi convidado</Text>
      <Text style={estilos.texto}>
        Olá, {nome}! A oficina <strong>{oficina}</strong> está te convidando para
        registrar os serviços no Kambio — pela voz, direto do celular.
      </Text>
      <Text style={estilos.texto}>
        Toque no botão para criar sua senha e começar:
      </Text>
      <Button href={link} style={estilos.botao}>
        Aceitar convite
      </Button>
      <Text style={{ ...estilos.texto, marginTop: "16px", fontSize: "13px", color: estilos.cores.texto2 }}>
        Se o botão não funcionar, copie e cole este endereço no navegador:
        <br />
        {link}
      </Text>
    </BaseEmail>
  );
}
