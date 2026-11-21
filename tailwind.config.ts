import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Tokens da Identidade visual do Kambio (CLAUDE.md §9).
 * As cores de marca ficam com nomes em português (principal, destaque, fundo…).
 * As variáveis semânticas (hsl var) servem aos componentes shadcn/ui.
 */
const config: Config = {
  darkMode: ["class"], // Só tema claro no MVP; mantido para compatibilidade com shadcn.
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de marca (hex direto).
        principal: "#0F2A4A",
        destaque: "#E8590C",
        fundo: "#F3F5F8",
        superficie: "#FFFFFF",
        texto: "#0E1726",
        "texto-secundario": "#556070",
        linha: "#E2E6EC",
        confirmado: "#0B7A4B",
        atencao: { DEFAULT: "#B54708", fundo: "#FEF0E6" },
        erro: { DEFAULT: "#B42318", fundo: "#FEF3F2" },

        // Variáveis semânticas do shadcn/ui (mapeadas à marca).
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        grotesk: ["var(--font-grotesk)", "var(--font-inter)", "sans-serif"],
      },
      fontSize: {
        legenda: ["0.8125rem", { lineHeight: "1.1rem" }], // 13px — menor permitido.
        corpo: ["1rem", { lineHeight: "1.5rem" }], // 16px.
        titulo: ["1.5rem", { lineHeight: "1.875rem" }], // 24px.
        painel: ["2.5rem", { lineHeight: "2.75rem" }], // 40px — número principal.
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
};

export default config;
