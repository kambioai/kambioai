import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createElement } from "react";

import { emailConfigurado, enviarEmail, urlApp } from "@/lib/email/cliente";

// E-mail é best-effort: sem RESEND_API_KEY, nada é enviado e nada quebra.
describe("gating de e-mail (Resend)", () => {
  const keyOrig = process.env.RESEND_API_KEY;
  const urlOrig = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    process.env.NEXT_PUBLIC_APP_URL = "https://kambio.com.br";
  });
  afterEach(() => {
    if (keyOrig === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = keyOrig;
    if (urlOrig === undefined) delete process.env.NEXT_PUBLIC_APP_URL;
    else process.env.NEXT_PUBLIC_APP_URL = urlOrig;
  });

  it("sem chave, não está configurado e o envio retorna false", async () => {
    expect(emailConfigurado()).toBe(false);
    const enviado = await enviarEmail({
      to: "alguem@exemplo.com",
      subject: "Oi",
      react: createElement("div", null, "corpo"),
    });
    expect(enviado).toBe(false);
  });

  it("urlApp monta links absolutos a partir de NEXT_PUBLIC_APP_URL", () => {
    expect(urlApp("/patrao/conta")).toBe("https://kambio.com.br/patrao/conta");
    expect(urlApp("convite/abc")).toBe("https://kambio.com.br/convite/abc");
  });
});
