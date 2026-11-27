import { NextResponse } from "next/server";

import { membroAtual } from "@/lib/permissoes";
import { criarClienteServidor } from "@/lib/supabase/server";

// GET /api/exportar — baixa os dados da oficina em JSON (LGPD, direito de
// portabilidade). Só o PATRÃO. Lê com a sessão do usuário (RLS), então só sai o
// que é da empresa dele. O funcionário não exporta (veria custo/lucro).
export async function GET() {
  const membro = await membroAtual();
  if (!membro) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }
  if (membro.papel !== "patrao") {
    return NextResponse.json({ erro: "Só o dono pode exportar." }, { status: 403 });
  }

  const sb = await criarClienteServidor();

  const [
    { data: empresa },
    { data: clientes },
    { data: veiculos },
    { data: catalogo },
    { data: ordens },
    { data: despesas },
    { data: custosFixos },
    { data: taxas },
    { data: fechamentos },
    { data: lembretes },
  ] = await Promise.all([
    sb.from("empresas").select("nome, cidade, segmento, plano, criado_em").maybeSingle(),
    sb.from("clientes").select("nome, telefone, criado_em"),
    sb.from("veiculos").select("placa, modelo, ano, cor, km, criado_em"),
    sb
      .from("catalogo_itens")
      .select("nome, tipo, custo, preco, estoque, estoque_minimo, sinonimos"),
    sb
      .from("ordens_servico")
      .select(
        "status, total, custo_total, taxa, forma_pagamento, parcelas, origem, transcricao, criado_em, os_itens(descricao, quantidade, preco, custo)",
      )
      .order("criado_em", { ascending: false }),
    sb.from("despesas").select("descricao, valor, categoria, criado_em"),
    sb.from("custos_fixos").select("nome, valor"),
    sb.from("taxas_pagamento").select("forma, parcelas, percentual"),
    sb.from("fechamentos").select("data, valores_informados, diferencas"),
    sb.from("lembretes").select("texto, data_hora, tipo, enviado"),
  ]);

  const exportacao = {
    gerado_em: new Date().toISOString(),
    aviso:
      "Valores em centavos. Exportação dos dados da sua oficina no Kambio (LGPD).",
    empresa,
    clientes: clientes ?? [],
    veiculos: veiculos ?? [],
    catalogo: catalogo ?? [],
    ordens_servico: ordens ?? [],
    despesas: despesas ?? [],
    custos_fixos: custosFixos ?? [],
    taxas_pagamento: taxas ?? [],
    fechamentos: fechamentos ?? [],
    lembretes: lembretes ?? [],
  };

  const slug = (empresa?.nome ?? "oficina")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const dia = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(exportacao, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kambio-${slug}-${dia}.json"`,
    },
  });
}
