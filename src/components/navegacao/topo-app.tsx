import Link from "next/link";
import { User } from "lucide-react";

import { Logo } from "@/components/logo";
import { configPerfis, type PerfilApp } from "./perfis";
import { SeletorPerfil } from "./seletor-perfil";

/**
 * Barra do topo do app. No celular mostra o logo (a lateral fica escondida);
 * no computador o logo vive na barra lateral. À direita: o seletor de perfil
 * (desenvolvimento) e o ícone de conta (fora da barra, CLAUDE.md §10).
 */
export function TopoApp({ perfil }: { perfil: PerfilApp }) {
  const cfg = configPerfis[perfil];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-linha bg-superficie/95 px-4 backdrop-blur">
      <Link
        href={cfg.inicio}
        className="md:hidden"
        aria-label={`Início — ${cfg.nome}`}
      >
        <Logo tamanho={30} comNome />
      </Link>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <SeletorPerfil atual={perfil} />
        {cfg.conta ? (
          <Link
            href={cfg.conta.href}
            aria-label="Conta"
            className="grid h-10 w-10 place-items-center rounded-full border border-linha text-texto-secundario outline-none transition-colors hover:text-principal focus-visible:ring-2 focus-visible:ring-principal"
          >
            <User className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
