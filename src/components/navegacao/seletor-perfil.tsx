"use client";

import { useRouter } from "next/navigation";

import { configPerfis, type PerfilApp } from "./perfis";

/**
 * Seletor de perfil — SÓ PARA DESENVOLVIMENTO (PLAN.md, Fase 1).
 * Permite navegar entre as três áreas (patrão / funcionário / admin) sem login.
 * Nas fases de backend, o perfil virá da autenticação e este seletor sai.
 */
export function SeletorPerfil({ atual }: { atual: PerfilApp }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-1.5 text-legenda text-texto-secundario">
      <span className="hidden sm:inline">Ver como</span>
      <select
        aria-label="Trocar de perfil (desenvolvimento)"
        value={atual}
        onChange={(e) =>
          router.push(configPerfis[e.target.value as PerfilApp].inicio)
        }
        className="rounded-md border border-linha bg-superficie px-2 py-1 text-legenda text-texto outline-none focus-visible:ring-2 focus-visible:ring-principal"
      >
        <option value="patrao">Patrão</option>
        <option value="funcionario">Funcionário</option>
        <option value="admin">Admin</option>
      </select>
    </label>
  );
}
