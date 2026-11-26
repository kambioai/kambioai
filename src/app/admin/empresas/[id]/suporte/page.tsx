import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

import { Cartao, CartaoTitulo } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { adminAtual } from "@/lib/permissoes";
import { rotuloStatus } from "@/lib/rotulos";
import { criarClienteServico } from "@/lib/supabase/service";

// Modo suporte (CLAUDE.md §4/§11): visão SOMENTE LEITURA dos dados da oficina,
// sem valores de custo/lucro na lista (resumo operacional). Só entra quem
// registrou o acesso com motivo nos últimos minutos (a ficha faz isso) — senão
// volta pra ficha, garantindo que todo acesso fique registrado (LGPD).
const JANELA_MS = 10 * 60_000;

export default async function ModoSuporte({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const adm = await adminAtual();
  if (!adm) redirect("/entrar");

  const svc = criarClienteServico();

  // Exige um acesso registrado recente (motivo). Sem isso, volta pra ficha.
  const { data: acesso } = await svc
    .from("suporte_acessos")
    .select("motivo, criado_em")
    .eq("admin_id", adm.id)
    .eq("empresa_id", id)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!acesso || Date.now() - new Date(acesso.criado_em).getTime() > JANELA_MS) {
    redirect(`/admin/empresas/${id}`);
  }

  const [{ data: emp }, { data: oss }, { count: clientes }] = await Promise.all([
    svc.from("empresas").select("nome, cidade").eq("id", id).maybeSingle(),
    svc
      .from("ordens_servico")
      .select("id, status, criado_em, veiculos(placa, modelo)")
      .eq("empresa_id", id)
      .order("criado_em", { ascending: false })
      .limit(10),
    svc
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .eq("empresa_id", id),
  ]);

  const ordens = (oss ?? []) as unknown as {
    id: string;
    status: keyof typeof rotuloStatus;
    criado_em: string;
    veiculos: { placa: string; modelo: string | null } | null;
  }[];

  return (
    <section className="space-y-5">
      <Link
        href={`/admin/empresas/${id}`}
        className="inline-flex items-center gap-1 text-legenda text-texto-secundario outline-none hover:text-principal focus-visible:text-principal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Voltar à ficha
      </Link>

      <div className="flex items-center gap-2 rounded-xl bg-atencao-fundo px-4 py-3 text-corpo text-atencao">
        <Eye className="h-5 w-5 shrink-0" aria-hidden="true" />
        Modo suporte · somente leitura · este acesso está registrado.
      </div>

      <div>
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          {emp?.nome ?? "Oficina"}
        </h1>
        <p className="text-corpo text-texto-secundario">
          {emp?.cidade ?? ""} · {clientes ?? 0} clientes · motivo: {acesso.motivo}
        </p>
      </div>

      <Cartao>
        <CartaoTitulo>Últimas ordens de serviço</CartaoTitulo>
        {ordens.length === 0 ? (
          <EstadoVazio
            titulo="Sem OS"
            mensagem="Esta oficina ainda não registrou ordens de serviço."
          />
        ) : (
          <ul className="mt-2 divide-y divide-linha">
            {ordens.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="min-w-0 truncate text-corpo text-texto">
                  {o.veiculos?.placa ?? "Balcão"}
                  {o.veiculos?.modelo ? ` · ${o.veiculos.modelo}` : ""}
                </span>
                <span className="shrink-0 rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-principal">
                  {rotuloStatus[o.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <p className="text-legenda text-texto-secundario">
        Valores financeiros (custo/lucro) não são exibidos no suporte. Para
        atendimento, use só o necessário.
      </p>
    </section>
  );
}
