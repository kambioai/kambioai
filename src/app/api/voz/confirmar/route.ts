import { NextResponse } from "next/server";

import { garantirEscrita } from "@/lib/permissoes";
import { placaValida, normalizarPlaca } from "@/lib/placa";
import { criarClienteServidor } from "@/lib/supabase/server";
import { carregarContexto, intentSchema, processar } from "@/server/voz-core";

// POST /api/voz/confirmar — grava a OS (re-calcula no servidor, nunca confia nos
// valores do cliente) via a função transacional registrar_os.
export async function POST(req: Request) {
  const ctx = await carregarContexto();
  if (!ctx) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const bloqueio = await garantirEscrita();
  if (!bloqueio.ok) {
    return NextResponse.json({ erro: bloqueio.erro }, { status: 402 });
  }

  const corpo = await req.json().catch(() => null);
  const parsed = intentSchema.safeParse(corpo?.intent);
  if (!parsed.success) {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }
  const intent = parsed.data;
  const origem = corpo?.origem === "manual" ? "manual" : "voz";

  // Recalcula TUDO no servidor a partir do catálogo.
  const { resolvidos, totais } = processar(ctx, intent);

  const sb = await criarClienteServidor();

  // Resolve/cria o veículo (e cliente, se houver nome).
  let veiculoId: string | null = null;
  let clienteId: string | null = null;
  if (intent.placa && placaValida(intent.placa)) {
    const placa = normalizarPlaca(intent.placa);
    const { data: existente } = await sb
      .from("veiculos")
      .select("id")
      .ilike("placa", placa)
      .limit(1)
      .maybeSingle();
    if (existente) {
      veiculoId = existente.id;
    } else {
      if (intent.clienteNome) {
        const { data: cli } = await sb
          .from("clientes")
          .insert({ nome: intent.clienteNome, empresa_id: ctx.empresaId })
          .select("id")
          .single();
        clienteId = cli?.id ?? null;
      }
      const { data: novo } = await sb
        .from("veiculos")
        .insert({
          placa,
          modelo: intent.modelo,
          cliente_id: clienteId,
          empresa_id: ctx.empresaId,
        })
        .select("id")
        .single();
      veiculoId = novo?.id ?? null;
    }
  }

  const itensPayload = resolvidos.map((r) => ({
    item_id: r.itemId,
    descricao: r.descricao,
    quantidade: r.quantidade,
    preco: r.precoCentavos,
    custo: r.custoCentavos,
  }));

  // Os args de função no Postgres aceitam NULL, mas os tipos gerados os marcam
  // como obrigatórios — por isso os casts pontuais nos campos que podem ser nulos.
  const { data: osId, error } = await sb.rpc("registrar_os", {
    p_empresa_id: ctx.empresaId,
    p_veiculo_id: veiculoId as string,
    p_cliente_id: clienteId as string,
    p_status: intent.status,
    p_total: totais.totalCentavos,
    p_custo_total: totais.custoTotalCentavos,
    p_taxa: totais.taxaCentavos,
    p_forma_pagamento: intent.forma as "pix" | "dinheiro" | "debito" | "credito",
    p_parcelas: intent.parcelas,
    p_origem: origem,
    p_transcricao: intent.transcricao,
    p_itens: itensPayload,
  });

  if (error) {
    return NextResponse.json(
      { erro: "Não consegui salvar a OS. Tente de novo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, osId });
}
