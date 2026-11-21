# Kambio

SaaS para oficinas que atendem veículos. Registro por voz, controle de lucro, estoque e caixa.

- **Produto:** [PRD.md](PRD.md)
- **Técnica:** [CLAUDE.md](CLAUDE.md)
- **Plano de construção:** [PLAN.md](PLAN.md)

## Rodar localmente

```bash
npm install
cp .env.local.example .env.local   # preencha quando os serviços entrarem
npm run dev                        # http://localhost:3000
```

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Sobe o app em desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run typecheck` | Checa os tipos (TypeScript estrito) |
| `npm run lint` | ESLint |
| `npm run test` | Testes (Vitest) |
| `npm run format` | Formata com Prettier |
| `npm run gerar-icones` | Gera os PNGs do PWA a partir de `public/icons/icon.svg` |

## Stack

Next.js (App Router) · TypeScript estrito · Tailwind + shadcn/ui · Lucide · Recharts ·
React Hook Form + Zod · Supabase · Gemini · Stripe · Resend · web-push. Detalhes na [CLAUDE.md](CLAUDE.md).

## Deploy (Vercel)

O projeto está pronto para a Vercel. A conexão do repositório à conta da Vercel
(deploy de preview por branch) é um passo manual, feito com a sua conta: importar o
repositório em vercel.com ou rodar `vercel link`. As variáveis de ambiente de
`.env.local.example` devem ser cadastradas no projeto da Vercel.
