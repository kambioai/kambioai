import type { ReactNode } from "react";

import { Logo } from "@/components/logo";

/**
 * Casca das telas de acesso e onboarding (login, cadastro, convite, começar).
 * Fica FORA do AppShell — sem barra de perfil. Centraliza o conteúdo num cartão,
 * com o logo no topo. Funciona em 360px (mobile primeiro).
 */
export function CascaAuth({
  titulo,
  subtitulo,
  children,
  rodape,
  largura = "estreita",
}: {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
  rodape?: ReactNode;
  largura?: "estreita" | "larga";
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-fundo px-4 py-10">
      <div
        className={
          largura === "larga"
            ? "w-full max-w-2xl"
            : "w-full max-w-md"
        }
      >
        <div className="mb-6 flex justify-center">
          <Logo tamanho={48} comNome />
        </div>

        <div className="rounded-2xl border border-linha bg-superficie p-6 sm:p-8">
          <h1 className="font-grotesk text-titulo font-bold text-principal">
            {titulo}
          </h1>
          {subtitulo ? (
            <p className="mt-1 text-corpo text-texto-secundario">{subtitulo}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>

        {rodape ? (
          <div className="mt-5 text-center text-corpo text-texto-secundario">
            {rodape}
          </div>
        ) : null}
      </div>
    </main>
  );
}
