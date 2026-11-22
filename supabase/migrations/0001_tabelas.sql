-- 0001_tabelas.sql — Modelo de dados do Kambio (CLAUDE.md §5).
-- Regras: dinheiro em CENTAVOS (bigint); datas em timestamptz (fuso tratado na
-- aplicação como America/Sao_Paulo); id em uuid; toda tabela de oficina tem
-- empresa_id, criado_em, atualizado_em. Nomes de tabela/coluna em português.

-- ===== Tipos (enums) =====
create type papel as enum ('patrao', 'funcionario');
create type segmento as enum (
  'oficina_moto', 'mecanica', 'funilaria', 'estetica', 'troca_oleo', 'borracharia'
);
create type plano as enum ('basico', 'pro');
create type status_assinatura as enum (
  'ativa', 'teste', 'inadimplente', 'bloqueada', 'cancelada'
);
create type tipo_item as enum ('produto', 'servico');
create type status_os as enum (
  'orcamento', 'em_servico', 'aguardando_peca', 'pronto', 'entregue', 'cancelado'
);
create type forma_pagamento as enum ('pix', 'dinheiro', 'debito', 'credito');
create type origem_lancamento as enum ('voz', 'manual');
create type motivo_movimento as enum ('venda', 'compra', 'ajuste');

-- ===== Gatilho genérico de atualizado_em =====
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ===== empresas (o "tenant"; não tem empresa_id — ela É a empresa) =====
create table empresas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  segmento segmento not null,
  cidade text,
  plano plano not null default 'basico',
  status_assinatura status_assinatura not null default 'teste',
  stripe_customer_id text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create trigger trg_empresas_atualizado before update on empresas
  for each row execute function public.tocar_atualizado_em();

-- ===== membros (quem acessa cada empresa) =====
create table membros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade,
  papel papel not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (usuario_id, empresa_id)
);
create index idx_membros_usuario on membros(usuario_id);
create index idx_membros_empresa on membros(empresa_id);
create trigger trg_membros_atualizado before update on membros
  for each row execute function public.tocar_atualizado_em();

-- ===== clientes =====
create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_clientes_empresa on clientes(empresa_id);
create trigger trg_clientes_atualizado before update on clientes
  for each row execute function public.tocar_atualizado_em();

-- ===== veiculos (placa única por empresa) =====
create table veiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null,
  modelo text,
  ano int,
  cor text,
  km int,
  cliente_id uuid references clientes(id) on delete set null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (empresa_id, placa)
);
create index idx_veiculos_empresa on veiculos(empresa_id);
create trigger trg_veiculos_atualizado before update on veiculos
  for each row execute function public.tocar_atualizado_em();

-- ===== catalogo_itens (produtos e serviços) =====
create table catalogo_itens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  tipo tipo_item not null,
  custo bigint not null default 0,          -- centavos
  preco bigint not null default 0,          -- centavos
  estoque int not null default 0,
  estoque_minimo int not null default 0,
  sinonimos text[] not null default '{}',
  dias_para_retorno int,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_catalogo_empresa on catalogo_itens(empresa_id);
create trigger trg_catalogo_atualizado before update on catalogo_itens
  for each row execute function public.tocar_atualizado_em();

-- ===== ordens_servico =====
create table ordens_servico (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid references veiculos(id) on delete set null,
  cliente_id uuid references clientes(id) on delete set null,
  status status_os not null default 'orcamento',
  total bigint not null default 0,          -- centavos
  custo_total bigint not null default 0,    -- centavos
  taxa bigint not null default 0,           -- centavos
  forma_pagamento forma_pagamento,
  parcelas int not null default 1,
  autor_id uuid references auth.users(id) on delete set null,
  origem origem_lancamento not null default 'manual',
  transcricao text,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_os_empresa on ordens_servico(empresa_id);
create index idx_os_veiculo on ordens_servico(veiculo_id);
create index idx_os_status on ordens_servico(empresa_id, status);
create trigger trg_os_atualizado before update on ordens_servico
  for each row execute function public.tocar_atualizado_em();

-- ===== os_itens =====
create table os_itens (
  id uuid primary key default gen_random_uuid(),
  os_id uuid not null references ordens_servico(id) on delete cascade,
  item_id uuid references catalogo_itens(id) on delete set null,
  descricao text not null,
  quantidade int not null default 1,
  preco bigint not null default 0,          -- centavos
  custo bigint not null default 0,          -- centavos
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now()
);
create index idx_os_itens_os on os_itens(os_id);
create index idx_os_itens_empresa on os_itens(empresa_id);

-- ===== movimentos_estoque =====
create table movimentos_estoque (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references catalogo_itens(id) on delete cascade,
  quantidade int not null,
  motivo motivo_movimento not null,
  autor_id uuid references auth.users(id) on delete set null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now()
);
create index idx_mov_empresa on movimentos_estoque(empresa_id);
create index idx_mov_item on movimentos_estoque(item_id);

-- ===== despesas (só o patrão lança — ver RLS) =====
create table despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null,
  valor bigint not null,                    -- centavos
  categoria text,
  autor_id uuid references auth.users(id) on delete set null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_despesas_empresa on despesas(empresa_id);
create trigger trg_despesas_atualizado before update on despesas
  for each row execute function public.tocar_atualizado_em();

-- ===== custos_fixos =====
create table custos_fixos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor bigint not null,                    -- centavos
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index idx_custos_empresa on custos_fixos(empresa_id);
create trigger trg_custos_atualizado before update on custos_fixos
  for each row execute function public.tocar_atualizado_em();

-- ===== taxas_pagamento =====
create table taxas_pagamento (
  id uuid primary key default gen_random_uuid(),
  forma forma_pagamento not null,
  parcelas int not null default 1,
  percentual numeric(5,2) not null default 0,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (empresa_id, forma, parcelas)
);
create index idx_taxas_empresa on taxas_pagamento(empresa_id);
create trigger trg_taxas_atualizado before update on taxas_pagamento
  for each row execute function public.tocar_atualizado_em();

-- ===== fechamentos (um por dia por empresa) =====
create table fechamentos (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  valores_informados jsonb not null default '{}',
  diferencas jsonb not null default '{}',
  autor_id uuid references auth.users(id) on delete set null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now(),
  unique (empresa_id, data)
);
create index idx_fechamentos_empresa on fechamentos(empresa_id);

-- ===== lembretes =====
create table lembretes (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  data_hora timestamptz not null,
  veiculo_id uuid references veiculos(id) on delete set null,
  enviado boolean not null default false,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now()
);
create index idx_lembretes_empresa on lembretes(empresa_id);
create index idx_lembretes_pendentes on lembretes(data_hora) where enviado = false;

-- ===== push_inscricoes =====
create table push_inscricoes (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  chaves jsonb not null,
  empresa_id uuid not null references empresas(id) on delete cascade,
  criado_em timestamptz not null default now()
);
create index idx_push_empresa on push_inscricoes(empresa_id);

-- ===== auditoria =====
create table auditoria (
  id uuid primary key default gen_random_uuid(),
  tabela text not null,
  registro_id uuid,
  antes jsonb,
  depois jsonb,
  autor_id uuid,
  data timestamptz not null default now(),
  empresa_id uuid not null references empresas(id) on delete cascade
);
create index idx_auditoria_empresa on auditoria(empresa_id);
create index idx_auditoria_registro on auditoria(tabela, registro_id);

-- ===== uso_ia =====
create table uso_ia (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  tokens_entrada int not null default 0,
  tokens_saida int not null default 0,
  custo bigint not null default 0,          -- centavos
  corrigido boolean not null default false,
  criado_em timestamptz not null default now()
);
create index idx_uso_ia_empresa on uso_ia(empresa_id);
