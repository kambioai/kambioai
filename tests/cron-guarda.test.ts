import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { cronAutorizado } from "@/lib/cron/guarda";

// O guarda dos crons: a Vercel manda "Authorization: Bearer <CRON_SECRET>".
describe("guarda das rotas de cron", () => {
  const original = process.env.CRON_SECRET;
  beforeEach(() => {
    process.env.CRON_SECRET = "segredo-teste";
  });
  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  function req(auth?: string): Request {
    return new Request("https://exemplo/api/cron/lembretes", {
      headers: auth ? { authorization: auth } : {},
    });
  }

  it("aceita o bearer correto", () => {
    expect(cronAutorizado(req("Bearer segredo-teste"))).toBe(true);
  });

  it("recusa bearer errado ou ausente", () => {
    expect(cronAutorizado(req("Bearer outro"))).toBe(false);
    expect(cronAutorizado(req())).toBe(false);
  });

  it("recusa tudo quando não há CRON_SECRET no ambiente", () => {
    delete process.env.CRON_SECRET;
    expect(cronAutorizado(req("Bearer segredo-teste"))).toBe(false);
  });
});
