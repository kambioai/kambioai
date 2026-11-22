# Kambio – Especificação do produto

Nov 20, 2026 · @MILIONARIO

Documento único do Kambio, em duas partes. **Produto** (de Visão geral a Permissões) diz o que o app faz e como deve parecer. **Construção** (de Stack e integrações a Ordem de execução) diz com o que e como construir. No fim ficam Fora do MVP e Fontes.

## Visão geral

O sistema tem três perfis sobre a mesma base de dados: o patrão controla o negócio, o funcionário registra o trabalho e você (admin) administra o SaaS. O foco inicial são empresas que atendem veículos: oficina de moto, mecânica, funilaria e pintura, estética automotiva, auto elétrica, troca de óleo e borracharia.

| Perfil | Quem é | Onde usa | Para quê |
| --- | --- | --- | --- |
| Patrão | Dono da oficina | Web app no celular (instalado na tela inicial) e no computador | Registrar, acompanhar lucro, controlar estoque, caixa e equipe |
| Funcionário | Mecânico, funileiro, atendente | Web app no celular | Registrar serviços e vendas, atualizar ordens de serviço, consultar estoque |
| Admin | Você, dono do SaaS | Painel web no computador | Gerenciar assinantes, planos, cobrança, custo da IA e suporte |

**Conceitos que aparecem em todo o sistema**

- **Empresa:** cada oficina assinante. Os dados de uma empresa nunca aparecem para outra.
- **Cliente:** nome e telefone. Um cliente pode ter vários veículos.
- **Veículo:** identificado pela placa, com modelo, ano, cor e quilometragem. É a chave do histórico.
- **Catálogo:** produtos (têm estoque) e serviços (mão de obra), cada um com custo e preço de venda.
- **Ordem de serviço (OS):** o registro central. Junta veículo, cliente, itens do catálogo, peças compradas na hora, status e pagamento. Uma venda de balcão, sem veículo, é uma OS simples.
- **Custo avulso:** peça comprada na autopeças só para aquela OS, com o custo informado na hora.
- **Lançamento:** cada OS paga ou despesa. Todo lançamento guarda **autor, data, hora e origem (voz ou manual)**.

**Regras de produto que valem para tudo**

1. Voz primeiro, mas nada é salvo sem o usuário ver o cartão de confirmação.
2. Ninguém dita o que o sistema já sabe. Custo e preço vêm do catálogo; a pessoa só fala o que mudou.
3. Todo campo do cartão pode ser corrigido com um toque ou falando de novo.
4. Poucas telas: cada botão da navegação fixa abre uma tela só, sem submenus (seção Navegação e regras de interface).

## Identidade visual

O nome é **Kambio** (sempre com K maiúsculo): câmbio da marcha e câmbio do dinheiro. O nome é amplo para servir a outros nichos no futuro; a venda começa por oficinas, com páginas por nicho ("Kambio para oficinas"). A paleta é marinho e laranja: marinho passa a segurança de quem cuida de dinheiro, laranja dá a energia de oficina.

**Paleta**

| Papel | Cor | Onde aparece |
| --- | --- | --- |
| Principal | Marinho #0F2A4A | Cartão de lucro, botões principais, ícone, item ativo da navegação |
| Destaque | Laranja #E8590C | Botão Falar, barras de progresso, ponto do ícone. Nunca em texto pequeno |
| Fundo do app | #F3F5F8 | Fundo de todas as telas |
| Superfície | #FFFFFF | Cartões, listas, campos, barra de navegação |
| Texto | #0E1726 | Textos principais e números |
| Texto secundário | #556070 | Legendas, datas, textos de apoio |
| Linhas | #E2E6EC | Bordas e divisórias |
| Confirmado | Verde #0B7A4B | "Bateu" no fechamento, OS salva |
| Atenção | #B54708 sobre #FEF0E6 | Estoque baixo, diferença no caixa |
| Erro e prejuízo | #B42318 sobre #FEF3F2 | Venda com prejuízo, falha. Vermelho nunca é cor de marca |

**Tipografia**

- Space Grotesk (peso 700) em títulos de tela e números de dinheiro.
- Inter (400, 500, 600) em todo o resto.
- Tamanhos: número principal do painel 40 px, título de tela 24 px, texto 16 px, legenda 13 px. Nada menor que 13 px.

**Componentes**

- **Botão principal:** fundo marinho, texto branco, 52 px de altura, cantos de 12 px.
- **Botão secundário:** fundo branco, borda #E2E6EC, texto marinho.
- **Botão Falar:** círculo laranja de 64 px com ícone de microfone branco, no centro da navegação.
- **Cartões:** brancos, cantos de 16 px, borda #E2E6EC, sem sombra pesada. O cartão de lucro do painel é marinho com texto branco.
- **Ícones:** biblioteca Lucide, traço de 2 px. Sem emoji.
- **Logo:** quadrado marinho de cantos arredondados com um "K" branco em Space Grotesk e um ponto laranja no canto. Ao lado, o nome Kambio em Space Grotesk 700.
- **Só tema claro no MVP.**

Referências visuais: [tela de teste de nome e cores](https://claude.ai/artifact/XjiGDdapDqZtkfNEZPZM74) e [protótipo do app](https://claude.ai/artifact/HnKW3D3c1qrrBe914ETaVJ). O protótipo é anterior a este documento e ainda tem telas que saíram (A receber, Mais). Em qualquer diferença, vale este documento.

## Navegação e regras de interface

Cada botão da navegação abre uma tela só. Não existe botão que abre um menu com outras seções dentro. No celular a navegação é uma barra fixa no rodapé; no computador vira uma barra lateral fixa à esquerda, com os mesmos botões na mesma ordem.

| Perfil | Botões fixos, nesta ordem | Fora da barra |
| --- | --- | --- |
| Patrão | Painel · Estoque · **Falar** (centro) · Fechamento · Equipe | Ícone da conta no topo: abre a tela Conta (assinatura, dados da empresa, sair) |
| Funcionário | Pátio · **Falar** (centro) · Estoque | Ícone da conta no topo: abre a tela Conta (meus lançamentos, sair) |
| Admin (computador) | Visão geral · Empresas · Planos · Uso da IA · Suporte · Comunicados | — |

Onde ficam as funções do patrão que não têm botão próprio:

- **Pátio e alertas:** dentro do Painel, logo abaixo do lucro.
- **Custos fixos e taxas:** botão "Editar custos" no cartão Contas do mês, no Painel.
- **Histórico do veículo:** busca por placa no topo do Painel.
- **Despesas, lembretes e perguntas:** pelo botão Falar.

**Regras para o app ser fácil de usar**

1. Sem menu hambúrguer, sem botão "Mais", sem submenus e sem abas escondidas.
2. No máximo um nível: tela → detalhe (abre por cima, como uma folha) → volta. O botão Voltar está sempre visível.
3. O botão Falar aparece em todas as telas do patrão e do funcionário.
4. Uma ação principal por tela, em destaque. As outras ficam discretas.
5. Área de toque de no mínimo 48 px. Campos com texto de 16 px (evita o zoom automático do iPhone).
6. Linguagem de dono de oficina: "lucro", "entrou", "saiu", "faltam R$ X". Nada de "receita líquida", "DRE" ou "margem de contribuição".
7. Dinheiro sempre no formato R$ 1.234,56, com os números importantes grandes.
8. Nada é salvo sem o cartão de confirmação. Depois de salvar, o aviso no topo tem "Desfazer" por 5 segundos.
9. Tela vazia sempre diz o que fazer ("Toque em Falar pra registrar sua primeira OS").
10. Erro em português simples, dizendo o que fazer, sem código técnico.
11. Enquanto carrega, aparece o esqueleto da tela, nunca uma tela branca.
12. Celular primeiro: tudo tem que funcionar numa tela de 360 px de largura.
13. Contraste de texto de pelo menos 4,5:1 e rótulo de acessibilidade em todo botão que só tem ícone.

Como o app será construído está na parte de Construção, a partir de Stack e integrações.

## Planos

São dois planos com as mesmas funções. A diferença é só quem pode usar: no Básico, só o patrão; no PRO, o patrão e a equipe.

| Plano | Para quem | Preço por mês | Quem usa |
| --- | --- | --- | --- |
| Básico | Patrão que trabalha sozinho | R$ 129,90 | Só o patrão |
| PRO | Patrão com funcionários | R$ 179,90 | Patrão + 2 funcionários inclusos |
| Funcionário adicional | PRO, a partir do 3º funcionário | + R$ 29,90 cada | Sem limite de funcionários |

Exemplo: uma oficina no PRO com 4 funcionários paga R$ 179,90 + 2 × R$ 29,90 = R$ 239,70 por mês.

- **Do Básico para o PRO:** acontece quando o patrão convida o primeiro funcionário. A diferença é cobrada proporcionalmente na próxima fatura.
- **Funcionário extra:** o valor entra quando o convite é aceito e sai na fatura seguinte à desativação.

## App do patrão

O patrão vê e controla tudo da empresa. São 13 funções, na ordem em que ele usa.

### 1. Cadastro e configuração inicial

Deixa o sistema pronto pra primeira venda. **Empresa, catálogo e custos/taxas são obrigatórios** no onboarding (sem eles o registro de venda não calcula certo). **Só o estoque pode ser feito depois** — inclusive por um funcionário, já que informar quantidade não revela custo.

1. Cria a conta com nome, celular, e-mail e senha.&#32;
2. Informa os dados da empresa: nome, cidade e segmento (oficina de moto, mecânica, funilaria, estética, troca de óleo, borracharia…). **(obrigatório)**
3. O sistema carrega um **catálogo modelo do segmento**, já com serviços e peças comuns. O patrão só ajusta custo e preço, apaga o que não usa e **adiciona** os itens que faltam. **(obrigatório)**
4. Completa o catálogo **digitando** os itens (e, a partir da Fase 8, também **falando** — "pneu 90/90, paguei 100, vendo a 150, tenho 6" — com a IA montando e ele confirmando).
5. Informa o estoque atual e o mínimo de cada produto, para o alerta de reposição. **(pode fazer depois; o funcionário pode completar a contagem)**
6. Cadastra os custos fixos do mês (funcionários, aluguel, contador, luz, internet) e as taxas da maquininha (débito e crédito em até 12x, Pix e dinheiro sem taxa). **(obrigatório)**
7. Convida funcionários, se tiver (função 11).
8. O sistema mostra a frase de exemplo da primeira venda e abre o botão Falar.

### 2. Registro por voz

É o centro do produto: uma frase vira uma OS completa, com estoque, lucro e pagamento.

1. O patrão toca no botão verde **Falar** e diz, por exemplo: "Gol placa ABC1D23, troquei pastilha e fiz alinhamento, a pastilha comprei por 80 na autopeças, pagou 350 no crédito."
2. A IA transcreve e interpreta a frase:
   - **Veículo:** busca a placa. Se já existe, puxa modelo e cliente. Se é nova, cria o veículo e pede o modelo e o nome do cliente no cartão.
   - **Itens:** reconhece serviços e peças do catálogo, com quantidade.
   - **Custo avulso:** "comprei por 80" vira o custo daquela peça só nesta OS.
   - **Valor:** se ele falou um total diferente da soma do catálogo, usa o valor falado e mostra a diferença como desconto ou acréscimo.
   - **Pagamento:** Pix, dinheiro, débito, crédito (com parcelas)&#32;
3. Aparece o **cartão de confirmação**: veículo, cliente, itens, quantidades, total, custo das peças, taxa da maquininha e **lucro da OS**. O que faltou fica destacado (por exemplo, "Como pagou?").
4. O patrão corrige com um toque (mais, menos, trocar item, trocar pagamento) ou tocando em Corrigir e falando de novo.
5. Se o lucro der negativo, o cartão mostra o **alerta de prejuízo** antes de salvar.
6. Se um item falado não existe no catálogo, o cartão oferece "Cadastrar agora" com custo e preço.
7. Ao tocar em **Confirmar**, o sistema:
   - salva a OS como paga, com autor, data, hora e origem "voz";
   - baixa o estoque das peças do catálogo;
   - atualiza o painel e as contas do mês;
   - se algum produto chegou no mínimo, dispara o alerta de estoque;
   - grava o serviço no histórico do veículo.
8. Um aviso no topo confirma: "OS salva. Lucro de R$ X."

&#91;embedded content: registro por voz · da fala à OS salva\]

Se a pessoa corrige, o cartão volta atualizado. Só depois de Confirmar a OS é salva, e os quatro efeitos acontecem juntos.

Tudo isso também funciona digitando, para quando não dá pra falar.

### 3. Ordens de serviço e pátio

Para serviços que levam horas ou dias, como funilaria ou retífica, a OS nasce na entrada do veículo e é paga na entrega.

1. Na chegada, ele fala: "Entrou o Civic placa XYZ9K88, do Marcos, barulho na suspensão, 82 mil km."
2. O sistema abre a OS com status **Orçamento** e a coloca na lista **Pátio**, na tela inicial.
3. Ele monta o orçamento falando os serviços e peças, e gera um link ou PDF pra mandar pro cliente.
4. Cliente aprovou: um toque muda o status para **Em serviço**.
5. Durante o serviço, ele adiciona itens ("coloquei mais um amortecedor") e pode marcar **Aguardando peça**.
6. Terminou: status **Pronto**.
7. Na entrega, ele registra o pagamento. A OS vira lançamento, baixa o estoque e sai do pátio.

Status: Orçamento → Em serviço → Pronto → Entregue. Um orçamento recusado vai para Cancelado e não entra no faturamento.

### 4. Histórico por veículo e cliente

A busca por placa mostra tudo o que já foi feito naquele veículo.

1. Na busca, ele digita ou fala a placa ("ABC1D23") ou o nome do cliente.
2. Abre a ficha do veículo: modelo, cliente, telefone, quilometragem e a linha do tempo de OS, com data, serviços, peças e valor.
3. A ficha mostra o total que o cliente já gastou e quando foi a última visita.
4. Serviços com retorno (troca de óleo, revisão, higienização do ar) geram um **lembrete de retorno** na data configurada no catálogo, por exemplo 4 meses depois. O lembrete aparece nos alertas: "O Gol ABC1D23 trocou óleo há 4 meses, chame o cliente."

### 5. Painel (tela Início)

Responde em segundos: "quanto eu ganhei?"

1. Filtros no topo: Hoje, Ontem, 7 dias, Mês ou um período escolhido.
2. Cartão principal: **lucro do período**, já descontando peças, taxas e despesas. Abaixo, faturamento, custo de peças e taxas, despesas e número de OS.
3. **Contas do mês:** barra de quanto do custo fixo já foi coberto pelo lucro ("Faltam R$ 1.200 pra pagar as contas do mês"). Quando passa de 100%, mostra o lucro limpo.
4. **Alertas:** fechar o caixa, estoque baixo, lembretes de retorno, peça em falta avisada por funcionário.
5. **Pátio:** veículos com OS aberta e o status de cada um.
6. Gráfico de lucro por dia e ranking dos serviços que mais dão lucro.
7. Últimos lançamentos, cada um com o nome de quem lançou.

### 6. Estoque e catálogo

Mostra o que tem, quanto custa e quanto dá de lucro cada item.

1. Duas abas: Produtos e Serviços. Cada item mostra custo, preço, lucro em reais e em %, e quantidade em estoque.
2. Filtro "Só estoque baixo" e busca por nome.
3. **Entrada de compra por voz:** "comprei 10 óleos a 22 cada". O sistema soma 10 ao estoque, registra a saída de dinheiro e atualiza o custo do item, se mudou.
4. **Atualização de custo:** "o pneu 90/90 subiu pra 110". O sistema troca o custo e mostra quanto caiu a margem, sugerindo revisar o preço.
5. Ajuste manual com mais e menos (perda, uso interno, contagem). Todo ajuste pede o motivo e guarda o autor.

### 7. Despesas

Gastos variáveis do dia a dia que não são custo fixo.

1. Ele fala: "paguei 45 de estopa e produto de limpeza."
2. O cartão mostra descrição, valor e categoria sugerida (limpeza, frete, ferramenta, alimentação, outros).
3. Confirmou: a despesa entra no lucro do dia e aparece nos lançamentos.

### 8. Fechamento do dia

Garante que os números do dia estão certos.

1. No fim do expediente, o alerta "Feche o caixa de hoje" leva à tela de fechamento.
2. Para cada forma de pagamento, o sistema mostra quanto foi registrado. Ele informa quanto entrou de verdade (gaveta, extrato do Pix, relatório da maquininha).
3. O sistema compara linha a linha: **Bateu**, **Sobrou R$ X** (venda sem registrar?) ou **Faltam R$ X** (troco ou erro).
4. Se sobrou, o botão "Registrar venda esquecida" abre o Falar.
5. A tela lista os lançamentos do dia **agrupados por autor**. O patrão pode abrir, corrigir ou excluir qualquer um; toda mudança fica no histórico de alterações.
6. Ele toca em **Fechar o dia**. O sistema mostra o resumo: faturamento, lucro e diferenças.
7. Depois do fechamento, só o patrão pode mexer nos lançamentos daquele dia.

### 9. Assistente de perguntas

O mesmo botão Falar responde perguntas sobre o negócio.

- "Quanto lucrei essa semana?"
- "Quantos pneus 90/90 eu tenho?"
- "Qual serviço mais deu lucro esse mês?"

O sistema responde na tela com o número e um link para a tela de onde ele veio.

### 10. Lembretes e notificações

1. Ele fala: "me lembra de comprar óleo segunda de manhã" ou "reunião com o fornecedor amanhã às 10".
2. O sistema cria o lembrete com data e hora e manda uma notificação push no horário.
3. Notificações automáticas: estoque no mínimo, lembrete de retorno de cliente e resumo do dia no fim do expediente.

### 11. Funcionários

O patrão decide quem entra e acompanha tudo o que cada um lança.

1. Na tela Equipe, ele toca em **Convidar** e informa nome e celular.
2. O sistema gera um link de convite. Ele compartilha por onde quiser.
3. O funcionário abre o link, cria a senha e já entra vinculado à empresa, com as permissões de funcionário (seção 5).
4. Cada funcionário tem uma tela com os lançamentos dele, filtrável por período.
5. **Desativar** bloqueia o acesso na hora. Os lançamentos antigos continuam com o nome dele.

**Plano e cobrança:** no Básico, o botão Convidar oferece a mudança para o PRO. No PRO, a partir do 3º funcionário, o app mostra o acréscimo de R$ 29,90 por mês e pede confirmação antes de enviar o convite.

### 12. Custos fixos e taxas

1. Lista de custos fixos mensais, com valor editável e botão para adicionar ou remover.
2. Taxas da maquininha por forma de pagamento, inclusive crédito parcelado.
3. Qualquer mudança vale para os lançamentos novos. Os antigos mantêm a taxa da época.

### 13. Conta, assinatura e histórico de alterações

1. **Assinatura:** plano atual, próximo vencimento, forma de pagamento, trocar cartão, cancelar.
2. **Histórico de alterações:** toda edição ou exclusão de lançamento, ajuste de estoque ou mudança de preço mostra quem fez, quando, o valor antes e o valor depois.
3. **Exportar dados:** planilha com lançamentos do período, para o contador.

## App do funcionário

O funcionário registra o trabalho, mas não vê o dinheiro do negócio: nada de custo, lucro, painel financeiro ou custos fixos. A barra do rodapé dele tem só três itens: **Pátio**, **Falar** e **Estoque**, mais o ícone da conta no topo.

### 1. Primeiro acesso

1. Ele recebe o link de convite do patrão.
2. Abre o link, confere o nome da empresa e cria a senha.
3. Entra direto no Pátio. Na primeira vez, o app mostra uma frase de exemplo e o botão Falar.

### 2. Registro por voz

Mesmo fluxo do patrão, com três diferenças.

1. Ele toca em **Falar** e diz: "Moto placa DEF4G56, troca de relação e pastilha, pagou 320 no Pix."
2. O cartão mostra veículo, cliente, itens, quantidades, **preço de venda** e total, porque ele precisa dizer o valor ao cliente.
3. Diferenças em relação ao patrão:
   - **Não aparece custo nem lucro** no cartão.
   - Se ele comprou uma peça na autopeças, pode informar o custo dela ("a peça saiu 80"), porque foi ele que pagou. O lucro dessa OS continua visível só para o patrão.
   - Ele não muda preço: o cartão sempre usa o preço do catálogo, mesmo que ele fale outro valor.
4. Ao confirmar, a OS é salva com o **nome dele como autor**, a hora e a origem (voz ou manual). O estoque baixa na hora.
5. O lançamento aparece no painel e no fechamento do patrão com o nome dele.

### 3. Pátio e ordens de serviço

A tela inicial dele é o trabalho do dia.

1. O Pátio lista os veículos com OS aberta: placa, modelo, serviço e status.
2. Ele pode abrir uma OS nova na entrada do veículo, falando ou digitando.
3. Dentro da OS, ele adiciona serviços e peças e muda o status (Em serviço, Aguardando peça, Pronto).
4. Na entrega, registra a forma de pagamento.

### 4. Consulta de estoque

1. Ele busca o item por nome ou fala: "tem pastilha da Titan?"
2. A tela mostra **só a quantidade e o preço de venda**, sem custo.
3. Se faltou um item, ele toca em **Avisar falta** ou fala "acabou o óleo 20W50". O patrão recebe o alerta com o nome de quem avisou.
4. Ele não ajusta o estoque na mão. Só as OS dele baixam o estoque.

### 5. Histórico do veículo

1. Na busca por placa, ele vê os serviços feitos naquele veículo, com datas, peças trocadas e quilometragem.
2. Isso ajuda no diagnóstico ("a relação foi trocada há 2 meses, está na garantia").
3. Ele não vê o total gasto pelo cliente nem o lucro das OS.

### 6. Meus lançamentos

1. Lista do que ele lançou hoje e nos últimos dias.
2. Ele pode **corrigir os próprios lançamentos até o patrão fechar o dia**. Depois disso, só o patrão mexe.
3. Ele **não exclui** lançamentos. Se algo foi lançado errado, ele corrige ou avisa o patrão.
4. Toda correção vai para o histórico de alterações, com antes e depois.

## Painel admin (dono do SaaS)

O admin não opera oficina nenhuma: ele cuida de quem paga, de quanto custa a IA e de quem está em risco de cancelar. É um painel web, pensado para o computador.

### 1. Visão geral do negócio

A primeira tela responde "como está o SaaS hoje?".

- **Receita recorrente do mês** e variação em relação ao mês anterior.
- Empresas** ativas, atrasadas e canceladas**, e novas na semana.
- **Custo da IA no mês** (transcrição e interpretação) contra a receita, por empresa e no total.
- **Empresas em risco:** sem lançamento há vários dias ou com pagamento atrasado.

### 2. Empresas assinantes

1. Lista com busca e filtros por status ( ativa, atrasada, cancelada, bloqueada), plano, segmento e cidade.
2. Cada linha mostra plano, número de usuários, último uso e lançamentos na semana.
3. A ficha da empresa mostra:
   - dados de contato e do dono;
   - usuários (patrão e funcionários), com último acesso de cada um;
   - uso: OS por dia, % lançado por voz, fechamentos feitos, minutos de voz;
   - histórico de pagamentos;
   - anotações internas ("pediu treinamento", "indicou outra oficina").
4. Ações na ficha: estender o teste, aplicar cupom, trocar de plano, bloquear, desbloquear e reenviar o convite do dono.
5. **Modo suporte:** o admin vê as telas da empresa como o patrão vê, só para leitura, para resolver um chamado. Cada acesso fica registrado com data, hora e motivo, e precisa estar previsto nos termos de uso (LGPD).

### 3. Planos e preços

1. Cria e edita planos: nome, preço mensal, funcionários inclusos, preço por funcionário adicional e limite de minutos de voz. Os planos atuais estão na seção Planos.
2. Cria cupons e o preço de fundador para as primeiras empresas.
3. Mudança de preço vale só para novas assinaturas, a menos que o admin escolha aplicar às atuais com aviso.

### 4. Cobrança e inadimplência

1. A cobrança recorrente roda no Stripe, no cartão de crédito (detalhes em Cobrança e e-mails).
2. O painel mostra o status de cada cobrança: paga, pendente, falhou, estornada.
3. **Régua de cobrança** configurável. Sugestão: aviso no dia do vencimento, lembrete 3 dias depois, modo só leitura depois de 7 dias, bloqueio depois de 15. No modo só leitura a oficina ainda vê os dados dela, mas não lança.
4. Pagou: o acesso volta na hora, sem ação manual.

### 5. Modelos de segmento e vocabulário

Isso faz o sistema parecer feito para cada ramo.

1. O admin mantém um **catálogo modelo por segmento** (oficina de moto, mecânica, funilaria, estética, troca de óleo, borracharia), carregado no cadastro da empresa.
2. Mantém o **vocabulário** que a IA usa para entender cada ramo: sinônimos e gírias ("relação" e "kit", "pastilha" e "freio", "polimento" e "espelhamento").
3. Mudou um modelo: vale para empresas novas. As que já existem não são alteradas.

### 6. Monitor da IA

Mostra se a voz está funcionando e quanto ela custa.

1. **Custo por empresa e por lançamento**, comparado com o preço do plano. Uma empresa que custa mais em IA do que paga aparece em destaque.
2. **Taxa de correção:** em quantos cartões o usuário precisou mudar algo antes de confirmar. É a principal métrica de qualidade da IA.
3. **Frases que falharam:** exemplos sem dados pessoais das frases que a IA não entendeu, para ajustar o vocabulário e as instruções do modelo.
4. Limites de uso por plano e alerta quando uma empresa passa do limite.

### 7. Suporte e comunicados

1. Caixa de chamados abertos pelos usuários dentro do app, com status (aberto, respondendo, resolvido).
2. **Comunicados:** o admin escreve um aviso (nova função, manutenção) e escolhe quem recebe: todos, um segmento ou uma empresa. Aparece como notificação no app.

### 8. Métricas de produto

- **Ativação:** empresas que registraram a primeira OS nas primeiras 24 horas.
- **Uso semanal:** empresas com lançamento em pelo menos 3 dias da semana.
- **% de lançamentos por voz** contra manuais.
- **Fechamentos do dia por semana**, o sinal de hábito.
- **Cancelamentos e motivo** informado na saída.

### 9. Segurança e dados

1. Registro de todas as ações do admin.
2. Backup automático diário.
3. Exportar ou apagar os dados de uma empresa quando ela pedir (LGPD).
4. Usuários do painel admin com perfis próprios, para quando entrar alguém de suporte além de você.

## Permissões por perfil

O funcionário lança e consulta. Só o patrão vê dinheiro e muda regras. O admin só entra nos dados de uma empresa em modo suporte.

| Função | Patrão | Funcionário | Admin |
| --- | --- | --- | --- |
| Registrar OS, venda ou despesa por voz | Sim | Sim (só OS e venda) | Não |
| Abrir OS e mudar status | Sim | Sim | Não |
| Ver preço de venda | Sim | Sim | Modo suporte |
| Ver custo e lucro | Sim | Não | Modo suporte |
| Informar custo de peça comprada na hora | Sim | Sim | Não |
| Cadastrar e editar catálogo | Sim | Não | Modelos por segmento |
| Consultar estoque | Sim (com custo) | Sim (sem custo) | Modo suporte |
| Ajustar estoque na mão | Sim | Não, só avisar falta | Não |
| Painel financeiro e contas do mês | Sim | Não | Modo suporte |
| Fechamento do dia | Sim | Não | Não |
| Corrigir lançamento | Qualquer um | Só os próprios, até o fechamento | Não |
| Excluir lançamento | Sim | Não | Não |
| Convidar e desativar funcionários | Sim | Não | Não |
| Custos fixos e taxas | Sim | Não | Não |
| Assinatura da empresa | Sim | Não | Sim (planos, cupons, bloqueio) |
| Histórico de alterações | Sim | Só os próprios | Modo suporte |

Toda linha marcada "Modo suporte" é só leitura e fica registrada com data, hora e motivo.

## Stack e integrações

O Kambio é escrito em **TypeScript** do início ao fim, em **Next.js** publicado na **Vercel**, com **Supabase** como banco e login. A IA de voz é o **Gemini 3.1 Flash-Lite**, a cobrança é no **Stripe** e os e-mails saem pelo **Resend**. Nota fiscal fica fora por enquanto.

**Linguagem e bibliotecas**

| Parte | Escolha |
| --- | --- |
| Linguagem | TypeScript em modo estrito, no app e no servidor |
| Framework | Next.js (App Router) com React; rotas de servidor para IA, Stripe e e-mails |
| App instalável | PWA: manifesto, ícone e service worker, para instalar na tela inicial do celular |
| Estilo | Tailwind CSS com as cores e fontes da Identidade visual como tokens |
| Componentes | shadcn/ui, ajustado à Identidade visual |
| Ícones | Lucide |
| Gráficos | Recharts |
| Formulários e validação | React Hook Form e Zod. O Zod também valida a resposta da IA |
| Banco | Postgres do Supabase, com migrações em SQL versionadas no repositório (Supabase CLI) |
| E-mails | React Email para os modelos, enviados pelo Resend |

**Serviços externos**

| Serviço | Para quê | Variáveis de ambiente | Custo |
| --- | --- | --- | --- |
| Vercel Pro | Hospedar o app, rotas de servidor e tarefas agendadas (Vercel Cron) | — | Já pago |
| Supabase | Banco, login (e-mail e senha) e armazenamento de arquivos | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Grátis no desenvolvimento; Pro US$ 25/mês a partir do 1º cliente |
| Gemini 3.1 Flash-Lite (SDK `@google/genai`) | Ouvir o áudio e devolver a OS em JSON | `GEMINI_API_KEY` | \~US$ 0,002 por registro |
| Stripe Billing | Assinaturas, funcionário adicional, portal do cliente, avisos de pagamento | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 3,99% + R$ 0,39 por cobrança + 0,7% do Billing |
| Resend | E-mails do sistema | `RESEND_API_KEY` | Plano gratuito no início |
| Web Push (biblioteca `web-push`) | Alertas, lembretes e resumo do dia no celular | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Sem custo |
| Domínio | kambio.com.br (app e e-mails) | — | \~R$ 40/ano |

**Tarefas agendadas (Vercel Cron)**

- A cada 5 minutos: enviar lembretes vencidos.
- Fim do expediente (18h, horário de Brasília): resumo do dia e aviso "Feche o caixa".
- Todo dia: alertas de retorno de cliente (troca de óleo, revisão) e régua de cobrança.

O Supabase gratuito não serve para cliente pagante: o projeto pausa depois de uma semana sem uso e não tem backup automático. Falta confirmar se o domínio kambio.com.br está livre.

## Arquitetura

&#91;embedded content: arquitetura do Kambio · app, servidor e 4 serviços\]

As chaves da IA, do Stripe e do Resend ficam só no servidor. O app lê dados direto do Supabase para montar as telas, mas cada leitura passa pelo isolamento por empresa (Banco de dados).

## Banco de dados

Toda tabela de dados de oficina tem a coluna `empresa_id`, e o Supabase só entrega a uma pessoa as linhas da empresa dela (Row Level Security). Isso vale desde a primeira migração: corrigir depois é caro e arriscado. Valores em dinheiro são guardados em centavos (números inteiros) e datas no fuso America/Sao\_Paulo.

| Tabela | O que guarda | Campos principais |
| --- | --- | --- |
| `empresas` | Cada oficina assinante | nome, segmento, cidade, plano, status da assinatura, stripe\_customer\_id |
| `membros` | Quem acessa cada empresa | usuario\_id, empresa\_id, papel (patrão ou funcionário), ativo |
| `clientes` | Clientes da oficina | nome, telefone |
| `veiculos` | Veículos dos clientes | placa (única por empresa), modelo, ano, cor, km, cliente\_id |
| `catalogo_itens` | Produtos e serviços | nome, tipo, custo, preço, estoque, estoque\_minimo, sinônimos, dias\_para\_retorno |
| `ordens_servico` | Cada OS | veiculo\_id, cliente\_id, status, total, custo\_total, taxa, forma\_pagamento, parcelas, autor\_id, origem (voz ou manual), transcricao |
| `os_itens` | Itens de cada OS | os\_id, item\_id (vazio se avulso), descrição, quantidade, preço, custo |
| `movimentos_estoque` | Toda entrada e saída de estoque | item\_id, quantidade, motivo (venda, compra, ajuste), autor\_id |
| `despesas` | Gastos do dia a dia | descrição, valor, categoria, autor\_id |
| `custos_fixos` | Custos mensais | nome, valor |
| `taxas_pagamento` | Taxas da maquininha | forma, parcelas, percentual |
| `fechamentos` | Fechamento de cada dia | data, valores informados por forma, diferenças, autor\_id |
| `lembretes` | Lembretes e retornos de cliente | texto, data\_hora, veiculo\_id (se for retorno), enviado |
| `push_inscricoes` | Celulares que aceitaram notificação | usuario\_id, endpoint, chaves |
| `auditoria` | Histórico de alterações | tabela, registro\_id, antes, depois, autor\_id, data |
| `uso_ia` | Cada chamada à IA | empresa\_id, tokens de entrada e saída, custo, se o cartão foi corrigido |

**Regras que o banco garante sozinho, sem depender da tela:**

- Funcionário nunca lê `custo`, `custo_total`, `taxa`, `custos_fixos` nem `taxas_pagamento`. Ele acessa as OS e o catálogo por visões (views) sem essas colunas.
- OS paga, baixa de estoque e registro na auditoria acontecem numa única transação: ou tudo grava, ou nada grava.
- Toda alteração ou exclusão em `ordens_servico`, `despesas` e `catalogo_itens` gera uma linha em `auditoria` por gatilho (trigger).
- Lançamento de dia já fechado só pode ser alterado por quem tem papel de patrão.
- Preço lançado por funcionário é sempre o do catálogo.

## Pipeline de voz

A IA só interpreta a frase. Quem calcula dinheiro, valida placa e grava no banco é o servidor. Assim um erro da IA nunca vira um número errado salvo sem o usuário ver.

1. **Gravação:** o usuário toca no botão Falar. O navegador grava com a API de gravação de mídia, com limite de 60 segundos.
2. **Envio:** o áudio vai para uma rota de servidor na Vercel, junto com o token de login. Se o navegador gravar num formato que o Gemini não aceita, o servidor converte antes.
3. **Contexto:** o servidor monta o pedido para o Gemini com:
   - instruções fixas (o que extrair e em que formato);
   - o catálogo da empresa, com id, nome e sinônimos de cada item;
   - as placas e clientes recentes da empresa;
   - data e hora atuais e o papel de quem está falando.
4. **Interpretação:** o Gemini 3.1 Flash-Lite recebe o áudio e devolve um JSON num esquema fixo (exemplo abaixo). Nada de texto livre.
5. **Validação no servidor:**
   - confere o JSON com o esquema Zod;
   - confere se cada item existe no catálogo daquela empresa;
   - confere o formato da placa (Mercosul ou antigo);
   - calcula total, custo, taxa e lucro a partir do catálogo e das taxas, nunca dos números que a IA devolveu;
   - se quem falou é funcionário, ignora qualquer valor falado e usa o preço do catálogo;
   - marca os campos que faltam ou têm baixa confiança.
6. **Cartão:** o app mostra o cartão de confirmação, com os campos duvidosos destacados. Funcionário não recebe custo nem lucro.
7. **Confirmação:** ao tocar em Confirmar, o servidor grava OS, itens, baixa de estoque e auditoria numa transação só.
8. **Registro de uso:** cada chamada grava em `uso_ia` os tokens, o custo e se o usuário corrigiu algo no cartão.

**Formato da resposta da IA (exemplo para "Gol placa ABC1D23, troquei pastilha e fiz alinhamento, a pastilha comprei por 80, pagou 350 no crédito em 2 vezes"):**

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

Intenções que o esquema aceita: `os_paga`, `os_abrir`, `os_atualizar`, `despesa`, `compra_estoque`, `atualizar_custo`, `pergunta`, `lembrete`.

**Metas e limites**

- Resposta em até 4 segundos depois que a pessoa para de falar.
- Se a IA falhar ou demorar, o app tenta uma vez de novo e depois oferece digitar.
- O áudio é apagado depois de processado. Fica só a transcrição, ligada à OS.
- Limite de minutos de voz por plano, controlado pela tabela `uso_ia`.

## Custos

A IA custa cerca de 1 centavo por registro. Com 2 assinantes do Básico a infraestrutura está paga, e daqui pra frente cada assinante deixa entre R$ 110 e R$ 146 por mês. Os valores usam US$ 1 = R$ 5,50 e imposto de 6%, que é um chute até o contador confirmar a alíquota.

**Um registro por voz (Gemini 3.1 Flash-Lite)**

| Parte | Tokens | Preço por 1 milhão | Custo |
| --- | --- | --- | --- |
| Áudio de 20 segundos | 500 | US$ 0,50 | US$ 0,00025 |
| Instruções e catálogo | 4.000 | US$ 0,25 | US$ 0,00100 |
| Resposta em JSON | 300 | US$ 1,50 | US$ 0,00045 |
| **Total** |  |  | **US$ 0,0017 (\~R$ 0,01)** |

**IA por mês, contando correções e perguntas**

| Uso | Chamadas por mês | Custo |
| --- | --- | --- |
| Básico (só o patrão, \~15 registros por dia) | \~500 | \~R$ 4,70 |
| PRO (patrão + 2 funcionários) | \~1.500 | \~R$ 14,00 |
| Cada funcionário adicional | \~500 | \~R$ 4,70 |

**Quanto sobra de cada plano por mês**

|  | Básico | PRO | Funcionário adicional |
| --- | --- | --- | --- |
| Preço | R$ 129,90 | R$ 179,90 | R$ 29,90 |
| Stripe (3,99% + R$ 0,39) | − R$ 5,57 | − R$ 7,57 | − R$ 1,19 |
| Stripe Billing (0,7%) | − R$ 0,91 | − R$ 1,26 | − R$ 0,21 |
| Imposto (6%, a confirmar) | − R$ 7,79 | − R$ 10,79 | − R$ 1,79 |
| IA | − R$ 4,70 | − R$ 14,00 | − R$ 4,70 |
| **Sobra** | **R$ 110,92** | **R$ 146,28** | **R$ 22,00** |

Os R$ 0,39 do Stripe são cobrados uma vez por fatura, por isso não aparecem no funcionário adicional.

**Infraestrutura fixa por mês**

| Item | Custo |
| --- | --- |
| Supabase Pro (US$ 25) | \~R$ 137,50 |
| Domínio (\~R$ 40 por ano) | \~R$ 3,33 |
| Vercel | Já pago |
| Resend | R$ 0 no plano gratuito |
| **Total** | **\~R$ 141** |

## Cobrança e e-mails

O Stripe cobra e o Resend manda os e-mails. O app só escuta os avisos do Stripe para liberar ou travar o acesso. Nota fiscal das assinaturas fica fora por enquanto.

**Produtos no Stripe**

| Produto | Preço | Como entra na assinatura |
| --- | --- | --- |
| Kambio Básico | R$ 129,90/mês | Item único |
| Kambio PRO | R$ 179,90/mês | Item único, com 2 funcionários inclusos |
| Funcionário adicional | R$ 29,90/mês cada | Quantidade = funcionários ativos menos 2 |

**Fluxos**

1. **Assinar:** o patrão escolhe o plano e paga numa página do Stripe (Checkout). O Stripe avisa o app, que ativa a empresa.
2. **Mudar para o PRO:** ao convidar o primeiro funcionário, o app troca o item da assinatura. O Stripe cobra a diferença proporcional na próxima fatura.
3. **Funcionário extra:** quando o 3º funcionário aceita o convite, o app aumenta a quantidade do item adicional. Ao desativar, diminui.
4. **Trocar cartão ou cancelar:** pelo portal do cliente do Stripe, aberto pela tela Conta.
5. **Falha de pagamento:** o Stripe tenta de novo sozinho. O app segue a régua do Painel admin: aviso no vencimento, lembrete em 3 dias, só leitura em 7 dias e bloqueio em 15.

Avisos do Stripe que o app trata: assinatura criada, alterada e cancelada; fatura paga; pagamento falhou.

**Dois pontos de atenção**

- **Pix:** a conta Stripe brasileira aceita Pix só em pagamento único, segundo o suporte do Stripe. No lançamento a assinatura é só no cartão.
- **Prazo de recebimento:** no Stripe, pagamento com cartão nacional fica disponível para repasse em 30 dias.

**E-mails pelo Resend**

- Boas-vindas e confirmação de conta.
- Convite de funcionário.
- Recuperação de senha (o Supabase Auth envia usando o Resend).
- Falha de pagamento, aviso de só leitura e aviso de bloqueio.
- Remetente no domínio kambio.com.br, com o domínio verificado no Resend para não cair no spam.

O recibo de cada fatura sai pelo próprio Stripe.

## Segurança e LGPD

O Kambio guarda o faturamento e os clientes de outras empresas. Um vazamento entre oficinas acaba com a confiança no produto, então o isolamento fica no banco, não só na tela.

- **Isolamento por empresa:** Row Level Security em todas as tabelas, testado com dois usuários de empresas diferentes antes de cada publicação.
- **Chaves secretas** (Gemini, Stripe, Resend, chave de serviço do Supabase) só nas variáveis de ambiente da Vercel, nunca no código do navegador.
- **Avisos do Stripe** conferidos pela assinatura do Stripe antes de mudar qualquer status.
- **Backup:** o diário do Supabase Pro.
- **Áudio:** apagado depois de processado. Fica só a transcrição.
- **Modo suporte do admin:** só leitura, com registro de quem acessou, quando e por quê.
- **Termos de uso e política de privacidade:** dizem quais dados são guardados, que o áudio passa pelo Google para ser interpretado e como pedir exportação ou exclusão.
- **Exportar e excluir dados** de uma empresa a pedido, pelo painel admin.

## Instruções para o Claude construir

Esta seção é para quem vai programar o Kambio, pessoa ou IA. A parte de Produto manda no comportamento, a parte de Construção manda na técnica, e o protótipo é só referência visual.

**Regras de código**

1. TypeScript estrito, sem `any`.
2. Toda permissão vale no banco (RLS e views) e é repetida no servidor. A tela nunca é a única barreira.
3. Dinheiro em centavos inteiros. Cálculos só no servidor. Na tela, formatar em R$ com `Intl.NumberFormat('pt-BR')`.
4. Chaves secretas só em rotas de servidor.
5. Todos os textos da interface em português do Brasil, no tom das Regras para o app ser fácil de usar.
6. Componentes reaproveitáveis desde o começo: navegação fixa por perfil, botão Falar, cartão de confirmação, valor em reais, estado vazio, aviso com Desfazer.
7. Migrações SQL versionadas e dados de exemplo de uma oficina de moto (catálogo, 3 veículos, OS dos últimos 7 dias) para testar.
8. Testes automáticos mínimos: isolamento entre duas empresas; funcionário sem acesso a custo; cálculo de lucro e taxa; validação do JSON da IA; avisos do Stripe.

**Ordem de construção**

1. Base: projeto Next.js, Tailwind com as cores e fontes, PWA e navegação fixa por perfil.
2. Supabase: tabelas, isolamento por empresa, visões do funcionário, dados de exemplo.
3. Login, cadastro da empresa e cadastro inicial com catálogo modelo do segmento.
4. Botão Falar, pipeline de voz e cartão de confirmação, com a opção de digitar.
5. OS e pátio, histórico por placa, estoque e despesas.
6. Painel com filtros, Contas do mês e alertas.
7. Fechamento do dia.
8. Equipe: convite, permissões e telas do funcionário.
9. Stripe: planos, checkout, portal do cliente, avisos e régua de cobrança.
10. Lembretes, notificações push e tarefas agendadas.
11. Painel admin.

**Uma tela só está pronta quando:**

- funciona numa tela de 360 px e no computador;
- tem estado vazio, carregando e erro;
- segue a Identidade visual e as Regras para o app ser fácil de usar;
- respeita a tabela de Permissões, testada com um patrão e um funcionário.

## Ordem de execução

Construir o núcleo e testar com oficinas pagando. A IA de voz é o Gemini 3.1 Flash-Lite (transcrição e interpretação); a qualidade é acompanhada em uso pela taxa de correção do cartão.

1. **MVP:** as telas na ordem de Instruções para o Claude construir.
2. **Piloto:** 10 oficinas usando de verdade, com o preço de fundador. Acompanhar a taxa de correção do cartão e quantas fecham o dia toda semana.
3. **Depois do piloto:** o que está em Fora do MVP.

## Fora do MVP

Fica para depois que as primeiras oficinas estiverem pagando:

- Comissão por funcionário (tirada por agora).
- App nas lojas (Android e iPhone). O MVP é web app instalável no celular.
- Consulta automática de modelo pela placa.
- Emissão de nota fiscal: das OS da oficina e das assinaturas do Kambio.
- Leitura automática do extrato do banco e da maquininha para o fechamento.
- Mais de uma unidade por empresa.
- Link de avaliação no Google enviado ao cliente depois do serviço, ligado às plaquinhas.
- Uso sem internet.

**Perguntas em aberto**

- O funcionário pode registrar despesa (ex.: comprou estopa com dinheiro do caixa)? Hoje a tabela diz que não.

## Fontes

- [Preços da API do Gemini](https://ai.google.dev/pricing): Gemini 3.1 Flash-Lite, entrada e saída.
- [Preços da API do Gemini (áudio)](https://ai.google.dev/gemini-api/docs/pricing): 25 tokens por segundo de áudio.
- [Preços do Supabase](https://supabase.com/pricing.md): pausa do plano gratuito e Pro a US$ 25.
- [Stripe: Pix no Brasil](https://support.stripe.com/questions/how-to-enable-pix-as-a-payment-method-in-brazil?locale=pt-BR): Pix só em pagamento único.
- [Stripe ou Mercado Pago: taxas e prazos](https://quasa.io/pt/media/stripe-ou-mercado-pago-o-prazo-de-recebimento-vira-parte-da-taxa): 3,99% + R$ 0,39, Billing e repasse em 30 dias.
- [Vercel: uso comercial](https://vercel.com/docs/platform/fair-use-policy): o plano Hobby não permite uso comercial.
