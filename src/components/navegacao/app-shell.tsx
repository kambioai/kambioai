import type { ReactNode } from "react";

import { NavegacaoPerfil } from "./navegacao-perfil";
import { TopoApp } from "./topo-app";
import type { PerfilApp } from "./perfis";

/**
 * Moldura do app para um perfil: barra lateral/rodapé + topo + conteúdo.
 * O conteúdo fica centralizado e com respiro no rodapé no celular para não
 * ficar embaixo da barra fixa.
 */
export function AppShell({
  perfil,
  children,
}: {
  perfil: PerfilApp;
  children: ReactNode;
}) {
  // O admin é pensado para o computador, então o conteúdo pode ser mais largo.
  const largura = perfil === "admin" ? "max-w-5xl" : "max-w-3xl";
  return (
    <div className="min-h-dvh">
      <NavegacaoPerfil perfil={perfil} />
      <div className="md:pl-60">
        <TopoApp perfil={perfil} />
        <main
          className={`mx-auto w-full px-4 pb-28 pt-5 md:pb-10 ${largura}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
