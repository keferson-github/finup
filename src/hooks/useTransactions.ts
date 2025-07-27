import { useState, useEffect } from 'react'
import { supabase, Transaction } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { triggerDashboardUpdate } from './useDashboardSync'
import toast from 'react-hot-toast'

export interface TransactionWithDetails extends Transaction {
  account: {
    name: string
    color: string
  }
  category: {
    name: string
    color: string
    icon: string
  } | null
}

export const useTransactions = (onTransactionChange?: () => Promise<void>) => {
  const { user } = useAuthContext()
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(false)

  const loadTransactions = async (filters?: {
    startDate?: string
    endDate?: string
    accountId?: string
    categoryId?: string
    type?: 'income' | 'expense'
    status?: 'paid' | 'pending' | 'overdue'
    search?: string
  }) => {
    if (!user) return

    console.log('🔄 Carregando transações do servidor...', filters ? 'com filtros' : 'sem filtros')
    try {
      setLoading(true)
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          accounts!inner(nome, cor),
          categories(nome, cor, icone)
        `)
        .eq('user_id', user.id)
        .order('data', { ascending: false })

      if (filters?.startDate) {
        query = query.gte('data', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('data', filters.endDate)
      }
      if (filters?.accountId) {
        query = query.eq('account_id', filters.accountId)
      }
      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }
      if (filters?.type) {
        const tipoValue = filters.type === 'income' ? 'receita' : 'despesa'
        query = query.eq('tipo', tipoValue)
      }
      if (filters?.status) {
        const statusValue = filters.status === 'paid' ? 'pago' : filters.status === 'pending' ? 'pendente' : 'vencido'
        query = query.eq('status', statusValue)
      }
      if (filters?.search) {
        query = query.or(`titulo.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedTransactions = data?.map(t => ({
        ...t,
        account: {
          name: t.accounts.nome,
          color: t.accounts.cor
        },
        category: t.categories ? {
          name: t.categories.nome,
          color: t.categories.cor,
          icon: t.categories.icone
        } : null
      })) || []

      console.log('✅ Transações carregadas do servidor:', formattedTransactions.length)
      setTransactions(formattedTransactions)
    } catch (error: any) {
      console.error('Error loading transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transaction: {
    titulo: string
    descricao?: string
    amount: number
    type: 'income' | 'expense'
    account_id: string
    category_id?: string
    data: string
    status?: 'paid' | 'pending'
    is_installment?: boolean
    total_installments?: number
    is_recurring?: boolean
    recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
    recurring_end_date?: string
    tags?: string[]
    notes?: string
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      // Convert English values to Portuguese for database
      const tipoValue = transaction.type === 'income' ? 'receita' : 'despesa'
      const statusValue = transaction.status === 'paid' ? 'pago' : 'pendente'
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          titulo: transaction.titulo,
          descricao: transaction.descricao,
          valor: transaction.amount,
          tipo: tipoValue,
          status: statusValue,
          data: transaction.data,
          account_id: transaction.account_id,
          category_id: transaction.category_id,
          eh_parcelamento: transaction.is_installment,
          total_parcelas: transaction.total_installments,
          eh_recorrente: transaction.is_recurring,
          frequencia_recorrencia: transaction.recurring_frequency === 'daily' ? 'diario' :
                                 transaction.recurring_frequency === 'weekly' ? 'semanal' :
                                 transaction.recurring_frequency === 'monthly' ? 'mensal' :
                                 transaction.recurring_frequency === 'yearly' ? 'anual' : undefined,
          data_fim_recorrencia: transaction.recurring_end_date,
          tags: transaction.tags,
          observacoes: transaction.notes,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // If it's an installment transaction, create the remaining installments
      if (transaction.is_installment && transaction.total_installments && transaction.total_installments > 1) {
        const installments = []
        const baseDate = new Date(transaction.data)
        
        for (let i = 2; i <= transaction.total_installments; i++) {
          const installmentDate = new Date(baseDate)
          installmentDate.setMonth(installmentDate.getMonth() + (i - 1))
          
          installments.push({
            titulo: transaction.titulo,
            descricao: transaction.descricao,
            valor: transaction.amount,
            tipo: tipoValue,
            status: 'pendente',
            data: installmentDate.toISOString().split('T')[0],
            account_id: transaction.account_id,
            category_id: transaction.category_id,
            eh_parcelamento: true,
            numero_parcela: i,
            total_parcelas: transaction.total_installments,
            transacao_pai_id: data.id,
            tags: transaction.tags,
            observacoes: transaction.notes,
            user_id: user.id
          })
        }

        if (installments.length > 0) {
          const { error: installmentError } = await supabase
            .from('transactions')
            .insert(installments)

          if (installmentError) throw installmentError
        }
      }

      // Atualizar estado local imediatamente para feedback instantâneo
      const newTransaction = {
        ...data,
        account: { name: 'Carregando...', color: '#6B7280' },
        category: null
      }
      
      setTransactions(prevTransactions => {
        console.log('💰 Adicionando nova transação ao estado local:', data.titulo)
        return [newTransaction, ...prevTransactions]
      })

      toast.success('Transaction created successfully!')
      
      // Recarregar dados do servidor para garantir sincronização
      setTimeout(async () => {
        await loadTransactions()
      }, 100)
      
      // Notify dashboard to refresh
      if (onTransactionChange) {
        await onTransactionChange()
      }

      // Disparar atualização do dashboard
      console.log('📤 Disparando atualização do dashboard para transação criada:', data.titulo)
      triggerDashboardUpdate('transaction')
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      toast.error(error.message || 'Failed to create transaction')
      return { success: false, error: error.message }
    }
  }

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Atualizar estado local imediatamente
      setTransactions(prevTransactions => {
        console.log('📝 Atualizando transação no estado local:', id)
        return prevTransactions.map(transaction => 
          transaction.id === id ? { ...transaction, ...data } : transaction
        )
      })

      toast.success('Transaction updated successfully!')
      
      // Recarregar dados do servidor para garantir sincronização
      setTimeout(async () => {
        await loadTransactions()
      }, 100)
      
      // Notify dashboard to refresh
      if (onTransactionChange) {
        await onTransactionChange()
      }

      // Disparar atualização do dashboard
      console.log('📤 Disparando atualização do dashboard para transação atualizada:', id)
      triggerDashboardUpdate('transaction')
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating transaction:', error)
      toast.error(error.message || 'Failed to update transaction')
      return { success: false, error: error.message }
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Remover do estado local imediatamente
      setTransactions(prevTransactions => {
        console.log('🗑️ Removendo transação do estado local:', id)
        return prevTransactions.filter(transaction => transaction.id !== id)
      })

      toast.success('Transaction deleted successfully!')
      
      // Recarregar dados do servidor para garantir sincronização
      setTimeout(async () => {
        await loadTransactions()
      }, 100)
      
      // Notify dashboard to refresh
      if (onTransactionChange) {
        await onTransactionChange()
      }

      // Disparar atualização do dashboard
      console.log('📤 Disparando atualização do dashboard para transação deletada:', id)
      triggerDashboardUpdate('transaction')
      
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting transaction:', error)
      toast.error(error.message || 'Failed to delete transaction')
      return { success: false, error: error.message }
    }
  }

  const markAsPaid = async (id: string) => {
    return updateTransaction(id, { status: 'pago' })
  }

  const markAsPending = async (id: string) => {
    return updateTransaction(id, { status: 'pendente' })
  }

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  // Subscription para atualizações em tempo real
  useEffect(() => {
    if (!user) return

    console.log('🔗 Configurando subscription para transações...')
    const subscription = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const transactionTitle = (payload.new as any)?.titulo || (payload.old as any)?.titulo || 'Transação desconhecida'
          console.log('🔔 Transação modificada via subscription:', payload.eventType, transactionTitle)
          setTimeout(() => {
            loadTransactions()
          }, 100)
        }
      )
      .subscribe()

    return () => {
      console.log('🔌 Desconectando subscription de transações')
      supabase.removeChannel(subscription)
    }
  }, [user])

  return {
    transactions,
    loading,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    markAsPaid,
    markAsPending
  }
}