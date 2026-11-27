import { Button, Text } from "@react-email/components";

import { BaseEmail, estilos } from "./base";

// Boas-vindas após o cadastro do patrão.
export function EmailBoasVindas({
  nome,
  link,
}: {
  nome: string;
  link: string;
}) {
  return (
    <BaseEmail preview="Bem-vindo ao Kambio">
      <Text style={estilos.titulo}>Bem-vindo, {nome}!</Text>
      <Text style={estilos.texto}>
        Sua conta no Kambio está pronta. Em poucos minutos você configura a
        oficina e já registra a primeira venda falando uma frase.
      </Text>
      <Text style={estilos.texto}>
        É só terminar a configuração inicial (catálogo, custos e taxas):
      </Text>
      <Button href={link} style={estilos.botao}>
        Configurar minha oficina
      </Button>
    </BaseEmail>
  );
}
