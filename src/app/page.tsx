import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Building2,
  Car,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/logo";

interface Area {
  nome: string;
  descricao: string;
  href: string;
  icone: LucideIcon;
}

const areas: Area[] = [
  {
    nome: "Patrão",
    descricao: "Painel, estoque, fechamento e equipe.",
    href: "/patrao/painel",
    icone: LayoutDashboard,
  },
  {
    nome: "Funcionário",
    descricao: "Pátio e estoque, sem ver dinheiro.",
    href: "/funcionario/patio",
    icone: Car,
  },
  {
    nome: "Admin",
    descricao: "Visão geral do SaaS (pensado para o computador).",
    href: "/admin/visao-geral",
    icone: Building2,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-4 py-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <Logo tamanho={56} comNome />
        <p className="max-w-md text-corpo text-texto-secundario">
          Protótipo navegável (Fase 1). Escolha um perfil para entrar — dá para
          trocar de perfil a qualquer momento pelo seletor no topo.
        </p>
      </header>

      <nav className="space-y-3" aria-label="Áreas do app">
        {areas.map((area) => {
          const Icone = area.icone;
          return (
            <Link
              key={area.href}
              href={area.href}
              className="flex items-center gap-4 rounded-2xl border border-linha bg-superficie p-4 outline-none transition-colors hover:border-principal focus-visible:ring-2 focus-visible:ring-principal"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-principal text-white">
                <Icone className="h-6 w-6" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-grotesk text-corpo font-bold text-principal">
                  {area.nome}
                </span>
                <span className="block text-legenda text-texto-secundario">
                  {area.descricao}
                </span>
              </span>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-texto-secundario"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </nav>

      <div className="text-center">
        <Link
          href="/componentes"
          className="inline-flex items-center gap-2 text-corpo font-medium text-principal hover:underline"
        >
          <Blocks className="h-5 w-5" aria-hidden="true" />
          Ver a vitrine de componentes
        </Link>
      </div>
    </main>
  );
}
