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
          ...transaction,
          user_id: user.id,
          tipo: tipoValue,
          status: statusValue,
          valor: transaction.amount
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
            ...transaction,
            user_id: user.id,
            tipo: tipoValue,
            status: 'pendente',
            valor: transaction.amount,
            installment_number: i,
            data: installmentDate.toISOString().split('T')[0],
            parent_transaction_id: data.id,
          })
        }

        if (installments.length > 0) {
          const { error: installmentError } = await supabase
            .from('transactions')
            .insert(installments)

          if (installmentError) throw installmentError
        }
      }

      toast.success('Transaction created successfully!')
      await loadTransactions()
      
      // Notify dashboard to refresh
      if (onTransactionChange) {
        await onTransactionChange()
      }

      // Disparar atualização do dashboard
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

      toast.success('Transaction updated successfully!')
      await loadTransactions()
      
      // Notify dashboard to refresh
      if (onTransactionChange) {
        await onTransactionChange()
      }

      // Disparar atualização do dashboard
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

      toast.success('Transaction deleted successfully!')
      await loadTransactions()
      
      // Notify dashboard to refresh
      if (onTransactionChange) {
        await onTransactionChange()
      }

      // Disparar atualização do dashboard
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