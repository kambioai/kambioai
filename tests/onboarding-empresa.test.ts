import { afterAll, describe, expect, it } from "vitest";

import {
  admin,
  criarUsuarioLogado,
  temSupabase,
} from "./apoio-supabase";

// Fase 7: cada conta nova cria a PRÓPRIA oficina (empresa + patrão), isolada das
// outras. Testa a função real do onboarding: criar_empresa_onboarding.
const d = temSupabase ? describe : describe.skip;

d("onboarding cria a própria oficina", () => {
  const empresas: string[] = [];
  const usuarios: string[] = [];

  afterAll(async () => {
    const a = admin();
    for (const id of empresas) await a.from("empresas").delete().eq("id", id);
    for (const id of usuarios) await a.auth.admin.deleteUser(id);
  });

  it("duas contas geram oficinas diferentes e isoladas", async () => {
    const ts = Date.now();
    const a = await criarUsuarioLogado(`ona_${ts}@teste.kambio`);
    const b = await criarUsuarioLogado(`onb_${ts}@teste.kambio`);
    usuarios.push(a.id, b.id);

    const ra = await a.sb.rpc("criar_empresa_onboarding", {
      p_nome: "Oficina A",
      p_cidade: "Goiânia",
      p_segmento: "oficina_moto",
    });
    const rb = await b.sb.rpc("criar_empresa_onboarding", {
      p_nome: "Oficina B",
      p_cidade: "Trindade",
      p_segmento: "mecanica",
    });
    expect(ra.error).toBeNull();
    expect(rb.error).toBeNull();
    const empresaA = ra.data as string;
    const empresaB = rb.data as string;
    empresas.push(empresaA, empresaB);
    expect(empresaA).not.toBe(empresaB);

    // Cada patrão só enxerga a própria oficina.
    const vistaA = await a.sb.from("empresas").select("id, nome");
    expect(vistaA.data).toHaveLength(1);
    expect(vistaA.data?.[0]?.nome).toBe("Oficina A");

    const vistaB = await b.sb.from("empresas").select("id, nome");
    expect(vistaB.data).toHaveLength(1);
    expect(vistaB.data?.[0]?.nome).toBe("Oficina B");

    // Idempotente: chamar de novo devolve a mesma oficina (não cria outra).
    const ra2 = await a.sb.rpc("criar_empresa_onboarding", {
      p_nome: "Outra",
      p_cidade: "X",
      p_segmento: "oficina_moto",
    });
    expect(ra2.data).toBe(empresaA);
  });
});
