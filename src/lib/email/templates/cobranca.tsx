import { Button, Text } from "@react-email/components";

import { BaseEmail, estilos } from "./base";

// Aviso de cobrança (régua — CLAUDE.md §7). Reforça o push com e-mail.
export function EmailCobranca({
  oficina,
  aviso,
  link,
}: {
  oficina: string;
  aviso: string;
  link: string;
}) {
  return (
    <BaseEmail preview="Aviso sobre sua assinatura do Kambio">
      <Text style={estilos.titulo}>Sobre a sua assinatura</Text>
      <Text style={estilos.texto}>
        Olá! Um aviso sobre o Kambio da <strong>{oficina}</strong>:
      </Text>
      <Text
        style={{
          ...estilos.texto,
          backgroundColor: "#FEF0E6",
          color: "#B54708",
          padding: "12px 14px",
          borderRadius: "12px",
        }}
      >
        {aviso}
      </Text>
      <Button href={link} style={estilos.botao}>
        Atualizar pagamento
      </Button>
    </BaseEmail>
  );
}
