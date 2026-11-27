import "server-only";

import { formatarReais } from "@/lib/dinheiro/calculo";
import { enviarEmail, urlApp } from "@/lib/email/cliente";
import { EmailCobranca } from "@/lib/email/templates/cobranca";
import {
  enviarPushEmpresa,
  enviarPushPatrao,
  type PushPayload,
} from "@/lib/push/servidor";
import { avisoCobranca } from "@/lib/stripe/acesso";
import { criarClienteServico } from "@/lib/supabase/service";

// Lógica das tarefas agendadas (CLAUDE.md §8). Tudo roda com a SERVICE ROLE —
// são tarefas de servidor que varrem todas as empresas, nunca telas de usuário.
// Dinheiro só aparece em push de PATRÃO (resumo, cobrança); lembretes vão para
// a empresa inteira (não carregam custo/lucro).

type Svc = ReturnType<typeof criarClienteServico>;

const MS_DIA = 86_400_000;

/** Começo do dia de hoje em São Paulo (UTC−3), em ISO — para filtrar "hoje". */
function inicioDoDiaSP(): string {
  const dia = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return `${dia}T00:00:00-03:00`;
}

const TITULO_LEMBRETE: Record<string, string> = {
  manual: "Lembrete",
  retorno: "Retorno de cliente",
  falta: "Falta no estoque",
};

/**
 * Dispara os lembretes vencidos (data_hora <= agora, ainda não enviados) e os
 * marca como enviados. Roda a cada 5 min. Push para a empresa toda (sem dinheiro).
 */
export async function processarLembretes(
  svc: Svc = criarClienteServico(),
): Promise<{ disparados: number; pushEnviados: number }> {
  const agora = new Date().toISOString();
  const { data: pendentes } = await svc
    .from("lembretes")
    .select("id, texto, tipo, empresa_id")
    .eq("enviado", false)
    .lte("data_hora", agora)
    .order("data_hora")
    .limit(200);

  if (!pendentes || pendentes.length === 0) {
    return { disparados: 0, pushEnviados: 0 };
  }

  let pushEnviados = 0;
  for (const l of pendentes) {
    const payload: PushPayload = {
      titulo: TITULO_LEMBRETE[l.tipo] ?? "Lembrete",
      corpo: l.texto,
      url: "/patrao/painel",
      tag: `lembrete-${l.id}`,
    };
    pushEnviados += await enviarPushEmpresa(svc, l.empresa_id, payload);
  }

  await svc
    .from("lembretes")
    .update({ enviado: true })
    .in(
      "id",
      pendentes.map((l) => l.id),
    );

  return { disparados: pendentes.length, pushEnviados };
}

/**
 * Resumo do dia + "Feche o caixa" (18h) e aviso de estoque no mínimo. Push só
 * para o PATRÃO (tem dinheiro). Uma mensagem por empresa com acesso.
 */
export async function processarResumoDia(
  svc: Svc = criarClienteServico(),
): Promise<{ empresas: number; pushEnviados: number }> {
  const { data: empresas } = await svc
    .from("empresas")
    .select("id, status_assinatura")
    .neq("status_assinatura", "cancelada")
    .neq("status_assinatura", "bloqueada");
  if (!empresas || empresas.length === 0) {
    return { empresas: 0, pushEnviados: 0 };
  }

  const inicio = inicioDoDiaSP();
  let pushEnviados = 0;

  for (const emp of empresas) {
    const [{ data: oss }, { data: itens }] = await Promise.all([
      svc
        .from("ordens_servico")
        .select("total, custo_total, taxa")
        .eq("empresa_id", emp.id)
        .eq("status", "entregue")
        .gte("criado_em", inicio),
      svc
        .from("catalogo_itens")
        .select("estoque, estoque_minimo, tipo")
        .eq("empresa_id", emp.id),
    ]);

    const lista = oss ?? [];
    const faturamento = lista.reduce((s, o) => s + o.total, 0);
    const lucro = lista.reduce(
      (s, o) => s + o.total - o.custo_total - o.taxa,
      0,
    );
    const nOS = lista.length;
    const baixo = (itens ?? []).filter(
      (i) => i.tipo === "produto" && i.estoque <= i.estoque_minimo,
    ).length;

    const corpoBase =
      nOS === 0
        ? "Nenhuma OS paga hoje ainda. Não esqueça de fechar o caixa."
        : `Entrou ${formatarReais(faturamento)} · lucro ${formatarReais(lucro)} em ${nOS} OS. Hora de fechar o caixa.`;
    const corpo =
      baixo > 0
        ? `${corpoBase} ${baixo} ${baixo === 1 ? "item" : "itens"} no estoque mínimo.`
        : corpoBase;

    pushEnviados += await enviarPushPatrao(svc, emp.id, {
      titulo: "Resumo do dia",
      corpo,
      url: "/patrao/fechamento",
      tag: "resumo-dia",
    });
  }

  return { empresas: empresas.length, pushEnviados };
}

/**
 * Tarefa diária (CLAUDE.md §8): cria lembretes de RETORNO de cliente (troca de
 * óleo/revisão) e dispara a RÉGUA DE COBRANÇA por push ao patrão inadimplente.
 * O retorno nasce como lembrete pendente — o cron de 5 min manda o push.
 */
export async function processarDiario(
  svc: Svc = criarClienteServico(),
): Promise<{ retornosCriados: number; cobrancasEnviadas: number }> {
  const { data: empresas } = await svc
    .from("empresas")
    .select("id, status_assinatura, inadimplente_desde");
  if (!empresas || empresas.length === 0) {
    return { retornosCriados: 0, cobrancasEnviadas: 0 };
  }

  let retornosCriados = 0;
  let cobrancasEnviadas = 0;

  for (const emp of empresas) {
    // --- Régua de cobrança (push só pro patrão) ---
    const aviso = avisoCobranca(
      emp.status_assinatura as Parameters<typeof avisoCobranca>[0],
      emp.inadimplente_desde,
    );
    if (aviso) {
      cobrancasEnviadas += await enviarPushPatrao(svc, emp.id, {
        titulo: "Assinatura",
        corpo: aviso,
        url: "/patrao/conta",
        tag: "cobranca",
      });
      // Reforça por e-mail aos patrões com e-mail cadastrado (best-effort).
      const { data: patroes } = await svc
        .from("membros")
        .select("email")
        .eq("empresa_id", emp.id)
        .eq("papel", "patrao")
        .eq("ativo", true);
      const { data: dadosEmp } = await svc
        .from("empresas")
        .select("nome")
        .eq("id", emp.id)
        .maybeSingle();
      for (const p of patroes ?? []) {
        if (!p.email) continue;
        await enviarEmail({
          to: p.email,
          subject: "Aviso sobre sua assinatura do Kambio",
          react: EmailCobranca({
            oficina: dadosEmp?.nome ?? "sua oficina",
            aviso,
            link: urlApp("/patrao/conta"),
          }),
        });
      }
    }

    // --- Retorno de cliente ---
    // Itens que geram retorno (dias_para_retorno > 0).
    const { data: itensRetorno } = await svc
      .from("catalogo_itens")
      .select("id, nome, dias_para_retorno")
      .eq("empresa_id", emp.id)
      .gt("dias_para_retorno", 0);
    if (!itensRetorno || itensRetorno.length === 0) continue;
    const diasPorItem = new Map(
      itensRetorno.map((i) => [i.id, { dias: i.dias_para_retorno ?? 0, nome: i.nome }]),
    );

    // OS entregues (últimos 180 dias) com veículo e itens.
    const desde = new Date(Date.now() - 180 * MS_DIA).toISOString();
    const { data: oss } = await svc
      .from("ordens_servico")
      .select("id, veiculo_id, criado_em, veiculos(placa, modelo), os_itens(item_id)")
      .eq("empresa_id", emp.id)
      .eq("status", "entregue")
      .not("veiculo_id", "is", null)
      .gte("criado_em", desde)
      .order("criado_em", { ascending: false });
    if (!oss || oss.length === 0) continue;

    // Para cada veículo, a OS MAIS RECENTE que teve item de retorno.
    type Candidato = {
      veiculoId: string;
      placa: string;
      modelo: string | null;
      criadoEm: string;
      dias: number;
      itemNome: string;
    };
    const porVeiculo = new Map<string, Candidato>();
    for (const o of oss as unknown as {
      id: string;
      veiculo_id: string;
      criado_em: string;
      veiculos: { placa: string; modelo: string | null } | null;
      os_itens: { item_id: string | null }[];
    }[]) {
      if (porVeiculo.has(o.veiculo_id)) continue; // já pegamos a mais recente
      let melhorDias = 0;
      let melhorNome = "";
      for (const it of o.os_itens) {
        const info = it.item_id ? diasPorItem.get(it.item_id) : undefined;
        if (info && info.dias > melhorDias) {
          melhorDias = info.dias;
          melhorNome = info.nome;
        }
      }
      if (melhorDias > 0) {
        porVeiculo.set(o.veiculo_id, {
          veiculoId: o.veiculo_id,
          placa: o.veiculos?.placa ?? "veículo",
          modelo: o.veiculos?.modelo ?? null,
          criadoEm: o.criado_em,
          dias: melhorDias,
          itemNome: melhorNome,
        });
      }
    }

    // Vencidos (passou o prazo de retorno).
    const agora = Date.now();
    const vencidos = [...porVeiculo.values()].filter(
      (c) => agora - new Date(c.criadoEm).getTime() >= c.dias * MS_DIA,
    );
    if (vencidos.length === 0) continue;

    // Dedupe: já existe lembrete de retorno (depois da data da OS) para o veículo?
    const veicIds = vencidos.map((c) => c.veiculoId);
    const { data: jaTem } = await svc
      .from("lembretes")
      .select("veiculo_id, criado_em")
      .eq("empresa_id", emp.id)
      .eq("tipo", "retorno")
      .in("veiculo_id", veicIds);
    const ultimoRetorno = new Map<string, number>();
    for (const r of jaTem ?? []) {
      if (!r.veiculo_id) continue;
      ultimoRetorno.set(
        r.veiculo_id,
        Math.max(
          ultimoRetorno.get(r.veiculo_id) ?? 0,
          new Date(r.criado_em).getTime(),
        ),
      );
    }

    const novos = vencidos.filter((c) => {
      const marco = ultimoRetorno.get(c.veiculoId);
      // pula se já criamos um retorno depois da última OS desse veículo
      return !(marco && marco >= new Date(c.criadoEm).getTime());
    });
    if (novos.length === 0) continue;

    const { error } = await svc.from("lembretes").insert(
      novos.map((c) => ({
        texto: `Retorno: ${c.placa}${c.modelo ? ` (${c.modelo})` : ""} — já deu o prazo de ${c.itemNome.toLowerCase()}. Que tal chamar o cliente?`,
        data_hora: new Date().toISOString(),
        veiculo_id: c.veiculoId,
        tipo: "retorno",
        empresa_id: emp.id,
      })),
    );
    if (!error) retornosCriados += novos.length;
  }

  return { retornosCriados, cobrancasEnviadas };
}
