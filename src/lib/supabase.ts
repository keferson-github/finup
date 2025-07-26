import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nome_completo: string | null
          avatar_url: string | null
          moeda: string
          fuso_horario: string
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id: string
          email: string
          nome_completo?: string | null
          avatar_url?: string | null
          moeda?: string
          fuso_horario?: string
        }
        Update: {
          nome_completo?: string | null
          avatar_url?: string | null
          moeda?: string
          fuso_horario?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          nome: string
          tipo: 'conta_corrente' | 'poupanca' | 'cartao_credito' | 'dinheiro' | 'investimento'
          saldo: number
          saldo_inicial: number
          cor: string
          descricao: string | null
          ativo: boolean
          banco: string | null
          bandeira_cartao: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          user_id: string
          nome: string
          tipo?: 'conta_corrente' | 'poupanca' | 'cartao_credito' | 'dinheiro' | 'investimento'
          saldo?: number
          saldo_inicial?: number
          cor?: string
          descricao?: string | null
          ativo?: boolean
          banco?: string | null
          bandeira_cartao?: string | null
        }
        Update: {
          nome?: string
          tipo?: 'conta_corrente' | 'poupanca' | 'cartao_credito' | 'dinheiro' | 'investimento'
          saldo?: number
          saldo_inicial?: number
          cor?: string
          descricao?: string | null
          ativo?: boolean
          banco?: string | null
          bandeira_cartao?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          nome: string
          tipo: 'receita' | 'despesa'
          cor: string
          icone: string
          descricao: string | null
          ativo: boolean
          criado_em: string
        }
        Insert: {
          user_id: string
          nome: string
          tipo: 'receita' | 'despesa'
          cor?: string
          icone?: string
          descricao?: string | null
          ativo?: boolean
        }
        Update: {
          nome?: string
          tipo?: 'receita' | 'despesa'
          cor?: string
          icone?: string
          descricao?: string | null
          ativo?: boolean
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          titulo: string
          descricao: string | null
          valor: number
          tipo: 'receita' | 'despesa'
          status: 'pago' | 'pendente' | 'vencido'
          data: string
          data_vencimento: string | null
          eh_parcelamento: boolean
          numero_parcela: number
          total_parcelas: number
          transacao_pai_id: string | null
          eh_recorrente: boolean
          frequencia_recorrencia: string | null
          data_fim_recorrencia: string | null
          template_recorrencia_id: string | null
          tags: string[] | null
          observacoes: string | null
          url_anexo: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          user_id: string
          account_id: string
          category_id?: string | null
          titulo: string
          descricao?: string | null
          valor: number
          tipo: 'receita' | 'despesa'
          status?: 'pago' | 'pendente' | 'vencido'
          data: string
          data_vencimento?: string | null
          eh_parcelamento?: boolean
          numero_parcela?: number
          total_parcelas?: number
          transacao_pai_id?: string | null
          eh_recorrente?: boolean
          frequencia_recorrencia?: string | null
          data_fim_recorrencia?: string | null
          template_recorrencia_id?: string | null
          tags?: string[] | null
          observacoes?: string | null
          url_anexo?: string | null
        }
        Update: {
          account_id?: string
          category_id?: string | null
          titulo?: string
          descricao?: string | null
          valor?: number
          tipo?: 'receita' | 'despesa'
          status?: 'pago' | 'pendente' | 'vencido'
          data?: string
          data_vencimento?: string | null
          eh_parcelamento?: boolean
          numero_parcela?: number
          total_parcelas?: number
          transacao_pai_id?: string | null
          eh_recorrente?: boolean
          frequencia_recorrencia?: string | null
          data_fim_recorrencia?: string | null
          template_recorrencia_id?: string | null
          tags?: string[] | null
          observacoes?: string | null
          url_anexo?: string | null
        }
      }
    }
  }
}

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']