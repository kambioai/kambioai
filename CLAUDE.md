# CLAUDE.md — Kambio

Guia técnico para construir o **Kambio**, um SaaS para oficinas que atendem veículos. O **[PRD.md](PRD.md)** manda no comportamento do produto; este arquivo manda na técnica. Em qualquer conflito, o PRD vence no "o quê" e este arquivo detalha o "como". O protótipo é só referência visual.

Leia o PRD inteiro antes de escrever código de uma função. Aqui ficam as regras que valem para **todo** o código.

---

## 1. O que é o Kambio

SaaS multi-tenant onde cada oficina (**empresa**) tem três perfis sobre a mesma base: **patrão** (dono, controla tudo), **funcionário** (registra trabalho, não vê dinheiro) e **admin** (dono do SaaS, painel separado). O diferencial é **registro por voz**: uma frase falada vira uma Ordem de Serviço completa com estoque, lucro e pagamento, sempre confirmada num cartão antes de salvar.

Regra que atravessa tudo: **a IA só interpreta a fala; quem calcula dinheiro, valida e grava é o servidor.** Um erro da IA nunca pode virar número errado salvo sem o usuário ver.

---

## 2. Stack

| Parte | Escolha | Observação |
| --- | --- | --- |
| Linguagem | **TypeScript estrito**, sem `any`, no app e no servidor | `tsconfig` com `strict: true` |
| Framework | **Next.js (App Router)** + React | Server Components por padrão; `"use client"` só onde precisa |
| Hospedagem | **Vercel Pro** | Rotas de servidor + Vercel Cron |
| App instalável | **PWA** (manifesto, ícone, service worker) | Instalar na tela inicial do celular. Só tema claro no MVP |
| Estilo | **Tailwind CSS** | Cores e fontes da Identidade visual como tokens |
| Componentes | **shadcn/ui** ajustado à Identidade visual | |
| Ícones | **Lucide** (traço 2px) | Sem emoji |
| Gráficos | **Recharts** | |
| Forms/validação | **React Hook Form + Zod** | Zod também valida a resposta da IA |
| Banco + Auth + Storage | **Supabase** (Postgres) | Login e-mail/senha; migrações SQL versionadas (Supabase CLI) |
| IA de voz | **Gemini 3.1 Flash-Lite** (SDK `@google/genai`) | Áudio → JSON em esquema fixo |
| Cobrança | **Stripe Billing** | Assinaturas, funcionário adicional, portal do cliente |
| E-mails | **Resend** + **React Email** | |
| Push | **web-push** (VAPID) | Alertas, lembretes, resumo do dia |

**Variáveis de ambiente** (todas as chaves secretas só no servidor):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # só server
GEMINI_API_KEY                   # só server
STRIPE_SECRET_KEY                # só server
STRIPE_WEBHOOK_SECRET            # só server
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY                   # só server
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY                # só server
```

Nunca exponha chave de serviço, Gemini, Stripe ou Resend no bundle do navegador. Nunca coloque e-mail, nome ou dados do usuário em requisição a serviço externo sem necessidade.

---

## 3. Arquitetura

```
┌─────────────┐     Server Components leem dados direto do Supabase
│  Navegador  │     (sempre sob RLS por empresa_id)
│  PWA/React  │
└──────┬──────┘
       │ ações sensíveis (voz, Stripe, e-mail) → Route Handlers
       ▼
┌─────────────────────┐      ┌──────────┐
│  Next.js na Vercel  │────▶ │  Gemini  │  interpreta áudio → JSON
│  Route Handlers     │────▶ │  Stripe  │  cobrança + webhooks
│  Server Actions     │────▶ │  Resend  │  e-mails
│  Vercel Cron        │────▶ │ web-push │  notificações
└──────────┬──────────┘
           │ service role / RLS
           ▼
     ┌───────────┐
     │ Supabase  │  Postgres + Auth + Storage
     └───────────┘
```

**Princípios:**

1. **Leitura** de dados para montar tela: Server Component lendo Supabase com a chave anon do usuário — passa por RLS. Nunca use service role para montar tela de usuário.
2. **Escrita sensível** (gravar OS, baixar estoque, cobrar, interpretar voz): Route Handler / Server Action no servidor, com cálculo próprio e validação.
3. **Chaves secretas** só em código de servidor. Nunca num Client Component.
4. **Cálculo de dinheiro só no servidor.** A tela só formata.
5. **Toda permissão existe em duas camadas:** no banco (RLS + views) e repetida no servidor. A tela nunca é a única barreira.

---

## 4. Multi-tenant (a regra mais importante)

Um vazamento de dados entre oficinas acaba com o produto. O isolamento mora **no banco**, não na tela.

- Toda tabela de dados de oficina tem a coluna **`empresa_id`** (desde a primeira migração — corrigir depois é caro e arriscado).
- **Row Level Security (RLS) ligado em todas as tabelas.** O Supabase só entrega a uma pessoa as linhas da empresa dela.
- A empresa do usuário sai de `membros` (relação `usuario_id → empresa_id`). As policies usam isso, não um valor vindo do cliente.
- O **funcionário** acessa OS, catálogo e estoque por **views sem as colunas de dinheiro** (`custo`, `custo_total`, `taxa`, `custos_fixos`, `taxas_pagamento`). Ele nunca lê essas colunas, nem por engano de tela.
- **Admin** não tem acesso direto aos dados de oficina. Só entra em **modo suporte** (somente leitura), e cada acesso é registrado com data, hora e motivo (LGPD).

**Padrão de RLS por tabela** (conceito, ajuste à sintaxe real):

```sql
alter table ordens_servico enable row level security;

-- membro da empresa pode ver as OS da empresa dele
create policy "os_select_por_empresa" on ordens_servico
  for select using (
    empresa_id in (
      select empresa_id from membros
      where usuario_id = auth.uid() and ativo = true
    )
  );
```

**Teste obrigatório antes de cada publicação:** dois usuários de empresas diferentes — nenhum enxerga dado do outro. E um funcionário — não lê nenhuma coluna de custo/lucro. Isso é teste automatizado, não manual.

---

## 5. Modelo de dados completo

Regras gerais:

- **Dinheiro em centavos** (inteiros). Nunca float para dinheiro.
- **Datas no fuso `America/Sao_Paulo`.**
- Toda tabela de oficina tem `empresa_id`, `criado_em`, `atualizado_em`.
- `id` em UUID.

### Tabelas

| Tabela | O que guarda | Campos principais |
| --- | --- | --- |
| `empresas` | Cada oficina assinante | `nome`, `segmento`, `cidade`, `plano`, `status_assinatura`, `stripe_customer_id` |
| `membros` | Quem acessa cada empresa | `usuario_id`, `empresa_id`, `papel` (`patrao`\|`funcionario`), `ativo` |
| `clientes` | Clientes da oficina | `nome`, `telefone`, `empresa_id` |
| `veiculos` | Veículos dos clientes | `placa` (única por empresa), `modelo`, `ano`, `cor`, `km`, `cliente_id`, `empresa_id` |
| `catalogo_itens` | Produtos e serviços | `nome`, `tipo` (`produto`\|`servico`), `custo`, `preco`, `estoque`, `estoque_minimo`, `sinonimos` (array), `dias_para_retorno`, `empresa_id` |
| `ordens_servico` | Cada OS | `veiculo_id`, `cliente_id`, `status`, `total`, `custo_total`, `taxa`, `forma_pagamento`, `parcelas`, `autor_id`, `origem` (`voz`\|`manual`), `transcricao`, `empresa_id` |
| `os_itens` | Itens de cada OS | `os_id`, `item_id` (null se avulso), `descricao`, `quantidade`, `preco`, `custo` |
| `movimentos_estoque` | Entradas/saídas de estoque | `item_id`, `quantidade`, `motivo` (`venda`\|`compra`\|`ajuste`), `autor_id`, `empresa_id` |
| `despesas` | Gastos do dia a dia | `descricao`, `valor`, `categoria`, `autor_id`, `empresa_id` |
| `custos_fixos` | Custos mensais | `nome`, `valor`, `empresa_id` |
| `taxas_pagamento` | Taxas da maquininha | `forma`, `parcelas`, `percentual`, `empresa_id` |
| `fechamentos` | Fechamento de cada dia | `data`, `valores_informados` (jsonb por forma), `diferencas` (jsonb), `autor_id`, `empresa_id` |
| `lembretes` | Lembretes e retornos de cliente | `texto`, `data_hora`, `veiculo_id` (null se não for retorno), `enviado`, `empresa_id` |
| `push_inscricoes` | Celulares que aceitaram push | `usuario_id`, `endpoint`, `chaves` (jsonb), `empresa_id` |
| `auditoria` | Histórico de alterações | `tabela`, `registro_id`, `antes` (jsonb), `depois` (jsonb), `autor_id`, `data`, `empresa_id` |
| `uso_ia` | Cada chamada à IA | `empresa_id`, `tokens_entrada`, `tokens_saida`, `custo`, `corrigido` (bool) |

### Status de OS

`Orcamento → Em_servico → Pronto → Entregue`. Recusado → `Cancelado` (não entra no faturamento). Pode marcar `Aguardando_peca` durante o serviço. Venda de balcão (sem veículo) nasce já paga/entregue.

### Invariantes que o **banco** garante (não dependa da tela)

1. Funcionário nunca lê `custo`, `custo_total`, `taxa`, `custos_fixos`, `taxas_pagamento` → acesso só por **views** sem essas colunas.
2. **OS paga + baixa de estoque + linha de auditoria = uma única transação.** Ou tudo grava, ou nada.
3. Toda alteração/exclusão em `ordens_servico`, `despesas`, `catalogo_itens` gera linha em `auditoria` por **trigger**.
4. Lançamento de dia já fechado só pode ser alterado por quem tem papel de **patrão**.
5. Preço lançado por **funcionário** é sempre o do catálogo (o servidor ignora valor falado por ele).

---

## 5b. Cadastro e configuração inicial (onboarding do patrão)

É a **função 1 do App do patrão** (PRD §"App do patrão" §1) e **destrava o resto do sistema**. **Empresa, catálogo e custos/taxas são obrigatórios**; **só o estoque pode ser feito depois** (inclusive pelo funcionário — informar quantidade não revela custo). Acontece logo depois de assinar.

1. **Conta**: nome, celular, e-mail, senha.
2. **Empresa**: nome, cidade, **segmento** (oficina de moto, mecânica, funilaria, estética, troca de óleo, borracharia…).
3. **Catálogo modelo do segmento**: o sistema carrega um catálogo pronto do segmento (serviços + peças comuns). O patrão **não começa do zero** — só ajusta custo e preço e apaga o que não usa. (O catálogo modelo é mantido pelo admin — ver §5 do Painel admin no PRD; carregado na criação da empresa, empresas existentes não são alteradas depois.)
4. **Completar o catálogo**: **digitando** (adicionar/editar itens na mão) agora; **falando** ("pneu 90/90, paguei 100, vendo a 150, tenho 6") a partir da Fase 8 (reusa o pipeline de voz). **Obrigatório.**
5. **Estoque**: quantidade atual e **mínimo** de cada produto (alimenta o alerta de reposição). **Pode ser feito depois** — o patrão pula no onboarding e completa mais tarde; o funcionário pode fazer a contagem (não vê custo).
6. **Custos fixos** (aluguel, funcionários, contador, luz, internet) e **taxas da maquininha**: débito e **crédito em até 12x** (um percentual por nº de parcelas); Pix e dinheiro sem taxa. Vão para `custos_fixos` e `taxas_pagamento`. **Obrigatório.**
7. **Convidar funcionários** (opcional; dispara a lógica de plano/cobrança — ver §7).
8. **Primeira venda**: sistema mostra a frase de exemplo e abre o botão Falar.

Pontos de implementação:
- Cada item de catálogo guarda **custo** e **preço de venda** desde o cadastro (o lucro é `preço − custo`, calculado no servidor).
- **Despesas do dia a dia NÃO entram aqui** — são lançadas na operação (função 7 do patrão). No onboarding entram apenas **custos fixos mensais** e **taxas**.
- O onboarding tem **estado de progresso** (`empresas.onboarding_completo`): a área do patrão só abre com empresa + catálogo + custos/taxas prontos. O **estoque é pulável** ("fazer depois") e não bloqueia.
- Catálogo **por voz** reusa o **mesmo pipeline de voz/IA** (próxima seção), com intenção de montar itens de catálogo em vez de OS — entra na Fase 8.

---

## 6. Pipeline de voz

Fluxo completo (detalhe no PRD §"Pipeline de voz"):

1. **Gravar** no navegador (MediaRecorder), limite **60 s**.
2. **Enviar** áudio para Route Handler, com token de login. Converter formato se o Gemini não aceitar.
3. **Montar contexto** para o Gemini: instruções fixas + catálogo da empresa (id, nome, sinônimos) + placas/clientes recentes + data/hora + papel de quem fala.
4. **Interpretar**: Gemini devolve **JSON em esquema fixo** (nunca texto livre).
5. **Validar no servidor:**
   - confere JSON contra o **esquema Zod**;
   - confere se cada item existe no catálogo daquela empresa;
   - valida formato de **placa** (Mercosul `ABC1D23` ou antigo `ABC1234`);
   - **calcula total, custo, taxa e lucro a partir do catálogo e das taxas** — nunca dos números que a IA devolveu;
   - se quem fala é funcionário, **ignora valor falado** e usa preço do catálogo;
   - marca campos faltantes ou de baixa confiança.
6. **Cartão de confirmação**: campos duvidosos destacados. Funcionário não recebe custo nem lucro.
7. **Confirmar**: servidor grava OS + itens + baixa de estoque + auditoria em **uma transação**.
8. **Registro de uso**: grava em `uso_ia` tokens, custo e se o usuário corrigiu algo.

**Esquema da resposta da IA** (valide com Zod):

```ts
// intencoes aceitas:
type Intencao =
  | "os_paga" | "os_abrir" | "os_atualizar"
  | "despesa" | "compra_estoque" | "atualizar_custo"
  | "pergunta" | "lembrete";
```

```json
{
  "intencao": "os_paga",
  "transcricao": "Gol placa ABC1D23, troquei pastilha e fiz alinhamento...",
  "veiculo": { "placa": "ABC1D23", "modelo": "Gol", "confianca": 0.92 },
  "cliente": null,
  "itens": [
    { "item_id": "pastilha-freio", "quantidade": 1, "custo_avulso": 80 },
    { "item_id": "alinhamento", "quantidade": 1, "custo_avulso": null }
  ],
  "itens_fora_do_catalogo": [],
  "total_falado": 350,
  "pagamento": { "forma": "credito", "parcelas": 2 },
  "status": null
}
```

**Metas e limites:**
- Resposta em até **4 s** depois que a pessoa para de falar.
- Se a IA falhar/demorar: tentar **1 vez** de novo, depois oferecer digitar.
- **Áudio é apagado** depois de processado. Fica só a transcrição, ligada à OS.
- Limite de minutos de voz por plano, controlado por `uso_ia`.

Tudo que funciona por voz **também funciona digitando**.

---

## 7. Cobrança (Stripe)

| Produto no Stripe | Preço | Como entra |
| --- | --- | --- |
| Kambio Básico | R$ 129,90/mês | Item único |
| Kambio PRO | R$ 179,90/mês | Item único, 2 funcionários inclusos |
| Funcionário adicional | R$ 29,90/mês cada | Quantidade = funcionários ativos − 2 |

- **Assinar**: Stripe Checkout → webhook ativa a empresa.
- **Básico → PRO**: ao convidar o 1º funcionário, troca o item da assinatura; diferença proporcional na próxima fatura.
- **Funcionário extra**: 3º funcionário aceita convite → aumenta quantidade; desativa → diminui.
- **Trocar cartão/cancelar**: portal do cliente Stripe, aberto pela tela Conta.
- **Falha de pagamento** → régua configurável: aviso no vencimento → lembrete em 3 dias → **só leitura** em 7 dias → **bloqueio** em 15. Pagou: acesso volta na hora.
- **Webhooks tratados**: assinatura criada/alterada/cancelada; fatura paga; pagamento falhou.
- **Sempre verificar a assinatura do webhook** (`STRIPE_WEBHOOK_SECRET`) antes de mudar status.
- **Pix**: conta BR só aceita Pix em pagamento único → **assinatura é só cartão**. (Pix/dinheiro/débito/crédito existem como forma de pagamento **das OS**, não da assinatura Kambio.)

---

## 8. Tarefas agendadas (Vercel Cron)

- **A cada 5 min**: enviar lembretes vencidos.
- **18h (Brasília)**: resumo do dia + aviso "Feche o caixa".
- **Todo dia**: alertas de retorno de cliente (troca de óleo, revisão) + régua de cobrança.

---

## 9. Identidade visual (tokens Tailwind)

Marinho + laranja. Vermelho **nunca** é cor de marca. Só tema claro no MVP.

```
// cores
principal     #0F2A4A  marinho  (cartão lucro, botões principais, item ativo)
destaque      #E8590C  laranja  (botão Falar, barras, ponto do ícone) — nunca em texto pequeno
fundo         #F3F5F8
superficie    #FFFFFF
texto         #0E1726
texto-2       #556070
linha         #E2E6EC
confirmado    #0B7A4B  verde
atencao       #B54708 sobre #FEF0E6
erro          #B42318 sobre #FEF3F2
```

- **Fontes**: Space Grotesk 700 (títulos e números de dinheiro); Inter 400/500/600 (resto).
- **Tamanhos**: número do painel 40px · título 24px · texto 16px · legenda 13px. Nada < 13px.
- **Botão principal**: marinho, texto branco, altura 52px, cantos 12px.
- **Botão Falar**: círculo laranja 64px, ícone de microfone branco, centro da navegação.
- **Cartões**: brancos, cantos 16px, borda `#E2E6EC`, sem sombra pesada. Cartão de lucro é marinho com texto branco.
- **Logo**: quadrado marinho arredondado, "K" branco Space Grotesk, ponto laranja no canto.

---

## 10. Navegação e regras de interface

**Sem menu hambúrguer, sem "Mais", sem submenus, sem abas escondidas.** Cada botão da navegação abre **uma tela só**. No celular: barra fixa no rodapé. No computador: barra lateral à esquerda, mesmos botões, mesma ordem.

| Perfil | Barra fixa (nesta ordem) | Fora da barra |
| --- | --- | --- |
| Patrão | Painel · Estoque · **Falar** (centro) · Fechamento · Equipe | Ícone de conta no topo → tela Conta |
| Funcionário | Pátio · **Falar** (centro) · Estoque | Ícone de conta no topo → tela Conta |
| Admin (computador) | Visão geral · Empresas · Planos · Uso da IA · Suporte · Comunicados | — |

Funções do patrão sem botão próprio: Pátio e alertas dentro do Painel; "Editar custos" no cartão Contas do mês; histórico por busca de placa no topo do Painel; despesas/lembretes/perguntas pelo botão Falar.

**Regras de UX (valem para toda tela):**

1. No máximo um nível: tela → detalhe (folha por cima) → volta. Botão Voltar sempre visível.
2. Botão Falar em todas as telas de patrão e funcionário.
3. Uma ação principal por tela, em destaque.
4. Área de toque ≥ 48px. Campos com texto 16px (evita zoom do iPhone).
5. Linguagem de dono de oficina: "lucro", "entrou", "saiu", "faltam R$ X". Nunca "receita líquida", "DRE", "margem de contribuição".
6. Dinheiro sempre `R$ 1.234,56`, números importantes grandes.
7. **Nada salva sem o cartão de confirmação.** Depois de salvar, aviso no topo com "Desfazer" por 5 s.
8. Tela vazia diz o que fazer ("Toque em Falar pra registrar sua primeira OS").
9. Erro em português simples, sem código técnico.
10. Enquanto carrega: **esqueleto** da tela, nunca tela branca.
11. Celular primeiro: funciona em **360px** de largura.
12. Contraste ≥ 4,5:1; rótulo de acessibilidade em todo botão só-ícone.

---

## 11. Permissões por perfil (resumo)

O funcionário **lança e consulta**; só o patrão **vê dinheiro e muda regras**; o admin só entra em **modo suporte** (leitura, registrado).

- Funcionário: registra OS/venda por voz, abre OS e muda status, vê **preço de venda** (não custo/lucro), informa custo de peça que ele comprou, consulta estoque **sem custo**, **avisa falta** (não ajusta estoque), corrige **só os próprios** lançamentos **até o fechamento**, nunca exclui.
- Patrão: tudo acima + custo/lucro, catálogo, ajuste de estoque, painel financeiro, fechamento, corrigir/excluir qualquer lançamento, convidar/desativar funcionários, custos fixos e taxas, assinatura.
- Admin: planos, cupons, bloqueio; dados de empresa só em modo suporte (leitura + registro).

A tabela completa está no PRD §"Permissões por perfil". **Toda permissão é checada no banco (RLS/views) E no servidor.**

---

## 12. Estrutura de pastas

```
d:\KAMBIOAI\
├─ CLAUDE.md
├─ PRD.md
├─ next.config.ts
├─ tailwind.config.ts            # tokens de cor/fonte da Identidade visual
├─ tsconfig.json                 # strict: true
├─ package.json
├─ .env.local                    # NÃO commitar
├─ public/
│  ├─ manifest.json              # PWA
│  ├─ sw.js                      # service worker
│  └─ icons/
├─ supabase/
│  ├─ migrations/                # SQL versionado (Supabase CLI)
│  │  ├─ 0001_tabelas.sql
│  │  ├─ 0002_rls.sql
│  │  ├─ 0003_views_funcionario.sql
│  │  ├─ 0004_triggers_auditoria.sql
│  │  └─ 0005_seed_oficina_moto.sql   # dados de exemplo
│  └─ seed/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/                 # login, cadastro, convite
│  │  ├─ (patrao)/               # Painel, Estoque, Fechamento, Equipe, Conta
│  │  ├─ (funcionario)/          # Pátio, Estoque, Conta
│  │  ├─ (admin)/                # Visão geral, Empresas, Planos, Uso da IA, Suporte, Comunicados
│  │  ├─ api/
│  │  │  ├─ voz/route.ts         # pipeline de voz (Gemini)
│  │  │  ├─ stripe/webhook/route.ts
│  │  │  ├─ cron/                # lembretes, resumo-dia, retornos, cobranca
│  │  │  └─ push/
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ ui/                     # shadcn/ui ajustado
│  │  ├─ navegacao/              # barra fixa por perfil
│  │  ├─ botao-falar/
│  │  ├─ cartao-confirmacao/
│  │  ├─ valor-reais/            # Intl.NumberFormat('pt-BR')
│  │  ├─ estado-vazio/
│  │  └─ aviso-desfazer/
│  ├─ lib/
│  │  ├─ supabase/               # client (browser) e server
│  │  ├─ ia/                     # prompt, schema Zod da resposta, cliente Gemini
│  │  ├─ dinheiro/               # centavos ↔ reais, cálculo de lucro/taxa (SERVIDOR)
│  │  ├─ placa/                  # validação Mercosul/antigo
│  │  ├─ stripe/
│  │  ├─ email/                  # React Email + Resend
│  │  └─ permissoes/             # checagem repetida no servidor
│  ├─ server/                    # Server Actions / lógica de escrita
│  └─ types/                     # tipos compartilhados
└─ tests/
   ├─ isolamento-empresas.test.ts
   ├─ funcionario-sem-custo.test.ts
   ├─ calculo-lucro-taxa.test.ts
   ├─ schema-ia.test.ts
   └─ stripe-webhooks.test.ts
```

---

## 13. Convenções de código

1. **TypeScript estrito, sem `any`.** Tipos derivados do schema do banco sempre que possível.
2. **Toda permissão no banco (RLS + views) e repetida no servidor.** A tela nunca é a única barreira.
3. **Dinheiro em centavos inteiros. Cálculo só no servidor.** Na tela, formatar com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
4. **Chaves secretas só em rotas/código de servidor.** Jamais num Client Component.
5. **Todos os textos da interface em pt-BR**, no tom das regras de UX.
6. **Componentes reaproveitáveis desde o começo**: navegação por perfil, botão Falar, cartão de confirmação, valor em reais, estado vazio, aviso com Desfazer.
7. **Migrações SQL versionadas** + dados de exemplo de uma oficina de moto (catálogo, 3 veículos, OS dos últimos 7 dias).
8. **Server Components por padrão.** `"use client"` só onde há estado/interação.
9. **Validação com Zod** em toda entrada de dados (forms e resposta da IA).
10. **Datas sempre em `America/Sao_Paulo`.**
11. Nomes de tabela/coluna em **português** (como no modelo de dados). Código em inglês onde for idiomático, mas domínio em português para casar com o banco.

**Testes automáticos mínimos** (devem passar antes de publicar):
- isolamento entre duas empresas;
- funcionário sem acesso a custo/lucro;
- cálculo de lucro e taxa;
- validação do JSON da IA;
- webhooks do Stripe.

**Uma tela só está pronta quando:**
- funciona em 360px e no computador;
- tem estado vazio, carregando (esqueleto) e erro;
- segue a Identidade visual e as regras de UX;
- respeita a tabela de Permissões, testada com um patrão e um funcionário.

---

## 14. Ordem de construção

1. **Base**: Next.js, Tailwind com tokens, PWA, navegação fixa por perfil.
2. **Supabase**: tabelas, RLS, views do funcionário, triggers de auditoria, dados de exemplo.
3. **Login**, cadastro da empresa, **onboarding do patrão** (ver §5b: catálogo modelo do segmento, estoque, custos fixos e taxas).
4. **Botão Falar**, pipeline de voz, cartão de confirmação (com opção de digitar).
5. **OS e pátio**, histórico por placa, estoque, despesas.
6. **Painel** com filtros, Contas do mês, alertas.
7. **Fechamento do dia.**
8. **Equipe**: convite, permissões, telas do funcionário.
9. **Stripe**: planos, checkout, portal, webhooks, régua de cobrança.
10. **Lembretes, push, Vercel Cron.**
11. **Painel admin.**

---

## 15. Decisões tomadas e Fora do MVP

**Decisões já batidas (não reabrir sem pedir):**
- **IA de voz**: fica o **Gemini 3.1 Flash-Lite** fazendo transcrição + interpretação (plano A). O plano B (Whisper/Groq) **não entra agora**; o dono testa o produto pronto e troca só se a placa errar muito. Não há fase de "50 áudios antes de programar".
- **Despesa por funcionário**: **não**. Só o patrão registra despesa. RLS da tabela `despesas` e a checagem de permissão devem bloquear o funcionário.

**Fora do MVP (não construir agora):** comissão por funcionário · app nas lojas · consulta de modelo pela placa · nota fiscal · leitura de extrato bancário/maquininha · multi-unidade por empresa · link de avaliação no Google · uso offline.

---

> Fonte da verdade do produto: **[PRD.md](PRD.md)**. Em dúvida sobre comportamento, consulte-o antes de inventar.
