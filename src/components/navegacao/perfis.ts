import {
  Building2,
  Car,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Package,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Configuração da navegação por perfil (CLAUDE.md §10).
 * Sem menu, sem submenus: cada item abre uma tela só. A ordem aqui é a ordem
 * da barra (rodapé no celular, lateral no computador). O botão Falar fica no
 * centro, entre os itens, para patrão e funcionário.
 */
export type PerfilApp = "patrao" | "funcionario" | "admin";

export interface ItemNav {
  rotulo: string;
  href: string;
  icone: LucideIcon;
}

export interface ConfigPerfil {
  perfil: PerfilApp;
  nome: string;
  base: string;
  inicio: string;
  /** Itens da barra, já na ordem — sem contar o botão Falar. */
  itens: ItemNav[];
  /** Presente em patrão e funcionário; ausente no admin. */
  falar?: { href: string };
  /** Ícone de conta no topo (fora da barra). Admin não tem. */
  conta?: ItemNav;
}

export const configPerfis: Record<PerfilApp, ConfigPerfil> = {
  patrao: {
    perfil: "patrao",
    nome: "Patrão",
    base: "/patrao",
    inicio: "/patrao/painel",
    itens: [
      { rotulo: "Painel", href: "/patrao/painel", icone: LayoutDashboard },
      { rotulo: "Estoque", href: "/patrao/estoque", icone: Package },
      { rotulo: "Fechamento", href: "/patrao/fechamento", icone: Wallet },
      { rotulo: "Equipe", href: "/patrao/equipe", icone: Users },
    ],
    falar: { href: "/patrao/falar" },
    conta: { rotulo: "Conta", href: "/patrao/conta", icone: Users },
  },
  funcionario: {
    perfil: "funcionario",
    nome: "Funcionário",
    base: "/funcionario",
    inicio: "/funcionario/patio",
    itens: [
      { rotulo: "Pátio", href: "/funcionario/patio", icone: Car },
      { rotulo: "Estoque", href: "/funcionario/estoque", icone: Package },
    ],
    falar: { href: "/funcionario/falar" },
    conta: { rotulo: "Conta", href: "/funcionario/conta", icone: Users },
  },
  admin: {
    perfil: "admin",
    nome: "Admin",
    base: "/admin",
    inicio: "/admin/visao-geral",
    itens: [
      {
        rotulo: "Visão geral",
        href: "/admin/visao-geral",
        icone: LayoutDashboard,
      },
      { rotulo: "Empresas", href: "/admin/empresas", icone: Building2 },
      { rotulo: "Planos", href: "/admin/planos", icone: CreditCard },
      { rotulo: "Uso da IA", href: "/admin/uso-ia", icone: Sparkles },
      { rotulo: "Suporte", href: "/admin/suporte", icone: LifeBuoy },
      { rotulo: "Comunicados", href: "/admin/comunicados", icone: Megaphone },
    ],
  },
};
