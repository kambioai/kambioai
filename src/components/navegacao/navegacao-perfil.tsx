"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic } from "lucide-react";

import { Logo } from "@/components/logo";
import { BotaoFalar } from "@/components/botao-falar/botao-falar";
import { cn } from "@/lib/utils";
import { configPerfis, type ItemNav, type PerfilApp } from "./perfis";

/**
 * Navegação fixa por perfil (CLAUDE.md §10).
 * Celular: barra no rodapé, com o Falar saltando no centro.
 * Computador: barra lateral à esquerda, mesmos botões, mesma ordem.
 */
export function NavegacaoPerfil({ perfil }: { perfil: PerfilApp }) {
  const pathname = usePathname();
  const cfg = configPerfis[perfil];

  const estaAtivo = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Divide os itens ao meio para encaixar o Falar no centro (patrão/funcionário).
  const meio = Math.ceil(cfg.itens.length / 2);
  const esquerda = cfg.falar ? cfg.itens.slice(0, meio) : cfg.itens;
  const direita = cfg.falar ? cfg.itens.slice(meio) : [];

  return (
    <>
      {/* ----- Celular: barra no rodapé ----- */}
      <nav
        aria-label={`Navegação ${cfg.nome}`}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-linha bg-superficie md:hidden"
      >
        <ul className="mx-auto flex h-16 max-w-3xl items-stretch justify-around px-1">
          {esquerda.map((item) => (
            <ItemBarra
              key={item.href}
              item={item}
              ativo={estaAtivo(item.href)}
            />
          ))}
          {cfg.falar ? (
            <li className="flex items-end justify-center">
              <BotaoFalar
                href={cfg.falar.href}
                tamanho={56}
                className="-translate-y-4"
              />
            </li>
          ) : null}
          {direita.map((item) => (
            <ItemBarra
              key={item.href}
              item={item}
              ativo={estaAtivo(item.href)}
            />
          ))}
        </ul>
      </nav>

      {/* ----- Computador: barra lateral ----- */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-linha bg-superficie md:flex">
        <div className="px-5 py-5">
          <Link href={cfg.inicio} aria-label={`Início — ${cfg.nome}`}>
            <Logo tamanho={32} comNome />
          </Link>
          <p className="mt-2 text-legenda text-texto-secundario">{cfg.nome}</p>
        </div>
        <ul className="flex-1 space-y-1 px-3">
          {esquerda.map((item) => (
            <ItemLateral
              key={item.href}
              item={item}
              ativo={estaAtivo(item.href)}
            />
          ))}
          {cfg.falar ? (
            <li>
              <Link
                href={cfg.falar.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-destaque focus-visible:ring-offset-2",
                  estaAtivo(cfg.falar.href)
                    ? "bg-destaque"
                    : "bg-destaque hover:bg-destaque/90",
                )}
              >
                <Mic className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                Falar
              </Link>
            </li>
          ) : null}
          {direita.map((item) => (
            <ItemLateral
              key={item.href}
              item={item}
              ativo={estaAtivo(item.href)}
            />
          ))}
        </ul>
      </aside>
    </>
  );
}

/** Item da barra do rodapé (celular): ícone em cima, rótulo embaixo. */
function ItemBarra({ item, ativo }: { item: ItemNav; ativo: boolean }) {
  const Icone = item.icone;
  return (
    <li className="flex-1">
      <Link
        href={item.href}
        aria-current={ativo ? "page" : undefined}
        className={cn(
          "flex h-full min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-legenda outline-none transition-colors focus-visible:ring-2 focus-visible:ring-principal",
          ativo ? "text-principal" : "text-texto-secundario",
        )}
      >
        <Icone className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
        <span className="leading-none">{item.rotulo}</span>
      </Link>
    </li>
  );
}

/** Item da barra lateral (computador): ícone + rótulo na horizontal. */
function ItemLateral({ item, ativo }: { item: ItemNav; ativo: boolean }) {
  const Icone = item.icone;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={ativo ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-3 font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-principal",
          ativo
            ? "bg-principal text-white"
            : "text-texto-secundario hover:bg-fundo hover:text-principal",
        )}
      >
        <Icone className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        {item.rotulo}
      </Link>
    </li>
  );
}
