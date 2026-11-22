import { afterAll, describe, expect, it } from "vitest";

import {
  criarEmpresaComUsuario,
  limpar,
  temSupabase,
} from "./apoio-supabase";

// Isolamento multi-tenant (CLAUDE.md §4): duas empresas diferentes, nenhuma
// enxerga o dado da outra. É o teste mais importante do produto.
const d = temSupabase ? describe : describe.skip;

d("isolamento entre duas empresas", () => {
  const empresas: string[] = [];
  const usuarios: string[] = [];

  afterAll(async () => {
    await limpar(empresas, usuarios);
  });

  it("um patrão não vê o catálogo da outra oficina", async () => {
    const ts = Date.now();
    const a = await criarEmpresaComUsuario({
      nomeEmpresa: "Oficina A",
      email: `a_${ts}@teste.kambio`,
      papel: "patrao",
      nomeItem: "Item da A",
      custo: 1000,
      preco: 2000,
    });
    const b = await criarEmpresaComUsuario({
      nomeEmpresa: "Oficina B",
      email: `b_${ts}@teste.kambio`,
      papel: "patrao",
      nomeItem: "Item da B",
      custo: 3000,
      preco: 4000,
    });
    empresas.push(a.empresaId, b.empresaId);
    usuarios.push(a.userId, b.userId);

    // A só vê o próprio item.
    const catA = await a.sb.from("catalogo_itens").select("id, nome");
    expect(catA.error).toBeNull();
    expect(catA.data).toHaveLength(1);
    expect(catA.data?.[0]?.nome).toBe("Item da A");

    // B só vê o próprio item.
    const catB = await b.sb.from("catalogo_itens").select("id, nome");
    expect(catB.data).toHaveLength(1);
    expect(catB.data?.[0]?.nome).toBe("Item da B");

    // A tentando ler o item da B explicitamente → nada.
    const vazamento = await a.sb
      .from("catalogo_itens")
      .select("id")
      .eq("id", b.itemId);
    expect(vazamento.data).toHaveLength(0);
  });
});
