import { afterAll, describe, expect, it } from "vitest";

import {
  admin,
  criarEmpresaComUsuario,
  criarUsuarioLogado,
  limpar,
  temSupabase,
} from "./apoio-supabase";

// Fase 10: convite por link + permissões do funcionário.
// - o convite é isolado por empresa (RLS só-patrão);
// - aceitar o convite vira funcionário, que NÃO lê custo;
// - desativar o funcionário corta o acesso na hora.
const d = temSupabase ? describe : describe.skip;

d("equipe e convite do funcionário", () => {
  const empresas: string[] = [];
  const usuarios: string[] = [];

  afterAll(async () => {
    await limpar(empresas, usuarios);
  });

  it("convite isolado, vira funcionário sem custo e desativar corta o acesso", async () => {
    const ts = Date.now();
    const a = admin();

    // Patrão A com um item no catálogo.
    const patrao = await criarEmpresaComUsuario({
      nomeEmpresa: "Oficina Convite A",
      email: `patraoA_${ts}@teste.kambio`,
      papel: "patrao",
      nomeItem: "Óleo",
      custo: 2000,
      preco: 5000,
    });
    empresas.push(patrao.empresaId);
    usuarios.push(patrao.userId);

    // Patrão B (outra empresa), para checar isolamento dos convites.
    const patraoB = await criarEmpresaComUsuario({
      nomeEmpresa: "Oficina Convite B",
      email: `patraoB_${ts}@teste.kambio`,
      papel: "patrao",
      nomeItem: "Filtro",
      custo: 1000,
      preco: 3000,
    });
    empresas.push(patraoB.empresaId);
    usuarios.push(patraoB.userId);

    // Patrão A cria o convite (sob RLS: só o patrão da empresa consegue).
    const token = `tok_${ts}_abcdefghij`;
    const criado = await patrao.sb.from("convites").insert({
      empresa_id: patrao.empresaId,
      token,
      nome: "Carlos",
      papel: "funcionario",
    });
    expect(criado.error).toBeNull();

    // Isolamento: o patrão B não enxerga o convite da empresa A.
    const vistoPorB = await patraoB.sb
      .from("convites")
      .select("id")
      .eq("token", token);
    expect(vistoPorB.data ?? []).toHaveLength(0);

    // "Aceitar": cria o login e vincula como funcionário (o que a rota faz com
    // service role, porque quem aceita ainda não é membro).
    const func = await criarUsuarioLogado(`func_${ts}@teste.kambio`);
    usuarios.push(func.id);
    const vinc = await a.from("membros").insert({
      usuario_id: func.id,
      empresa_id: patrao.empresaId,
      papel: "funcionario",
      nome: "Carlos",
      email: `func_${ts}@teste.kambio`,
      ativo: true,
    });
    expect(vinc.error).toBeNull();
    await a.from("convites").update({ usado: true }).eq("token", token);

    // Funcionário vê o item na view (sem custo) e NÃO na tabela-base.
    const view = await func.sb.from("vw_catalogo_funcionario").select("*");
    expect(view.data).toHaveLength(1);
    expect(view.data?.[0] ?? {}).not.toHaveProperty("custo");
    const base = await func.sb.from("catalogo_itens").select("*");
    expect(base.data ?? []).toHaveLength(0);

    // Patrão desativa o funcionário → acesso cortado na hora.
    const desat = await patrao.sb
      .from("membros")
      .update({ ativo: false })
      .eq("usuario_id", func.id)
      .eq("papel", "funcionario");
    expect(desat.error).toBeNull();

    const depois = await func.sb.from("vw_catalogo_funcionario").select("*");
    expect(depois.data ?? []).toHaveLength(0);
  });
});
