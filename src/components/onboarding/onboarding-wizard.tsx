"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { BotaoFalar } from "@/components/botao-falar/botao-falar";
import { Button } from "@/components/ui/button";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { rotuloPagamento, rotuloSegmento } from "@/lib/rotulos";
import type { ItemCatalogoMock, CustoFixoMock, TaxaMock } from "@/lib/mock";
import type { Segmento } from "@/types";

// Estado editável local — tudo fictício (Fase 4). Dinheiro em centavos inteiros,
// mesmo aqui (nunca float pra dinheiro). A gravação real entra na Fase 7.
interface ItemEditavel extends ItemCatalogoMock {
  chave: string;
}

const PASSOS = [
  "Sua empresa",
  "Catálogo do segmento",
  "Estoque",
  "Custos e taxas",
  "Convidar equipe",
  "Primeira venda",
] as const;

const SEGMENTOS = Object.keys(rotuloSegmento) as Segmento[];

export function OnboardingWizard({
  catalogoInicial,
  custosIniciais,
  taxasIniciais,
}: {
  catalogoInicial: ItemCatalogoMock[];
  custosIniciais: CustoFixoMock[];
  taxasIniciais: TaxaMock[];
}) {
  const router = useRouter();
  const [passo, setPasso] = useState(0);

  // Passo 1 — empresa
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [segmento, setSegmento] = useState<Segmento>("oficina_moto");

  // Passo 2/3 — catálogo e estoque
  const [itens, setItens] = useState<ItemEditavel[]>(
    catalogoInicial.map((i, n) => ({ ...i, chave: `${i.id}-${n}` })),
  );

  // Passo 4 — custos fixos e taxas
  const [custos, setCustos] = useState<CustoFixoMock[]>(custosIniciais);
  const [taxas, setTaxas] = useState<TaxaMock[]>(taxasIniciais);

  // Passo 5 — convites
  const [emails, setEmails] = useState<string[]>([""]);

  const total = PASSOS.length;
  const progresso = Math.round(((passo + 1) / total) * 100);

  function avancar() {
    setPasso((p) => Math.min(p + 1, total - 1));
  }
  function voltar() {
    if (passo === 0) router.push("/escolher-plano");
    else setPasso((p) => Math.max(p - 1, 0));
  }

  type CampoNumerico =
    | "custoCentavos"
    | "precoCentavos"
    | "estoque"
    | "estoqueMinimo";

  function atualizarItem(chave: string, campo: CampoNumerico, valor: number) {
    setItens((lista) =>
      lista.map((i) => (i.chave === chave ? { ...i, [campo]: valor } : i)),
    );
  }
  function apagarItem(chave: string) {
    setItens((lista) => lista.filter((i) => i.chave !== chave));
  }

  const produtos = itens.filter((i) => i.tipo === "produto");

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div>
        <div className="flex items-center justify-between text-legenda text-texto-secundario">
          <span>
            Passo {passo + 1} de {total}
          </span>
          <span>{progresso}%</span>
        </div>
        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-linha"
          role="progressbar"
          aria-valuenow={progresso}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do cadastro"
        >
          <div
            className="h-full rounded-full bg-destaque transition-all"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <h2 className="mt-4 font-grotesk text-titulo font-bold text-principal">
          {PASSOS[passo]}
        </h2>
      </div>

      {/* Conteúdo do passo */}
      {passo === 0 ? (
        <div className="space-y-4">
          <Campo label="Nome da oficina">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Oficina do Zé Motos"
              className={entradaClasse}
            />
          </Campo>
          <Campo label="Cidade">
            <input
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex.: Goiânia"
              className={entradaClasse}
            />
          </Campo>
          <Campo label="Segmento">
            <select
              value={segmento}
              onChange={(e) => setSegmento(e.target.value as Segmento)}
              className={entradaClasse}
            >
              {SEGMENTOS.map((s) => (
                <option key={s} value={s}>
                  {rotuloSegmento[s]}
                </option>
              ))}
            </select>
          </Campo>
          <p className="text-legenda text-texto-secundario">
            Pelo segmento a gente já traz um catálogo pronto no próximo passo —
            você não começa do zero.
          </p>
        </div>
      ) : null}

      {passo === 1 ? (
        <div className="space-y-4">
          <p className="text-corpo text-texto-secundario">
            Já trouxemos os itens de{" "}
            <strong className="text-texto">{rotuloSegmento[segmento]}</strong>.
            Ajuste custo e preço e apague o que não usa.
          </p>
          <ul className="space-y-3">
            {itens.map((item) => (
              <li
                key={item.chave}
                className="rounded-2xl border border-linha bg-superficie p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-texto">{item.nome}</p>
                    <p className="text-legenda text-texto-secundario">
                      {item.tipo === "produto" ? "Produto" : "Serviço"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => apagarItem(item.chave)}
                    aria-label={`Apagar ${item.nome}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-texto-secundario outline-none hover:bg-fundo hover:text-erro focus-visible:ring-2 focus-visible:ring-principal"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {item.tipo === "produto" ? (
                    <EntradaReais
                      label="Custo (R$)"
                      centavos={item.custoCentavos}
                      onChange={(c) =>
                        atualizarItem(item.chave, "custoCentavos", c)
                      }
                    />
                  ) : (
                    <div />
                  )}
                  <EntradaReais
                    label="Preço (R$)"
                    centavos={item.precoCentavos}
                    onChange={(c) =>
                      atualizarItem(item.chave, "precoCentavos", c)
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          {itens.length === 0 ? (
            <p className="text-corpo text-texto-secundario">
              Você apagou tudo. Adicione os itens da sua oficina na operação
              depois, ou volte e mantenha alguns.
            </p>
          ) : null}
        </div>
      ) : null}

      {passo === 2 ? (
        <div className="space-y-4">
          <p className="text-corpo text-texto-secundario">
            Quanto você tem hoje de cada produto e a partir de quanto quer ser
            avisado pra repor.
          </p>
          {produtos.length === 0 ? (
            <p className="text-corpo text-texto-secundario">
              Sem produtos no catálogo — nada de estoque pra informar.
            </p>
          ) : (
            <ul className="space-y-3">
              {produtos.map((item) => (
                <li
                  key={item.chave}
                  className="rounded-2xl border border-linha bg-superficie p-4"
                >
                  <p className="font-medium text-texto">{item.nome}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <EntradaInteiro
                      label="Tenho agora"
                      valor={item.estoque}
                      onChange={(v) =>
                        atualizarItem(item.chave, "estoque", v)
                      }
                    />
                    <EntradaInteiro
                      label="Mínimo"
                      valor={item.estoqueMinimo}
                      onChange={(v) =>
                        atualizarItem(item.chave, "estoqueMinimo", v)
                      }
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {passo === 3 ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-grotesk text-corpo font-bold text-principal">
              Custos fixos do mês
            </h3>
            <ul className="space-y-3">
              {custos.map((c, n) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 rounded-xl border border-linha bg-superficie p-3"
                >
                  <span className="flex-1 text-corpo text-texto">{c.nome}</span>
                  <EntradaReais
                    centavos={c.valorCentavos}
                    onChange={(v) =>
                      setCustos((lista) =>
                        lista.map((x, i) =>
                          i === n ? { ...x, valorCentavos: v } : x,
                        ),
                      )
                    }
                    estreito
                  />
                </li>
              ))}
            </ul>
            <p className="text-legenda text-texto-secundario">
              Total por mês:{" "}
              <ValorReais
                centavos={custos.reduce((s, c) => s + c.valorCentavos, 0)}
                className="text-texto"
              />
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-grotesk text-corpo font-bold text-principal">
              Taxas da maquininha
            </h3>
            <ul className="space-y-3">
              {taxas.map((t, n) => (
                <li
                  key={`${t.forma}-${t.parcelas}`}
                  className="flex items-center gap-3 rounded-xl border border-linha bg-superficie p-3"
                >
                  <span className="flex-1 text-corpo text-texto">
                    {rotuloPagamento[t.forma]}
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      step="0.1"
                      inputMode="decimal"
                      value={t.percentual}
                      onChange={(e) =>
                        setTaxas((lista) =>
                          lista.map((x, i) =>
                            i === n
                              ? { ...x, percentual: Number(e.target.value) || 0 }
                              : x,
                          ),
                        )
                      }
                      aria-label={`Taxa de ${rotuloPagamento[t.forma]} em %`}
                      className="h-12 w-20 rounded-xl border border-linha bg-superficie px-3 text-right text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
                    />
                    <span className="text-corpo text-texto-secundario">%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {passo === 4 ? (
        <div className="space-y-4">
          <p className="text-corpo text-texto-secundario">
            Convide quem trabalha com você (opcional). Cada funcionário registra
            serviço por voz, mas não vê dinheiro.
          </p>
          <div className="space-y-3">
            {emails.map((email, n) => (
              <div key={n} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmails((lista) =>
                      lista.map((x, i) => (i === n ? e.target.value : x)),
                    )
                  }
                  placeholder="email@do-funcionario.com"
                  aria-label={`E-mail do funcionário ${n + 1}`}
                  className={entradaClasse}
                />
                {emails.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setEmails((lista) => lista.filter((_, i) => i !== n))
                    }
                    aria-label="Remover convite"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-lg text-texto-secundario outline-none hover:bg-fundo hover:text-erro focus-visible:ring-2 focus-visible:ring-principal"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <Button
            variant="secundario"
            size="sm"
            onClick={() => setEmails((lista) => [...lista, ""])}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Adicionar outro
          </Button>
          <p className="text-legenda text-texto-secundario">
            O 1º funcionário muda o plano pra PRO; a partir do 3º, cada um custa
            R$ 29,90/mês. (A cobrança de verdade entra na Fase 11.)
          </p>
        </div>
      ) : null}

      {passo === 5 ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="max-w-sm text-corpo text-texto-secundario">
            Tudo pronto! Agora é só registrar sua primeira venda. Toque em Falar
            e diga algo como:
          </p>
          <p className="max-w-sm rounded-2xl border border-linha bg-superficie p-4 text-corpo text-texto">
            “Honda CG placa ABC1D23, troquei a pastilha e fiz alinhamento, 150 no
            crédito em 2 vezes.”
          </p>
          <BotaoFalar href="/patrao/falar" tamanho={72} />
          <p className="text-legenda text-texto-secundario">
            Tudo também funciona digitando.
          </p>
        </div>
      ) : null}

      {/* Navegação */}
      <div className="flex items-center justify-between gap-3 border-t border-linha pt-5">
        <button
          type="button"
          onClick={voltar}
          className="inline-flex items-center gap-1 text-corpo font-medium text-texto-secundario outline-none hover:text-principal focus-visible:text-principal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>

        {passo < total - 1 ? (
          <Button onClick={avancar}>
            {passo === 4 ? "Pular e continuar" : "Continuar"}
          </Button>
        ) : (
          <Button onClick={() => router.push("/patrao/painel")}>
            Ir para o painel
          </Button>
        )}
      </div>
    </div>
  );
}

const entradaClasse =
  "h-[52px] w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal";

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-legenda font-medium text-texto">{label}</span>
      {children}
    </label>
  );
}

function EntradaReais({
  label,
  centavos,
  onChange,
  estreito = false,
}: {
  label?: string;
  centavos: number;
  onChange: (centavos: number) => void;
  estreito?: boolean;
}) {
  const campo = (
    <input
      type="number"
      min={0}
      step="0.01"
      inputMode="decimal"
      value={Number.isFinite(centavos) ? centavos / 100 : 0}
      onChange={(e) =>
        onChange(Math.round((parseFloat(e.target.value) || 0) * 100))
      }
      aria-label={label ?? "Valor em reais"}
      className={
        estreito
          ? "h-12 w-28 rounded-xl border border-linha bg-superficie px-3 text-right text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
          : "h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
      }
    />
  );
  if (!label || estreito) return campo;
  return (
    <label className="block space-y-1.5">
      <span className="block text-legenda font-medium text-texto">{label}</span>
      {campo}
    </label>
  );
}

function EntradaInteiro({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: number;
  onChange: (valor: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-legenda font-medium text-texto">{label}</span>
      <input
        type="number"
        min={0}
        step="1"
        inputMode="numeric"
        value={valor}
        onChange={(e) =>
          onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))
        }
        className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
      />
    </label>
  );
}
