"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

import { BotaoFalar } from "@/components/botao-falar/botao-falar";
import { Button } from "@/components/ui/button";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import {
  custosFixosPadrao,
  modelosCatalogo,
} from "@/lib/onboarding/modelos-catalogo";
import { rotuloSegmento } from "@/lib/rotulos";
import { criarEmpresa, salvarConfiguracaoInicial } from "@/server/onboarding";
import type { Segmento } from "@/types";

interface ItemEditavel {
  chave: string;
  nome: string;
  tipo: "produto" | "servico";
  custoCentavos: number;
  precoCentavos: number;
  estoque: number;
  estoqueMinimo: number;
}

interface CustoEditavel {
  chave: string;
  nome: string;
  valorCentavos: number;
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
const MAX_PARCELAS = 12;

let contador = 0;
const novaChave = () => `k${contador++}`;

export function OnboardingWizard() {
  const [passo, setPasso] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // Passo 0 — empresa
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [segmento, setSegmento] = useState<Segmento>("oficina_moto");

  // Passo 1/2 — catálogo e estoque
  const [itens, setItens] = useState<ItemEditavel[]>([]);

  // Passo 3 — custos e taxas
  const [custos, setCustos] = useState<CustoEditavel[]>(
    custosFixosPadrao.map((c) => ({ ...c, chave: novaChave() })),
  );
  const [taxaDebito, setTaxaDebito] = useState(2);
  const [taxasCredito, setTaxasCredito] = useState<number[]>(() => {
    const arr = Array<number>(MAX_PARCELAS).fill(0);
    arr[0] = 3.5;
    return arr;
  });

  const total = PASSOS.length;
  const progresso = Math.round(((passo + 1) / total) * 100);

  function voltar() {
    setErro(null);
    setPasso((p) => Math.max(p - 1, 0));
  }

  async function concluirEmpresa() {
    setErro(null);
    setOcupado(true);
    const r = await criarEmpresa({ nome, cidade, segmento });
    setOcupado(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setItens(
      modelosCatalogo[segmento].map((m) => ({ ...m, chave: novaChave() })),
    );
    setPasso(1);
  }

  async function concluir() {
    setErro(null);
    setOcupado(true);
    const taxas = [
      { forma: "debito" as const, parcelas: 1, percentual: taxaDebito },
      ...taxasCredito.map((p, i) => ({
        forma: "credito" as const,
        parcelas: i + 1,
        percentual: p,
      })),
    ];
    const r = await salvarConfiguracaoInicial({
      itens: itens
        .filter((i) => i.nome.trim() !== "")
        .map((i) => ({
          nome: i.nome.trim(),
          tipo: i.tipo,
          custoCentavos: i.tipo === "servico" ? 0 : i.custoCentavos,
          precoCentavos: i.precoCentavos,
          estoque: i.estoque,
          estoqueMinimo: i.estoqueMinimo,
        })),
      custos: custos
        .filter((c) => c.nome.trim() !== "")
        .map((c) => ({ nome: c.nome.trim(), valorCentavos: c.valorCentavos })),
      taxas,
    });
    setOcupado(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    window.location.assign("/patrao/painel");
  }

  // ----- edição de itens -----
  type CampoNumerico =
    | "custoCentavos"
    | "precoCentavos"
    | "estoque"
    | "estoqueMinimo";
  function atualizarItem(chave: string, campo: CampoNumerico, valor: number) {
    setItens((l) => l.map((i) => (i.chave === chave ? { ...i, [campo]: valor } : i)));
  }
  function atualizarNome(chave: string, nome: string) {
    setItens((l) => l.map((i) => (i.chave === chave ? { ...i, nome } : i)));
  }
  function atualizarTipo(chave: string, tipo: "produto" | "servico") {
    setItens((l) =>
      l.map((i) =>
        i.chave === chave
          ? { ...i, tipo, custoCentavos: tipo === "servico" ? 0 : i.custoCentavos }
          : i,
      ),
    );
  }
  function apagarItem(chave: string) {
    setItens((l) => l.filter((i) => i.chave !== chave));
  }
  function adicionarItem() {
    setItens((l) => [
      {
        chave: novaChave(),
        nome: "",
        tipo: "produto",
        custoCentavos: 0,
        precoCentavos: 0,
        estoque: 0,
        estoqueMinimo: 0,
      },
      ...l,
    ]);
  }

  function avancarCatalogo() {
    if (itens.filter((i) => i.nome.trim() !== "").length === 0) {
      setErro("Adicione pelo menos um item ao catálogo para continuar.");
      return;
    }
    setErro(null);
    setPasso(2); // vai para o estoque
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

      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}

      {/* Passo 0 — empresa */}
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
              {SEGMENTOS.map((sg) => (
                <option key={sg} value={sg}>
                  {rotuloSegmento[sg]}
                </option>
              ))}
            </select>
          </Campo>
          <p className="text-legenda text-texto-secundario">
            Pelo segmento a gente já traz um catálogo pronto no próximo passo —
            você ajusta e adiciona o que faltar.
          </p>
        </div>
      ) : null}

      {/* Passo 1 — catálogo (obrigatório) */}
      {passo === 1 ? (
        <div className="space-y-4">
          <p className="text-corpo text-texto-secundario">
            Itens de{" "}
            <strong className="text-texto">{rotuloSegmento[segmento]}</strong>.
            Ajuste nome, custo e preço, apague o que não usa e adicione os seus.
          </p>

          <Button variant="secundario" size="sm" onClick={adicionarItem}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Adicionar item
          </Button>

          <ul className="space-y-3">
            {itens.map((item) => (
              <li
                key={item.chave}
                className="space-y-3 rounded-2xl border border-linha bg-superficie p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={item.nome}
                    onChange={(e) => atualizarNome(item.chave, e.target.value)}
                    placeholder="Nome do item"
                    aria-label="Nome do item"
                    className="h-11 flex-1 rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
                  />
                  <button
                    type="button"
                    onClick={() => apagarItem(item.chave)}
                    aria-label={`Apagar ${item.nome || "item"}`}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-texto-secundario outline-none hover:bg-fundo hover:text-erro focus-visible:ring-2 focus-visible:ring-principal"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="Tipo">
                    <select
                      value={item.tipo}
                      onChange={(e) =>
                        atualizarTipo(
                          item.chave,
                          e.target.value as "produto" | "servico",
                        )
                      }
                      className="h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
                    >
                      <option value="produto">Produto</option>
                      <option value="servico">Serviço</option>
                    </select>
                  </Campo>
                  <Campo label="Preço de venda (R$)">
                    <EntradaReais
                      centavos={item.precoCentavos}
                      onChange={(c) =>
                        atualizarItem(item.chave, "precoCentavos", c)
                      }
                    />
                  </Campo>
                  {item.tipo === "produto" ? (
                    <Campo label="Custo (R$)">
                      <EntradaReais
                        centavos={item.custoCentavos}
                        onChange={(c) =>
                          atualizarItem(item.chave, "custoCentavos", c)
                        }
                      />
                    </Campo>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {itens.length === 0 ? (
            <p className="text-corpo text-texto-secundario">
              Nenhum item ainda — toque em “Adicionar item”.
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Passo 2 — estoque (pode fazer depois) */}
      {passo === 2 ? (
        <div className="space-y-4">
          <p className="text-corpo text-texto-secundario">
            Quanto você tem hoje de cada produto e a partir de quanto quer ser
            avisado pra repor. <strong>Esse passo pode ficar pra depois</strong>{" "}
            — um funcionário pode fazer a contagem no sistema.
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
                  <p className="font-medium text-texto">
                    {item.nome || "Sem nome"}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <EntradaInteiro
                      label="Tenho agora"
                      valor={item.estoque}
                      onChange={(v) => atualizarItem(item.chave, "estoque", v)}
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

      {/* Passo 3 — custos e taxas (obrigatório) */}
      {passo === 3 ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-grotesk text-corpo font-bold text-principal">
                Custos fixos do mês
              </h3>
              <Button
                variant="secundario"
                size="sm"
                onClick={() =>
                  setCustos((l) => [
                    ...l,
                    { chave: novaChave(), nome: "", valorCentavos: 0 },
                  ])
                }
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Adicionar
              </Button>
            </div>
            <ul className="space-y-3">
              {custos.map((c) => (
                <li key={c.chave} className="flex items-center gap-2">
                  <input
                    value={c.nome}
                    onChange={(e) =>
                      setCustos((l) =>
                        l.map((x) =>
                          x.chave === c.chave ? { ...x, nome: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Nome do custo"
                    aria-label="Nome do custo"
                    className="h-12 flex-1 rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
                  />
                  <EntradaReais
                    centavos={c.valorCentavos}
                    onChange={(v) =>
                      setCustos((l) =>
                        l.map((x) =>
                          x.chave === c.chave ? { ...x, valorCentavos: v } : x,
                        ),
                      )
                    }
                    estreito
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustos((l) => l.filter((x) => x.chave !== c.chave))
                    }
                    aria-label="Remover custo"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-texto-secundario outline-none hover:bg-fundo hover:text-erro focus-visible:ring-2 focus-visible:ring-principal"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-legenda text-texto-secundario">
              Total por mês:{" "}
              <ValorReais
                centavos={custos.reduce((sm, c) => sm + c.valorCentavos, 0)}
                className="text-texto"
              />
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-grotesk text-corpo font-bold text-principal">
              Taxas da maquininha
            </h3>
            <p className="text-legenda text-texto-secundario">
              Pix e dinheiro não têm taxa. Informe o débito e o crédito em cada
              número de parcelas (em %).
            </p>
            <div className="flex items-center gap-3 rounded-xl border border-linha bg-superficie p-3">
              <span className="flex-1 text-corpo text-texto">Débito</span>
              <EntradaPercentual valor={taxaDebito} onChange={setTaxaDebito} />
            </div>
            <div className="rounded-xl border border-linha bg-superficie p-3">
              <p className="mb-2 text-corpo text-texto">Crédito</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {taxasCredito.map((p, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-8 shrink-0 text-legenda text-texto-secundario">
                      {i + 1}x
                    </span>
                    <EntradaPercentual
                      valor={p}
                      rotulo={`Taxa do crédito em ${i + 1}x`}
                      onChange={(v) =>
                        setTaxasCredito((l) =>
                          l.map((x, j) => (j === i ? v : x)),
                        )
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Passo 4 — convidar */}
      {passo === 4 ? (
        <div className="space-y-3">
          <p className="text-corpo text-texto-secundario">
            Depois você convida sua equipe pela tela <strong>Equipe</strong>.
            Cada funcionário registra serviço por voz, mas não vê dinheiro.
          </p>
          <p className="text-legenda text-texto-secundario">
            O convite por link entra na Fase 10. Siga para registrar sua primeira
            venda.
          </p>
        </div>
      ) : null}

      {/* Passo 5 — primeira venda */}
      {passo === 5 ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="max-w-sm text-corpo text-texto-secundario">
            Tudo pronto! Salve e registre sua primeira venda. Toque em Falar e
            diga algo como:
          </p>
          <p className="max-w-sm rounded-2xl border border-linha bg-superficie p-4 text-corpo text-texto">
            “Honda CG placa ABC1D23, troquei a pastilha e fiz alinhamento, 150 no
            crédito em 2 vezes.”
          </p>
          <BotaoFalar href="/patrao/falar" tamanho={72} />
        </div>
      ) : null}

      {/* Navegação */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linha pt-5">
        <button
          type="button"
          onClick={voltar}
          disabled={passo === 0 || ocupado}
          className="inline-flex items-center gap-1 text-corpo font-medium text-texto-secundario outline-none hover:text-principal focus-visible:text-principal disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          {passo === 2 ? (
            <Button
              variant="secundario"
              onClick={() => setPasso(3)}
              disabled={ocupado}
            >
              Fazer depois
            </Button>
          ) : null}

          {passo === 0 ? (
            <Button onClick={concluirEmpresa} disabled={ocupado}>
              {ocupado ? "Criando..." : "Continuar"}
            </Button>
          ) : passo === 1 ? (
            <Button onClick={avancarCatalogo} disabled={ocupado}>
              Continuar
            </Button>
          ) : passo < total - 1 ? (
            <Button onClick={() => setPasso((pp) => pp + 1)} disabled={ocupado}>
              Continuar
            </Button>
          ) : (
            <Button onClick={concluir} disabled={ocupado}>
              {ocupado ? "Salvando..." : "Salvar e ir para o painel"}
            </Button>
          )}
        </div>
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
  centavos,
  onChange,
  estreito = false,
}: {
  centavos: number;
  onChange: (centavos: number) => void;
  estreito?: boolean;
}) {
  return (
    <input
      type="number"
      min={0}
      step="0.01"
      inputMode="decimal"
      value={Number.isFinite(centavos) ? centavos / 100 : 0}
      onChange={(e) =>
        onChange(Math.round((parseFloat(e.target.value) || 0) * 100))
      }
      aria-label="Valor em reais"
      className={
        estreito
          ? "h-12 w-28 rounded-xl border border-linha bg-superficie px-3 text-right text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
          : "h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
      }
    />
  );
}

function EntradaPercentual({
  valor,
  onChange,
  rotulo = "Percentual",
}: {
  valor: number;
  onChange: (valor: number) => void;
  rotulo?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min={0}
        step="0.1"
        inputMode="decimal"
        value={valor}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        aria-label={rotulo}
        className="h-11 w-16 rounded-xl border border-linha bg-superficie px-2 text-right text-corpo text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
      />
      <span className="text-corpo text-texto-secundario">%</span>
    </div>
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
