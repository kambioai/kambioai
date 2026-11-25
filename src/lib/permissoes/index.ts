import {
  avisoCobranca,
  nivelAcesso,
  type NivelAcesso,
  type StatusAssinatura,
} from "@/lib/stripe/acesso";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Papel } from "@/types";

/**
 * Checagem de permissão no SERVIDOR (CLAUDE.md §13.2): a RLS já isola no banco,
 * aqui repetimos para rotear telas. Devolve o vínculo ATIVO do usuário logado —
 * ou null quando ele não está logado ou foi desativado (acesso cortado na hora).
 */
export interface MembroAtual {
  empresaId: string;
  papel: Papel;
  nome: string | null;
}

export async function membroAtual(): Promise<MembroAtual | null> {
  const sb = await criarClienteServidor();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  const { data } = await sb
    .from("membros")
    .select("empresa_id, papel, nome")
    .eq("usuario_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (!data) return null;
  return { empresaId: data.empresa_id, papel: data.papel, nome: data.nome };
}

export interface AcessoEmpresa {
  nivel: NivelAcesso;
  aviso: string | null;
  status: StatusAssinatura;
}

/**
 * Nível de acesso da empresa segundo a régua de cobrança (CLAUDE.md §7),
 * derivado do status + inadimplência. Lido sob RLS (a própria empresa).
 */
export async function acessoEmpresa(): Promise<AcessoEmpresa | null> {
  const sb = await criarClienteServidor();
  const { data } = await sb
    .from("empresas")
    .select("status_assinatura, inadimplente_desde")
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const status = data.status_assinatura as StatusAssinatura;
  return {
    nivel: nivelAcesso(status, data.inadimplente_desde),
    aviso: avisoCobranca(status, data.inadimplente_desde),
    status,
  };
}

/**
 * Guarda de escrita para as ações sensíveis: se a conta está em modo leitura ou
 * bloqueada (pagamento em atraso), a escrita é recusada no SERVIDOR — não basta
 * esconder na tela (CLAUDE.md §13.2).
 */
export async function garantirEscrita(): Promise<
  { ok: true } | { ok: false; erro: string }
> {
  const acesso = await acessoEmpresa();
  if (acesso && acesso.nivel !== "completo") {
    return {
      ok: false,
      erro:
        "Conta com pagamento pendente: não dá para lançar agora. Atualize o cartão em Conta.",
    };
  }
  return { ok: true };
}
