"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Link2, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Cartao } from "@/components/ui/cartao";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import {
  cancelarConvite,
  criarConvite,
  definirAtivoFuncionario,
} from "@/server/equipe";
import type { ConvitePendente, FuncionarioResumo } from "@/lib/dados";

/** Gestão da equipe: convidar por link, cancelar convite, ativar/desativar. */
export function GerenciarEquipe({
  funcionarios,
  convites,
}: {
  funcionarios: FuncionarioResumo[];
  convites: ConvitePendente[];
}) {
  const router = useRouter();
  const [abrindo, setAbrindo] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function enviarConvite() {
    setErro(null);
    setOcupado(true);
    const r = await criarConvite({ nome, email });
    setOcupado(false);
    if (!r.ok) return setErro(r.erro);
    setNome("");
    setEmail("");
    setAbrindo(false);
    router.refresh();
  }

  async function removerConvite(id: string) {
    setOcupado(true);
    await cancelarConvite(id);
    setOcupado(false);
    router.refresh();
  }

  async function alternarAtivo(id: string, ativo: boolean) {
    setOcupado(true);
    await definirAtivoFuncionario(id, ativo);
    setOcupado(false);
    router.refresh();
  }

  const temConteudo = funcionarios.length > 0 || convites.length > 0;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-grotesk text-titulo font-bold text-principal">
          Equipe
        </h1>
        <Button size="sm" onClick={() => setAbrindo((v) => !v)}>
          <UserPlus className="h-5 w-5" aria-hidden="true" />
          Convidar
        </Button>
      </div>

      {abrindo ? (
        <Cartao className="space-y-3 border-principal">
          <p className="font-grotesk font-bold text-principal">
            Convidar funcionário
          </p>
          {erro ? (
            <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
              {erro}
            </p>
          ) : null}
          <label className="block space-y-1.5">
            <span className="block text-legenda font-medium text-texto">
              Nome do funcionário
            </span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Carlos"
              className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="block text-legenda font-medium text-texto">
              E-mail (opcional)
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="voce@email.com"
              className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
            />
          </label>
          <p className="text-legenda text-texto-secundario">
            Você vai gerar um link pra enviar ao funcionário. Ele cria a senha e
            já entra na equipe.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={enviarConvite}
              disabled={ocupado || nome.trim().length < 2}
            >
              {ocupado ? "Gerando..." : "Gerar link do convite"}
            </Button>
            <Button
              variant="secundario"
              onClick={() => setAbrindo(false)}
              disabled={ocupado}
            >
              Cancelar
            </Button>
          </div>
        </Cartao>
      ) : null}

      {!temConteudo && !abrindo ? (
        <EstadoVazio
          titulo="Nenhum funcionário ainda"
          mensagem="Convide alguém para registrar OS por você. Cada funcionário tem o próprio login e não vê custo nem lucro."
          icone={UserPlus}
          acao={
            <Button variant="principal" onClick={() => setAbrindo(true)}>
              Convidar funcionário
            </Button>
          }
        />
      ) : null}

      {convites.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-legenda font-medium text-texto-secundario">
            Convites pendentes
          </h2>
          <ul className="space-y-3">
            {convites.map((c) => (
              <ConviteCard
                key={c.id}
                convite={c}
                ocupado={ocupado}
                aoCancelar={() => removerConvite(c.id)}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {funcionarios.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-legenda font-medium text-texto-secundario">
            Funcionários
          </h2>
          <ul className="space-y-3">
            {funcionarios.map((f) => (
              <Cartao
                key={f.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-texto">{f.nome}</p>
                  <p className="text-legenda text-texto-secundario">
                    {f.osNoMes} {f.osNoMes === 1 ? "OS" : "OS"} no mês
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      f.ativo
                        ? "rounded-full bg-confirmado/10 px-3 py-1 text-legenda font-medium text-confirmado"
                        : "rounded-full bg-fundo px-3 py-1 text-legenda font-medium text-texto-secundario"
                    }
                  >
                    {f.ativo ? "Ativo" : "Inativo"}
                  </span>
                  <Button
                    variant="secundario"
                    size="sm"
                    onClick={() => alternarAtivo(f.id, !f.ativo)}
                    disabled={ocupado}
                  >
                    {f.ativo ? "Desativar" : "Reativar"}
                  </Button>
                </div>
              </Cartao>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ConviteCard({
  convite,
  ocupado,
  aoCancelar,
}: {
  convite: ConvitePendente;
  ocupado: boolean;
  aoCancelar: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/convite/${convite.token}`
      : `/convite/${convite.token}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <Cartao className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-destaque" aria-hidden="true" />
          <p className="font-medium text-texto">{convite.nome}</p>
        </div>
        <Button
          variant="secundario"
          size="sm"
          onClick={aoCancelar}
          disabled={ocupado}
          aria-label={`Cancelar convite de ${convite.nome}`}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Cancelar
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          className="h-11 flex-1 rounded-xl border border-linha bg-fundo px-3 text-legenda text-texto-secundario outline-none"
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button
          variant={copiado ? "principal" : "secundario"}
          size="sm"
          onClick={copiar}
          aria-label="Copiar link do convite"
        >
          {copiado ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar
            </>
          )}
        </Button>
      </div>
    </Cartao>
  );
}
