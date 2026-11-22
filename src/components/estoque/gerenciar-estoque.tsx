"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EstadoVazio } from "@/components/estado-vazio/estado-vazio";
import { ValorReais } from "@/components/valor-reais/valor-reais";
import { adicionarItem, atualizarItem, removerItem } from "@/server/catalogo";
import type { ItemCatalogoMock } from "@/lib/mock";
import { cn } from "@/lib/utils";
import type { TipoItem } from "@/types";

interface Form {
  id: string | null;
  nome: string;
  tipo: TipoItem;
  precoCentavos: number;
  custoCentavos: number;
  estoque: number;
  estoqueMinimo: number;
}

function formVazio(tipo: TipoItem): Form {
  return {
    id: null,
    nome: "",
    tipo,
    precoCentavos: 0,
    custoCentavos: 0,
    estoque: 0,
    estoqueMinimo: 0,
  };
}

/** Catálogo/estoque do patrão: lista, adiciona, edita e exclui itens (grava no banco). */
export function GerenciarEstoque({ itens }: { itens: ItemCatalogoMock[] }) {
  const router = useRouter();
  const [aba, setAba] = useState<TipoItem>("produto");
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const termo = busca.trim().toLowerCase();
  const lista = itens
    .filter((i) => i.tipo === aba)
    .filter((i) => i.nome.toLowerCase().includes(termo));

  function abrirNovo() {
    setErro(null);
    setForm(formVazio(aba));
  }

  function abrirEdicao(item: ItemCatalogoMock) {
    setErro(null);
    setForm({
      id: item.id,
      nome: item.nome,
      tipo: item.tipo,
      precoCentavos: item.precoCentavos,
      custoCentavos: item.custoCentavos,
      estoque: item.estoque,
      estoqueMinimo: item.estoqueMinimo,
    });
  }

  async function salvar() {
    if (!form) return;
    if (form.nome.trim() === "") {
      setErro("Informe o nome do item.");
      return;
    }
    setSalvando(true);
    setErro(null);
    const dados = {
      nome: form.nome,
      tipo: form.tipo,
      custoCentavos: form.custoCentavos,
      precoCentavos: form.precoCentavos,
      estoque: form.estoque,
      estoqueMinimo: form.estoqueMinimo,
    };
    const r = form.id
      ? await atualizarItem({ ...dados, id: form.id })
      : await adicionarItem(dados);
    setSalvando(false);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    setForm(null);
    router.refresh();
  }

  async function excluir(item: ItemCatalogoMock) {
    if (!window.confirm(`Excluir "${item.nome}"?`)) return;
    const r = await removerItem(item.id);
    if (!r.ok) {
      setErro(r.erro);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Tipo de item">
        <Aba ativa={aba === "produto"} onClick={() => setAba("produto")}>
          Produtos
        </Aba>
        <Aba ativa={aba === "servico"} onClick={() => setAba("servico")}>
          Serviços
        </Aba>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-texto-secundario"
            aria-hidden="true"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar no catálogo"
            placeholder="Buscar..."
            className="h-12 w-full rounded-xl border border-linha bg-superficie pl-10 pr-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal"
          />
        </div>
        <Button className="h-12 shrink-0" onClick={abrirNovo}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          Adicionar
        </Button>
      </div>

      {erro ? (
        <p className="rounded-xl bg-erro-fundo px-3 py-2 text-legenda text-erro">
          {erro}
        </p>
      ) : null}

      {form ? (
        <ItemForm
          form={form}
          salvando={salvando}
          onChange={setForm}
          onSalvar={salvar}
          onCancelar={() => setForm(null)}
        />
      ) : null}

      {lista.length === 0 ? (
        <EstadoVazio
          titulo="Nada aqui ainda"
          mensagem="Toque em Adicionar para incluir um item."
        />
      ) : (
        <ul className="space-y-3">
          {lista.map((item) => (
            <ItemLinha
              key={item.id}
              item={item}
              onEditar={() => abrirEdicao(item)}
              onExcluir={() => excluir(item)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ItemLinha({
  item,
  onEditar,
  onExcluir,
}: {
  item: ItemCatalogoMock;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const lucroCentavos = item.precoCentavos - item.custoCentavos;
  const lucroPercent =
    item.precoCentavos > 0
      ? Math.round((lucroCentavos / item.precoCentavos) * 100)
      : 0;
  const baixo = item.tipo === "produto" && item.estoque <= item.estoqueMinimo;

  return (
    <li className="rounded-2xl border border-linha bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-texto">{item.nome}</p>
        <div className="flex shrink-0 items-center gap-1">
          {item.tipo === "produto" ? (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-legenda font-medium",
                baixo
                  ? "bg-atencao-fundo text-atencao"
                  : "bg-fundo text-principal",
              )}
            >
              {item.estoque} em estoque
            </span>
          ) : null}
          <button
            type="button"
            onClick={onEditar}
            aria-label={`Editar ${item.nome}`}
            className="grid h-9 w-9 place-items-center rounded-lg text-texto-secundario outline-none hover:bg-fundo hover:text-principal focus-visible:ring-2 focus-visible:ring-principal"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onExcluir}
            aria-label={`Excluir ${item.nome}`}
            className="grid h-9 w-9 place-items-center rounded-lg text-texto-secundario outline-none hover:bg-fundo hover:text-erro focus-visible:ring-2 focus-visible:ring-principal"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-legenda">
        <Campo rotulo="Custo">
          <ValorReais centavos={item.custoCentavos} className="text-texto" />
        </Campo>
        <Campo rotulo="Preço">
          <ValorReais centavos={item.precoCentavos} className="text-texto" />
        </Campo>
        <Campo rotulo="Lucro">
          <span className="font-medium text-confirmado">
            <ValorReais centavos={lucroCentavos} /> ({lucroPercent}%)
          </span>
        </Campo>
      </dl>
    </li>
  );
}

function ItemForm({
  form,
  salvando,
  onChange,
  onSalvar,
  onCancelar,
}: {
  form: Form;
  salvando: boolean;
  onChange: (f: Form) => void;
  onSalvar: () => void;
  onCancelar: () => void;
}) {
  const ehProduto = form.tipo === "produto";
  return (
    <div className="space-y-3 rounded-2xl border border-principal bg-superficie p-4">
      <p className="font-grotesk font-bold text-principal">
        {form.id ? "Editar item" : "Novo item"}
      </p>
      <Rotulo texto="Nome">
        <input
          value={form.nome}
          onChange={(e) => onChange({ ...form, nome: e.target.value })}
          placeholder="Nome do item"
          className={entrada}
        />
      </Rotulo>
      <div className="grid grid-cols-2 gap-3">
        <Rotulo texto="Tipo">
          <select
            value={form.tipo}
            onChange={(e) =>
              onChange({ ...form, tipo: e.target.value as TipoItem })
            }
            className={entrada}
          >
            <option value="produto">Produto</option>
            <option value="servico">Serviço</option>
          </select>
        </Rotulo>
        <Rotulo texto="Preço de venda (R$)">
          <EntradaReais
            centavos={form.precoCentavos}
            onChange={(c) => onChange({ ...form, precoCentavos: c })}
          />
        </Rotulo>
        {ehProduto ? (
          <>
            <Rotulo texto="Custo (R$)">
              <EntradaReais
                centavos={form.custoCentavos}
                onChange={(c) => onChange({ ...form, custoCentavos: c })}
              />
            </Rotulo>
            <div />
            <Rotulo texto="Estoque atual">
              <EntradaInteiro
                valor={form.estoque}
                onChange={(v) => onChange({ ...form, estoque: v })}
              />
            </Rotulo>
            <Rotulo texto="Mínimo">
              <EntradaInteiro
                valor={form.estoqueMinimo}
                onChange={(v) => onChange({ ...form, estoqueMinimo: v })}
              />
            </Rotulo>
          </>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" onClick={onSalvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
        <Button variant="secundario" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

const entrada =
  "h-12 w-full rounded-xl border border-linha bg-superficie px-3 text-corpo text-texto outline-none placeholder:text-texto-secundario focus-visible:ring-2 focus-visible:ring-principal";

function Rotulo({ texto, children }: { texto: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-legenda font-medium text-texto">{texto}</span>
      {children}
    </label>
  );
}

function EntradaReais({
  centavos,
  onChange,
}: {
  centavos: number;
  onChange: (centavos: number) => void;
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
      className={entrada}
    />
  );
}

function EntradaInteiro({
  valor,
  onChange,
}: {
  valor: number;
  onChange: (valor: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      step="1"
      inputMode="numeric"
      value={valor}
      onChange={(e) =>
        onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))
      }
      className={entrada}
    />
  );
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-texto-secundario">{rotulo}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}

function Aba({
  ativa,
  onClick,
  children,
}: {
  ativa: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-corpo font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-principal",
        ativa
          ? "bg-principal text-white"
          : "border border-linha bg-superficie text-texto-secundario hover:text-principal",
      )}
    >
      {children}
    </button>
  );
}
