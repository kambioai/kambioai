export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          criado_em: string
          nome: string | null
          usuario_id: string
        }
        Insert: {
          criado_em?: string
          nome?: string | null
          usuario_id: string
        }
        Update: {
          criado_em?: string
          nome?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      auditoria: {
        Row: {
          antes: Json | null
          autor_id: string | null
          data: string
          depois: Json | null
          empresa_id: string
          id: string
          registro_id: string | null
          tabela: string
        }
        Insert: {
          antes?: Json | null
          autor_id?: string | null
          data?: string
          depois?: Json | null
          empresa_id: string
          id?: string
          registro_id?: string | null
          tabela: string
        }
        Update: {
          antes?: Json | null
          autor_id?: string | null
          data?: string
          depois?: Json | null
          empresa_id?: string
          id?: string
          registro_id?: string | null
          tabela?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditoria_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_itens: {
        Row: {
          atualizado_em: string
          criado_em: string
          custo: number
          dias_para_retorno: number | null
          empresa_id: string
          estoque: number
          estoque_minimo: number
          id: string
          nome: string
          preco: number
          sinonimos: string[]
          tipo: Database["public"]["Enums"]["tipo_item"]
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          custo?: number
          dias_para_retorno?: number | null
          empresa_id: string
          estoque?: number
          estoque_minimo?: number
          id?: string
          nome: string
          preco?: number
          sinonimos?: string[]
          tipo: Database["public"]["Enums"]["tipo_item"]
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          custo?: number
          dias_para_retorno?: number | null
          empresa_id?: string
          estoque?: number
          estoque_minimo?: number
          id?: string
          nome?: string
          preco?: number
          sinonimos?: string[]
          tipo?: Database["public"]["Enums"]["tipo_item"]
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      chamados: {
        Row: {
          assunto: string
          criado_em: string
          empresa_id: string
          id: string
          prioridade: string
          status: string
        }
        Insert: {
          assunto: string
          criado_em?: string
          empresa_id: string
          id?: string
          prioridade?: string
          status?: string
        }
        Update: {
          assunto?: string
          criado_em?: string
          empresa_id?: string
          id?: string
          prioridade?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "chamados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          atualizado_em: string
          criado_em: string
          empresa_id: string
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          empresa_id: string
          id?: string
          nome: string
          telefone?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          empresa_id?: string
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicados: {
        Row: {
          alcance: number
          corpo: string
          criado_em: string
          criado_por: string | null
          enviado_em: string | null
          id: string
          publico: string
          status: string
          titulo: string
        }
        Insert: {
          alcance?: number
          corpo: string
          criado_em?: string
          criado_por?: string | null
          enviado_em?: string | null
          id?: string
          publico?: string
          status?: string
          titulo: string
        }
        Update: {
          alcance?: number
          corpo?: string
          criado_em?: string
          criado_por?: string | null
          enviado_em?: string | null
          id?: string
          publico?: string
          status?: string
          titulo?: string
        }
        Relationships: []
      }
      convites: {
        Row: {
          criado_em: string
          criado_por: string | null
          email: string | null
          empresa_id: string
          expira_em: string
          id: string
          nome: string
          papel: Database["public"]["Enums"]["papel"]
          token: string
          usado: boolean
          usado_em: string | null
          usado_por: string | null
        }
        Insert: {
          criado_em?: string
          criado_por?: string | null
          email?: string | null
          empresa_id: string
          expira_em?: string
          id?: string
          nome: string
          papel?: Database["public"]["Enums"]["papel"]
          token: string
          usado?: boolean
          usado_em?: string | null
          usado_por?: string | null
        }
        Update: {
          criado_em?: string
          criado_por?: string | null
          email?: string | null
          empresa_id?: string
          expira_em?: string
          id?: string
          nome?: string
          papel?: Database["public"]["Enums"]["papel"]
          token?: string
          usado?: boolean
          usado_em?: string | null
          usado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons: {
        Row: {
          ativo: boolean
          codigo: string
          criado_em: string
          descricao: string
          id: string
          meses: number | null
          percentual: number | null
          usos: number
          validade: string | null
        }
        Insert: {
          ativo?: boolean
          codigo: string
          criado_em?: string
          descricao: string
          id?: string
          meses?: number | null
          percentual?: number | null
          usos?: number
          validade?: string | null
        }
        Update: {
          ativo?: boolean
          codigo?: string
          criado_em?: string
          descricao?: string
          id?: string
          meses?: number | null
          percentual?: number | null
          usos?: number
          validade?: string | null
        }
        Relationships: []
      }
      custos_fixos: {
        Row: {
          atualizado_em: string
          criado_em: string
          empresa_id: string
          id: string
          nome: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          empresa_id: string
          id?: string
          nome: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          empresa_id?: string
          id?: string
          nome?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "custos_fixos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          atualizado_em: string
          autor_id: string | null
          categoria: string | null
          criado_em: string
          descricao: string
          empresa_id: string
          id: string
          valor: number
        }
        Insert: {
          atualizado_em?: string
          autor_id?: string | null
          categoria?: string | null
          criado_em?: string
          descricao: string
          empresa_id: string
          id?: string
          valor: number
        }
        Update: {
          atualizado_em?: string
          autor_id?: string | null
          categoria?: string | null
          criado_em?: string
          descricao?: string
          empresa_id?: string
          id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          atualizado_em: string
          cidade: string | null
          criado_em: string
          id: string
          inadimplente_desde: string | null
          nome: string
          onboarding_completo: boolean
          plano: Database["public"]["Enums"]["plano"]
          segmento: Database["public"]["Enums"]["segmento"]
          status_assinatura: Database["public"]["Enums"]["status_assinatura"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          atualizado_em?: string
          cidade?: string | null
          criado_em?: string
          id?: string
          inadimplente_desde?: string | null
          nome: string
          onboarding_completo?: boolean
          plano?: Database["public"]["Enums"]["plano"]
          segmento: Database["public"]["Enums"]["segmento"]
          status_assinatura?: Database["public"]["Enums"]["status_assinatura"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          atualizado_em?: string
          cidade?: string | null
          criado_em?: string
          id?: string
          inadimplente_desde?: string | null
          nome?: string
          onboarding_completo?: boolean
          plano?: Database["public"]["Enums"]["plano"]
          segmento?: Database["public"]["Enums"]["segmento"]
          status_assinatura?: Database["public"]["Enums"]["status_assinatura"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
      fechamentos: {
        Row: {
          autor_id: string | null
          criado_em: string
          data: string
          diferencas: Json
          empresa_id: string
          id: string
          valores_informados: Json
        }
        Insert: {
          autor_id?: string | null
          criado_em?: string
          data: string
          diferencas?: Json
          empresa_id: string
          id?: string
          valores_informados?: Json
        }
        Update: {
          autor_id?: string | null
          criado_em?: string
          data?: string
          diferencas?: Json
          empresa_id?: string
          id?: string
          valores_informados?: Json
        }
        Relationships: [
          {
            foreignKeyName: "fechamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      lembretes: {
        Row: {
          criado_em: string
          data_hora: string
          empresa_id: string
          enviado: boolean
          id: string
          texto: string
          tipo: string
          veiculo_id: string | null
        }
        Insert: {
          criado_em?: string
          data_hora: string
          empresa_id: string
          enviado?: boolean
          id?: string
          texto: string
          tipo?: string
          veiculo_id?: string | null
        }
        Update: {
          criado_em?: string
          data_hora?: string
          empresa_id?: string
          enviado?: boolean
          id?: string
          texto?: string
          tipo?: string
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lembretes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lembretes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      membros: {
        Row: {
          ativo: boolean
          atualizado_em: string
          criado_em: string
          email: string | null
          empresa_id: string
          id: string
          nome: string | null
          papel: Database["public"]["Enums"]["papel"]
          usuario_id: string
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          empresa_id: string
          id?: string
          nome?: string | null
          papel: Database["public"]["Enums"]["papel"]
          usuario_id: string
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          criado_em?: string
          email?: string | null
          empresa_id?: string
          id?: string
          nome?: string | null
          papel?: Database["public"]["Enums"]["papel"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentos_estoque: {
        Row: {
          autor_id: string | null
          criado_em: string
          empresa_id: string
          id: string
          item_id: string
          motivo: Database["public"]["Enums"]["motivo_movimento"]
          quantidade: number
        }
        Insert: {
          autor_id?: string | null
          criado_em?: string
          empresa_id: string
          id?: string
          item_id: string
          motivo: Database["public"]["Enums"]["motivo_movimento"]
          quantidade: number
        }
        Update: {
          autor_id?: string | null
          criado_em?: string
          empresa_id?: string
          id?: string
          item_id?: string
          motivo?: Database["public"]["Enums"]["motivo_movimento"]
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentos_estoque_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_estoque_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalogo_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentos_estoque_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "vw_catalogo_funcionario"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          atualizado_em: string
          autor_id: string | null
          cliente_id: string | null
          criado_em: string
          custo_total: number
          empresa_id: string
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          id: string
          origem: Database["public"]["Enums"]["origem_lancamento"]
          parcelas: number
          status: Database["public"]["Enums"]["status_os"]
          taxa: number
          total: number
          transcricao: string | null
          veiculo_id: string | null
        }
        Insert: {
          atualizado_em?: string
          autor_id?: string | null
          cliente_id?: string | null
          criado_em?: string
          custo_total?: number
          empresa_id: string
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          parcelas?: number
          status?: Database["public"]["Enums"]["status_os"]
          taxa?: number
          total?: number
          transcricao?: string | null
          veiculo_id?: string | null
        }
        Update: {
          atualizado_em?: string
          autor_id?: string | null
          cliente_id?: string | null
          criado_em?: string
          custo_total?: number
          empresa_id?: string
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string
          origem?: Database["public"]["Enums"]["origem_lancamento"]
          parcelas?: number
          status?: Database["public"]["Enums"]["status_os"]
          taxa?: number
          total?: number
          transcricao?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      os_itens: {
        Row: {
          criado_em: string
          custo: number
          descricao: string
          empresa_id: string
          id: string
          item_id: string | null
          os_id: string
          preco: number
          quantidade: number
        }
        Insert: {
          criado_em?: string
          custo?: number
          descricao: string
          empresa_id: string
          id?: string
          item_id?: string | null
          os_id: string
          preco?: number
          quantidade?: number
        }
        Update: {
          criado_em?: string
          custo?: number
          descricao?: string
          empresa_id?: string
          id?: string
          item_id?: string | null
          os_id?: string
          preco?: number
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalogo_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "vw_catalogo_funcionario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_ordens_funcionario"
            referencedColumns: ["id"]
          },
        ]
      }
      push_inscricoes: {
        Row: {
          chaves: Json
          criado_em: string
          empresa_id: string
          endpoint: string
          id: string
          usuario_id: string
        }
        Insert: {
          chaves: Json
          criado_em?: string
          empresa_id: string
          endpoint: string
          id?: string
          usuario_id: string
        }
        Update: {
          chaves?: Json
          criado_em?: string
          empresa_id?: string
          endpoint?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_inscricoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      suporte_acessos: {
        Row: {
          admin_id: string
          criado_em: string
          empresa_id: string
          id: string
          motivo: string
        }
        Insert: {
          admin_id: string
          criado_em?: string
          empresa_id: string
          id?: string
          motivo: string
        }
        Update: {
          admin_id?: string
          criado_em?: string
          empresa_id?: string
          id?: string
          motivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "suporte_acessos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      taxas_pagamento: {
        Row: {
          atualizado_em: string
          criado_em: string
          empresa_id: string
          forma: Database["public"]["Enums"]["forma_pagamento"]
          id: string
          parcelas: number
          percentual: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          empresa_id: string
          forma: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          parcelas?: number
          percentual?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          empresa_id?: string
          forma?: Database["public"]["Enums"]["forma_pagamento"]
          id?: string
          parcelas?: number
          percentual?: number
        }
        Relationships: [
          {
            foreignKeyName: "taxas_pagamento_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      uso_ia: {
        Row: {
          corrigido: boolean
          criado_em: string
          custo: number
          empresa_id: string
          id: string
          tokens_entrada: number
          tokens_saida: number
        }
        Insert: {
          corrigido?: boolean
          criado_em?: string
          custo?: number
          empresa_id: string
          id?: string
          tokens_entrada?: number
          tokens_saida?: number
        }
        Update: {
          corrigido?: boolean
          criado_em?: string
          custo?: number
          empresa_id?: string
          id?: string
          tokens_entrada?: number
          tokens_saida?: number
        }
        Relationships: [
          {
            foreignKeyName: "uso_ia_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          atualizado_em: string
          cliente_id: string | null
          cor: string | null
          criado_em: string
          empresa_id: string
          id: string
          km: number | null
          modelo: string | null
          placa: string
        }
        Insert: {
          ano?: number | null
          atualizado_em?: string
          cliente_id?: string | null
          cor?: string | null
          criado_em?: string
          empresa_id: string
          id?: string
          km?: number | null
          modelo?: string | null
          placa: string
        }
        Update: {
          ano?: number | null
          atualizado_em?: string
          cliente_id?: string | null
          cor?: string | null
          criado_em?: string
          empresa_id?: string
          id?: string
          km?: number | null
          modelo?: string | null
          placa?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_catalogo_funcionario: {
        Row: {
          atualizado_em: string | null
          criado_em: string | null
          dias_para_retorno: number | null
          empresa_id: string | null
          estoque: number | null
          estoque_minimo: number | null
          id: string | null
          nome: string | null
          preco: number | null
          tipo: Database["public"]["Enums"]["tipo_item"] | null
        }
        Insert: {
          atualizado_em?: string | null
          criado_em?: string | null
          dias_para_retorno?: number | null
          empresa_id?: string | null
          estoque?: number | null
          estoque_minimo?: number | null
          id?: string | null
          nome?: string | null
          preco?: number | null
          tipo?: Database["public"]["Enums"]["tipo_item"] | null
        }
        Update: {
          atualizado_em?: string | null
          criado_em?: string | null
          dias_para_retorno?: number | null
          empresa_id?: string | null
          estoque?: number | null
          estoque_minimo?: number | null
          id?: string | null
          nome?: string | null
          preco?: number | null
          tipo?: Database["public"]["Enums"]["tipo_item"] | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_ordens_funcionario: {
        Row: {
          atualizado_em: string | null
          autor_id: string | null
          cliente_id: string | null
          criado_em: string | null
          empresa_id: string | null
          forma_pagamento: Database["public"]["Enums"]["forma_pagamento"] | null
          id: string | null
          origem: Database["public"]["Enums"]["origem_lancamento"] | null
          parcelas: number | null
          status: Database["public"]["Enums"]["status_os"] | null
          veiculo_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          autor_id?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"] | null
          parcelas?: number | null
          status?: Database["public"]["Enums"]["status_os"] | null
          veiculo_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          autor_id?: string | null
          cliente_id?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento"]
            | null
          id?: string | null
          origem?: Database["public"]["Enums"]["origem_lancamento"] | null
          parcelas?: number | null
          status?: Database["public"]["Enums"]["status_os"] | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_os_itens_funcionario: {
        Row: {
          criado_em: string | null
          descricao: string | null
          empresa_id: string | null
          id: string | null
          item_id: string | null
          os_id: string | null
          preco: number | null
          quantidade: number | null
        }
        Insert: {
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string | null
          item_id?: string | null
          os_id?: string | null
          preco?: number | null
          quantidade?: number | null
        }
        Update: {
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string | null
          item_id?: string | null
          os_id?: string | null
          preco?: number | null
          quantidade?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "os_itens_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "catalogo_itens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "vw_catalogo_funcionario"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_itens_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_ordens_funcionario"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      criar_empresa_onboarding: {
        Args: {
          p_cidade: string
          p_nome: string
          p_segmento: Database["public"]["Enums"]["segmento"]
        }
        Returns: string
      }
      e_membro: { Args: { emp: string }; Returns: boolean }
      e_patrao: { Args: { emp: string }; Returns: boolean }
      empresas_do_usuario: { Args: never; Returns: string[] }
      entrar_como_funcionario_demo: { Args: never; Returns: undefined }
      entrar_como_patrao_demo: { Args: never; Returns: undefined }
      excluir_empresa: { Args: { p_empresa_id: string }; Returns: undefined }
      registrar_os: {
        Args: {
          p_cliente_id: string
          p_custo_total: number
          p_empresa_id: string
          p_forma_pagamento: Database["public"]["Enums"]["forma_pagamento"]
          p_itens: Json
          p_origem: Database["public"]["Enums"]["origem_lancamento"]
          p_parcelas: number
          p_status: Database["public"]["Enums"]["status_os"]
          p_taxa: number
          p_total: number
          p_transcricao: string
          p_veiculo_id: string
        }
        Returns: string
      }
    }
    Enums: {
      forma_pagamento: "pix" | "dinheiro" | "debito" | "credito"
      motivo_movimento: "venda" | "compra" | "ajuste"
      origem_lancamento: "voz" | "manual"
      papel: "patrao" | "funcionario"
      plano: "basico" | "pro"
      segmento:
        | "oficina_moto"
        | "mecanica"
        | "funilaria"
        | "estetica"
        | "troca_oleo"
        | "borracharia"
      status_assinatura:
        | "ativa"
        | "teste"
        | "inadimplente"
        | "bloqueada"
        | "cancelada"
      status_os:
        | "orcamento"
        | "em_servico"
        | "aguardando_peca"
        | "pronto"
        | "entregue"
        | "cancelado"
      tipo_item: "produto" | "servico"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      forma_pagamento: ["pix", "dinheiro", "debito", "credito"],
      motivo_movimento: ["venda", "compra", "ajuste"],
      origem_lancamento: ["voz", "manual"],
      papel: ["patrao", "funcionario"],
      plano: ["basico", "pro"],
      segmento: [
        "oficina_moto",
        "mecanica",
        "funilaria",
        "estetica",
        "troca_oleo",
        "borracharia",
      ],
      status_assinatura: [
        "ativa",
        "teste",
        "inadimplente",
        "bloqueada",
        "cancelada",
      ],
      status_os: [
        "orcamento",
        "em_servico",
        "aguardando_peca",
        "pronto",
        "entregue",
        "cancelado",
      ],
      tipo_item: ["produto", "servico"],
    },
  },
} as const
