import type { ReactNode } from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

// Layout base dos e-mails do Kambio (Identidade visual §9: marinho + laranja).
// Estilos inline — é o que clientes de e-mail entendem.

const cores = {
  principal: "#0F2A4A",
  destaque: "#E8590C",
  fundo: "#F3F5F8",
  superficie: "#FFFFFF",
  texto: "#0E1726",
  texto2: "#556070",
  linha: "#E2E6EC",
};

export function BaseEmail({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: cores.fundo,
          margin: 0,
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
        }}
      >
        <Container style={{ maxWidth: "480px", margin: "0 auto", padding: "24px" }}>
          <Section style={{ paddingBottom: "8px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: cores.principal,
              }}
            >
              Kambio<span style={{ color: cores.destaque }}>.</span>
            </Text>
          </Section>
          <Section
            style={{
              backgroundColor: cores.superficie,
              border: `1px solid ${cores.linha}`,
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: cores.linha, margin: "20px 0" }} />
          <Text style={{ margin: 0, fontSize: "12px", color: cores.texto2 }}>
            Kambio — o jeito mais rápido de registrar a sua oficina pela voz.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const estilos = {
  cores,
  titulo: {
    margin: "0 0 12px",
    fontSize: "20px",
    fontWeight: 700,
    color: cores.principal,
  } as const,
  texto: {
    margin: "0 0 12px",
    fontSize: "15px",
    lineHeight: "22px",
    color: cores.texto,
  } as const,
  botao: {
    display: "inline-block",
    backgroundColor: cores.principal,
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none",
    padding: "12px 20px",
    borderRadius: "12px",
  } as const,
};
