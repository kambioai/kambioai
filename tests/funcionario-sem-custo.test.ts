import { afterAll, describe, expect, it } from "vitest";

import {
  criarEmpresaComUsuario,
  limpar,
  temSupabase,
} from "./apoio-supabase";

// Funcionário nunca lê custo/lucro (CLAUDE.md §4 e §11). Na tabela-base ele não
// vê nada (RLS só-patrão); na view, vê preço de venda mas NÃO a coluna custo.
const d = temSupabase ? describe : describe.skip;

d("funcionário sem acesso a custo/lucro", () => {
  const empresas: string[] = [];
  const usuarios: string[] = [];

  afterAll(async () => {
    await limpar(empresas, usuarios);
  });

  it("não lê a tabela-base de catálogo e a view não traz a coluna custo", async () => {
    const ts = Date.now();
    const f = await criarEmpresaComUsuario({
      nomeEmpresa: "Oficina do Funcionário",
      email: `func_${ts}@teste.kambio`,
      papel: "funcionario",
      nomeItem: "Pastilha",
      custo: 4000,
      preco: 9000,
    });
    empresas.push(f.empresaId);
    usuarios.push(f.userId);

    // Tabela-base: funcionário não enxerga nenhuma linha (RLS só-patrão).
    const base = await f.sb.from("catalogo_itens").select("*");
    expect(base.data ?? []).toHaveLength(0);

    // View do funcionário: vê o item, com preço, mas SEM a coluna custo.
    const view = await f.sb.from("vw_catalogo_funcionario").select("*");
    expect(view.error).toBeNull();
    expect(view.data).toHaveLength(1);
    const item = view.data?.[0] ?? {};
    expect(item).toHaveProperty("preco");
    expect(item).not.toHaveProperty("custo");
    expect(item).not.toHaveProperty("custo_total");
  });
});
