# PLAN.md — Plano de construção do Kambio

Plano de execução do MVP, do setup ao deploy. Fatiado em **fases testáveis**: ao fim de cada fase o sistema **roda e é verificável** com o que aquela fase entregou. Estratégia: **frontend primeiro** (telas rodando com dados fictícios), **backend depois** (trocando os dados fictícios por Supabase, Gemini e Stripe de verdade).

Fonte da verdade do produto: **[PRD.md](PRD.md)**. Regras técnicas: **[CLAUDE.md](CLAUDE.md)**. Em conflito, o PRD manda no comportamento e o CLAUDE.md na técnica.

---

## Como ler este plano

- **Branch**: cada fase vive numa branch própria, saída da `main`. Só volta para a `main` depois de passar na **Portaria de Vistoria**.
- **Objetivo**: o resultado observável da fase.
- **Itens**: o que se desenvolve.
- **Pronto quando**: critério de aceite — como testar que a fase terminou.
- **Fonte dos dados**: `fictício` (camada mock) ou `real` (serviço externo). As fases de frontend leem de `src/lib/mock/`; as de backend substituem essa camada por dados reais **sem mudar os componentes de tela**.

### A costura frontend ↔ backend (decisão de implementação)

Para construir o front antes do back sem retrabalho, toda leitura/escrita de tela passa por uma **camada de acesso a dados** (`src/lib/dados/`) com funções como `listarOrdens()`, `salvarOS()`, `lerPainel()`. Nas fases de frontend essas funções devolvem **dados fictícios** de `src/lib/mock/`. Nas fases de backend, a implementação de dentro dessas funções passa a chamar Supabase/servidor — **a assinatura das funções e os componentes não mudam**. É o ponto de troca único entre o mundo fictício e o real.

---

## Portaria de Vistoria (obrigatória no fim de TODA fase)

Nenhuma branch vai para a `main` sem passar por estes três crivos. Rode e registre o resultado no PR da fase.

**1. Busca por erros**
- `npm run typecheck` sem erros (TypeScript estrito, zero `any`).
- `npm run lint` limpo.
- `npm run build` conclui.
- `npm test` — os testes da fase e os de fases anteriores passam.
- Console do navegador sem erro/aviso nas telas da fase.
- Estados **vazio**, **carregando** (esqueleto) e **erro** existem em cada tela nova.

**2. Segurança**
- Nenhuma chave secreta no bundle do cliente (buscar por `SERVICE_ROLE`, `GEMINI`, `STRIPE_SECRET`, `RESEND` no código que vai ao navegador).
- Nas fases com backend: **RLS testada com duas empresas** (nenhuma vê a outra) e **funcionário sem acesso a custo/lucro**.
- Entrada validada com **Zod** em toda rota/ação de servidor.
- Permissão checada **no servidor**, não só na tela.
- Cálculo de dinheiro só no servidor; valores em centavos.

**3. Desempenho**
- Telas funcionam em **360px** e no computador.
- Sem salto de layout ao carregar (esqueleto no lugar).
- Lighthouse mobile ≥ 90 em Performance e Acessibilidade nas telas da fase (a partir da Fase 2).
- Resposta de voz dentro da meta (≤ 4 s) nas fases que usam IA.
- Sem consulta ao banco dentro de laço (N+1) nas fases de backend.

**Fechamento**: deploy de preview na Vercel verde + marcar os itens de **Pronto quando** + abrir PR com o resultado dos três crivos.

---

# BLOCO 0 — Fundação

## Fase 0 — Setup do projeto
- **Branch**: `fase-00-setup`
- **Status**: ✅ Concluída (21/11/2026) — publicada em produção na Vercel; branch mesclada na `main` e removida.
- **Objetivo**: projeto Next.js rodando na Vercel, com a identidade visual aplicada, exibindo uma tela inicial de teste.
- **Fonte dos dados**: nenhuma.
- **Itens**:
  - Next.js (App Router) + TypeScript estrito (`strict: true`, sem `any`).
  - Tailwind com os **tokens de cor e fonte** da Identidade visual (CLAUDE.md §9).
  - shadcn/ui instalado e ajustado aos tokens; Lucide; fontes Space Grotesk e Inter.
  - PWA base: `manifest.json`, ícones, `sw.js` (service worker mínimo).
  - Estrutura de pastas da CLAUDE.md §12 criada (vazia/esqueleto), incluindo `src/lib/dados/` e `src/lib/mock/`.
  - Ferramentas: ESLint, Prettier, Vitest, scripts `dev/build/typecheck/lint/test`.
  - Projeto conectado à Vercel (deploy de preview automático por branch).
- **Pronto quando**:
  - `npm run dev` sobe o app; a tela inicial mostra o logo e as cores da marca.
  - Deploy de preview na Vercel abre no celular e dá para "instalar na tela inicial".

---

# BLOCO 1 — Frontend (telas rodando com dados fictícios)

## Fase 1 — Design system e navegação
- **Branch**: `fase-01-design-system`
- **Status**: ✅ Concluída (21/11/2026) — mesclada na `main` e removida. Vistoria verde (typecheck/lint/testes/build).
- **Objetivo**: componentes reaproveitáveis e navegação por perfil funcionando, navegável entre telas de placeholder.
- **Fonte dos dados**: `fictício`.
- **Itens**:
  - Componentes base: **botão principal/secundário**, **botão Falar**, **cartão**, **valor em reais** (`Intl.NumberFormat('pt-BR')`), **estado vazio**, **aviso com Desfazer** (5 s), **esqueleto** de carregamento.
  - **Navegação fixa por perfil**: barra no rodapé no celular, barra lateral no computador, mesma ordem (CLAUDE.md §10).
  - Troca de perfil só para desenvolvimento (patrão / funcionário / admin), para navegar as três áreas.
  - Página interna "/componentes" listando os componentes (vitrine para teste visual).
  - Camada `src/lib/dados/` com as funções do app devolvendo dados de `src/lib/mock/` (oficina de moto: catálogo, 3 veículos, OS dos últimos 7 dias).
- **Pronto quando**:
  - Dá para navegar por todos os botões das três barras; cada botão abre uma tela (ainda que placeholder).
  - Os componentes aparecem na vitrine, corretos em 360px e no desktop.

## Fase 2 — Telas do patrão (fictício)
- **Branch**: `fase-02-front-patrao`
- **Objetivo**: todas as telas do patrão navegáveis e preenchidas com dados fictícios.
- **Fonte dos dados**: `fictício`.
- **Itens**:
  - **Painel**: filtros (Hoje/Ontem/7 dias/Mês/período), cartão de lucro, faturamento/custos/taxas/despesas/nº de OS, **Contas do mês** (barra), **Alertas**, **Pátio**, gráfico de lucro por dia (Recharts), ranking de serviços, últimos lançamentos.
  - **Estoque e catálogo**: abas Produtos/Serviços, custo/preço/lucro R$ e %, quantidade, filtro "só estoque baixo", busca.
  - **Fechamento do dia**: comparação por forma de pagamento (Bateu/Sobrou/Faltam), lançamentos agrupados por autor, resumo.
  - **Equipe**: lista de funcionários, estado para convidar.
  - **Conta**: assinatura, dados da empresa, histórico de alterações, exportar, sair.
  - **Histórico por placa**: busca no topo do Painel → ficha do veículo (linha do tempo de OS).
  - **Cartão de confirmação de voz** (visual, com dados fictícios): veículo, cliente, itens, total, custo, taxa, **lucro**, alerta de prejuízo, "cadastrar agora".
- **Pronto quando**:
  - As 13 funções do patrão têm tela navegável com dados fictícios coerentes.
  - Cada tela tem estado vazio/carregando/erro e passa em 360px.

## Fase 3 — Telas do funcionário (fictício)
- **Branch**: `fase-03-front-funcionario`
- **Objetivo**: área do funcionário navegável, **sem custo/lucro em nenhuma tela**.
- **Fonte dos dados**: `fictício`.
- **Itens**:
  - **Pátio** (tela inicial): OS abertas com placa/modelo/serviço/status.
  - **Estoque (consulta)**: só quantidade e **preço de venda**, sem custo; botão **Avisar falta**.
  - **Cartão de confirmação** do funcionário: preço de venda e total, **sem custo nem lucro**; campo de custo de peça comprada por ele.
  - **Meus lançamentos**: lista do dia/últimos dias; correção só dos próprios.
  - **Histórico por placa** (sem total gasto do cliente, sem lucro).
  - **Conta** do funcionário: meus lançamentos, sair.
- **Pronto quando**:
  - A barra do funcionário tem só Pátio · Falar · Estoque; nenhuma tela mostra custo/lucro/financeiro.
  - Navegação e estados completos em 360px.

## Fase 4 — Onboarding e telas de acesso (fictício)
- **Branch**: `fase-04-front-onboarding`
- **Objetivo**: fluxo de entrada e configuração inicial navegável (CLAUDE.md §5b).
- **Fonte dos dados**: `fictício`.
- **Itens**:
  - Telas de **login**, **cadastro da conta**, **recuperação de senha**, **aceitar convite**.
  - **Onboarding do patrão** com progresso: dados da empresa → catálogo modelo do segmento (editar custo/preço/apagar) → estoque atual/mínimo → custos fixos e taxas → convidar → primeira venda.
  - Tela de **escolha de plano** (Básico/PRO) — visual.
- **Pronto quando**:
  - Dá para percorrer o onboarding do início ao "abrir o botão Falar", com barra de progresso avançando (tudo fictício).

## Fase 5 — Painel admin (fictício)
- **Branch**: `fase-05-front-admin`
- **Objetivo**: painel admin navegável no computador, com dados fictícios.
- **Fonte dos dados**: `fictício`.
- **Itens**:
  - **Visão geral**, **Empresas** (lista + ficha + ações), **Planos**, **Uso da IA** (custo, taxa de correção, frases que falharam), **Suporte**, **Comunicados**.
- **Pronto quando**:
  - As 6 telas do admin abrem com dados fictícios coerentes, pensadas para desktop.

> **Marco 1 — App navegável completo (fictício).** Fim do Bloco 1: todas as telas dos três perfis rodam na Vercel com dados fictícios. É o protótipo funcional para validar fluxo e visual antes de ligar o backend.

---

# BLOCO 2 — Backend (ligando dados reais)

A partir daqui cada fase **substitui os dados fictícios pelos reais** dentro de `src/lib/dados/`, mantendo as telas iguais. Toda fase de backend inclui os testes de segurança correspondentes.

## Fase 6 — Banco, multi-tenant e auth
- **Branch**: `fase-06-banco-rls`
- **Objetivo**: Supabase com o modelo de dados completo, isolamento por empresa e login real.
- **Fonte dos dados**: `real` (Supabase).
- **Itens**:
  - Migrações SQL versionadas (Supabase CLI) com **todas as tabelas** (CLAUDE.md §5), dinheiro em centavos, fuso `America/Sao_Paulo`.
  - **RLS em todas as tabelas** por `empresa_id` (via `membros`).
  - **Views do funcionário** sem colunas de custo/taxa.
  - **Triggers de auditoria** em `ordens_servico`, `despesas`, `catalogo_itens`.
  - Regra de dia fechado (só patrão altera) e preço do funcionário sempre do catálogo.
  - **Seed** da oficina de moto.
  - **Login real** (Supabase Auth e-mail/senha); `src/lib/dados/` passa a ler do Supabase sob RLS.
  - Testes: **isolamento entre duas empresas** e **funcionário sem custo**.
- **Pronto quando**:
  - Login real funciona; as telas do patrão já leem dados reais do seed.
  - Os testes de isolamento e de funcionário-sem-custo passam.

## Fase 7 — Cadastro da empresa e onboarding real
- **Branch**: `fase-07-onboarding-real`
- **Objetivo**: criar empresa e configurar o catálogo/estoque/custos de verdade.
- **Fonte dos dados**: `real`.
- **Itens**:
  - Criar conta → criar `empresa` → vincular `membro` patrão.
  - Carregar **catálogo modelo do segmento** na criação (mantido pelo admin; empresas existentes não mudam depois).
  - Salvar catálogo (custo/preço), estoque atual/mínimo, custos fixos e taxas.
  - Upload de foto da tabela/nota para o **Supabase Storage** (interpretação fica para a Fase 8).
  - Estado de progresso do onboarding persistido; libera o uso pleno ao concluir.
- **Pronto quando**:
  - Uma empresa nova sai do cadastro com catálogo, estoque, custos e taxas gravados e aparece nas telas.

## Fase 8 — Pipeline de voz e gravação de OS
- **Branch**: `fase-08-voz`
- **Objetivo**: o coração do produto — falar uma frase e salvar uma OS de verdade.
- **Fonte dos dados**: `real` (Gemini + Supabase).
- **Itens**:
  - Gravação no navegador (MediaRecorder, 60 s) → rota de servidor com token.
  - Chamada ao **Gemini 3.1 Flash-Lite** com contexto (catálogo, placas/clientes recentes, papel) → **JSON em esquema fixo**.
  - **Validação no servidor** com Zod: itens existem no catálogo, placa válida, **cálculo de total/custo/taxa/lucro no servidor**, funcionário ignora valor falado.
  - **Cartão de confirmação** real; funcionário sem custo/lucro; correção por toque ou nova fala.
  - **Confirmar** grava OS + itens + baixa de estoque + auditoria em **uma transação**; alerta de estoque mínimo; áudio apagado; registro em `uso_ia`.
  - Caminho **digitando** equivalente; retry 1 vez e fallback para digitar.
  - Testes: **cálculo de lucro/taxa** e **validação do JSON da IA**.
- **Pronto quando**:
  - Patrão e funcionário registram OS por voz; a OS salva, baixa estoque e aparece no Painel/Pátio.
  - Resposta ≤ 4 s; testes de cálculo e de schema passam.

## Fase 9 — Operação: OS, pátio, estoque, despesas, painel, fechamento
- **Branch**: `fase-09-operacao`
- **Objetivo**: ligar o resto da operação do patrão aos dados reais.
- **Fonte dos dados**: `real`.
- **Itens**:
  - **OS e pátio** com fluxo de status (Orçamento → Em serviço → Pronto → Entregue; Cancelado; Aguardando peça); pagamento na entrega.
  - **Histórico por placa/cliente** real, com lembrete de retorno.
  - **Estoque/catálogo**: compra por voz, atualização de custo, ajuste manual com motivo e autor.
  - **Despesas** (só patrão) por voz/manual com categoria.
  - **Painel** com cálculos reais: lucro do período, Contas do mês, alertas, ranking, gráfico.
  - **Fechamento do dia**: comparação por forma de pagamento, agrupado por autor, fechar o dia; depois só patrão altera.
- **Pronto quando**:
  - Um dia de operação completo roda fim a fim (abrir OS, atender, pagar, lançar despesa, conferir painel, fechar o caixa) com números corretos.

## Fase 10 — Equipe e permissões do funcionário
- **Branch**: `fase-10-equipe`
- **Objetivo**: convidar funcionário e aplicar as permissões de verdade.
- **Fonte dos dados**: `real`.
- **Itens**:
  - Convite por link, criação de senha e vínculo à empresa como funcionário.
  - Permissões de funcionário aplicadas (views sem custo, avisar falta, corrigir só os próprios até o fechamento, não excluir).
  - Desativar funcionário bloqueia o acesso na hora; lançamentos antigos mantêm o autor.
  - Tela do patrão com lançamentos por funcionário.
- **Pronto quando**:
  - Um funcionário convidado entra, registra OS e não acessa nada de dinheiro; desativar corta o acesso.

## Fase 11 — Cobrança (Stripe)
- **Branch**: `fase-11-stripe`
- **Objetivo**: assinatura real e controle de acesso por pagamento.
- **Fonte dos dados**: `real` (Stripe).
- **Itens**:
  - Produtos Básico/PRO/funcionário adicional; **Checkout**; **portal do cliente**.
  - Básico→PRO ao convidar o 1º funcionário; quantidade de adicionais sobe/desce com ativar/desativar.
  - **Webhooks** com verificação de assinatura (criada/alterada/cancelada, fatura paga, pagamento falhou).
  - **Régua de cobrança**: aviso → lembrete 3 dias → só leitura 7 dias → bloqueio 15; pagou, volta na hora.
  - Assinatura só no cartão (Pix fora, por limitação do Stripe BR).
  - Teste: **webhooks do Stripe**.
- **Pronto quando**:
  - Assinar ativa a empresa; falha de pagamento leva a só leitura/bloqueio; pagar reativa. Teste de webhook passa.

## Fase 12 — Lembretes, push e tarefas agendadas
- **Branch**: `fase-12-notificacoes`
- **Objetivo**: avisos automáticos funcionando.
- **Fonte dos dados**: `real` (web-push + Vercel Cron).
- **Itens**:
  - Lembretes por voz com data/hora; inscrição de push (VAPID).
  - **Vercel Cron**: lembretes a cada 5 min; 18h resumo do dia + "Feche o caixa"; diário retorno de cliente + régua de cobrança.
  - Notificações automáticas: estoque no mínimo, retorno de cliente, resumo do dia.
- **Pronto quando**:
  - Um lembrete criado dispara push no horário; os crons rodam e geram os avisos.

## Fase 13 — Painel admin real
- **Branch**: `fase-13-admin-real`
- **Objetivo**: admin operando o SaaS com dados reais.
- **Fonte dos dados**: `real`.
- **Itens**:
  - Visão geral (receita recorrente, empresas por status, custo de IA vs receita, empresas em risco).
  - Empresas (lista/ficha/ações: estender teste, cupom, trocar plano, bloquear, reenviar convite).
  - **Modo suporte** (somente leitura, registrado com data/hora/motivo).
  - Planos e preços; cupons; preço de fundador.
  - Modelos de segmento e vocabulário da IA.
  - Monitor da IA (custo por empresa, taxa de correção, frases que falharam).
  - Suporte (chamados) e Comunicados (segmentados).
- **Pronto quando**:
  - O admin consegue ver o SaaS, abrir a ficha de uma empresa, entrar em modo suporte (registrado) e emitir um comunicado.

---

# BLOCO 3 — Lançamento

## Fase 14 — Endurecimento e deploy produtivo
- **Branch**: `fase-14-deploy-producao`
- **Objetivo**: ambiente de produção pronto para a primeira oficina pagante.
- **Fonte dos dados**: `real` (produção).
- **Itens**:
  - Supabase **Pro** (backup diário); variáveis de ambiente de produção na Vercel.
  - Domínio **kambio.com.br** no app e no Resend (domínio verificado); e-mails do sistema (boas-vindas, convite, recuperação, cobrança) via Resend/React Email.
  - LGPD: termos de uso e política de privacidade (incluindo que o áudio passa pelo Google); exportar/excluir dados de uma empresa.
  - PWA revisada (instalação, ícones, offline mínimo da casca).
  - **Vistoria geral**: rodar a Portaria de Vistoria sobre o sistema inteiro, não só a fase — isolamento com duas empresas em produção, funcionário sem custo, Lighthouse, revisão de segredos, revisão de erros no log da Vercel.
- **Pronto quando**:
  - Uma oficina real assina, configura, opera e fecha o dia em produção, no domínio final, com e-mails chegando e backup ativo.

> **Marco 2 — MVP produtivo.** Fim do Bloco 3: pronto para o piloto (10 oficinas com preço de fundador), acompanhando taxa de correção do cartão e fechamentos por semana.

---

## Resumo das fases

| Fase | Branch | Entrega | Dados |
| --- | --- | --- | --- |
| 0 ✅ | `fase-00-setup` | Projeto + identidade visual + PWA na Vercel | — |
| 1 ✅ | `fase-01-design-system` | Componentes + navegação por perfil | fictício |
| 2 | `fase-02-front-patrao` | Telas do patrão | fictício |
| 3 | `fase-03-front-funcionario` | Telas do funcionário (sem dinheiro) | fictício |
| 4 | `fase-04-front-onboarding` | Onboarding + login/convite | fictício |
| 5 | `fase-05-front-admin` | Painel admin | fictício |
| 6 | `fase-06-banco-rls` | Banco + RLS + views + login real | real |
| 7 | `fase-07-onboarding-real` | Cadastro da empresa + catálogo real | real |
| 8 | `fase-08-voz` | Pipeline de voz + OS transacional | real |
| 9 | `fase-09-operacao` | OS/pátio/estoque/despesas/painel/fechamento | real |
| 10 | `fase-10-equipe` | Convite + permissões do funcionário | real |
| 11 | `fase-11-stripe` | Assinatura + régua de cobrança | real |
| 12 | `fase-12-notificacoes` | Lembretes + push + crons | real |
| 13 | `fase-13-admin-real` | Painel admin operando o SaaS | real |
| 14 | `fase-14-deploy-producao` | Endurecimento + domínio + LGPD + go-live | real |

Cada linha só fecha depois da **Portaria de Vistoria** (segurança · desempenho · busca por erros) e de um deploy de preview verde.
