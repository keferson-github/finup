import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import toast from 'react-hot-toast'

export interface CalendarTransaction {
  id: string
  titulo: string
  valor: number
  tipo: 'receita' | 'despesa'
  status: 'pago' | 'pendente' | 'vencido'
  data: string
  data_vencimento: string | null
  account: {
    nome: string
    cor: string
  }
  category: {
    nome: string
    cor: string
    icone: string
  } | null
  eh_recorrente: boolean
  eh_parcelamento: boolean
  numero_parcela?: number
  total_parcelas?: number
}

export interface CalendarFilters {
  tipo?: 'receita' | 'despesa' | ''
  categoriaId?: string
  contaId?: string
  status?: 'pago' | 'pendente' | 'vencido' | ''
}

export interface DaySummary {
  data: string
  totalReceitas: number
  totalDespesas: number
  saldoLiquido: number
  transacoes: CalendarTransaction[]
}

export const useCalendar = () => {
  const { user } = useAuthContext()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [transactions, setTransactions] = useState<CalendarTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<CalendarFilters>({})

  const loadMonthTransactions = async (date: Date = currentDate) => {
    if (!user) return

    try {
      setLoading(true)
      
      const monthStart = format(startOfMonth(date), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd')

      let query = supabase
        .from('transactions')
        .select(`
          id,
          titulo,
          valor,
          tipo,
          status,
          data,
          data_vencimento,
          eh_recorrente,
          eh_parcelamento,
          numero_parcela,
          total_parcelas,
          accounts!inner(nome, cor),
          categories(nome, cor, icone)
        `)
        .eq('user_id', user.id)
        .gte('data', monthStart)
        .lte('data', monthEnd)
        .order('data', { ascending: true })

      // Aplicar filtros
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters.categoriaId) {
        query = query.eq('category_id', filters.categoriaId)
      }
      if (filters.contaId) {
        query = query.eq('account_id', filters.contaId)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedTransactions = data?.map(t => ({
        id: t.id,
        titulo: t.titulo,
        valor: Number(t.valor),
        tipo: t.tipo,
        status: t.status,
        data: t.data,
        data_vencimento: t.data_vencimento,
        eh_recorrente: t.eh_recorrente,
        eh_parcelamento: t.eh_parcelamento,
        numero_parcela: t.numero_parcela,
        total_parcelas: t.total_parcelas,
        account: {
          nome: t.accounts.nome,
          cor: t.accounts.cor
        },
        category: t.categories ? {
          nome: t.categories.nome,
          cor: t.categories.cor,
          icone: t.categories.icone
        } : null
      })) || []

      setTransactions(formattedTransactions)
    } catch (error: any) {
      console.error('Erro ao carregar transações do calendário:', error)
      toast.error('Erro ao carregar transações do calendário')
    } finally {
      setLoading(false)
    }
  }

  const getTransactionsForDate = (date: string): CalendarTransaction[] => {
    return transactions.filter(transaction => transaction.data === date)
  }

  const getDaySummary = (date: string): DaySummary => {
    const dayTransactions = getTransactionsForDate(date)
    
    const totalReceitas = dayTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0)
    
    const totalDespesas = dayTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0)

    return {
      data: date,
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      transacoes: dayTransactions
    }
  }

  const markTransactionAsPaid = async (transactionId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status: 'pago' })
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Transação marcada como paga!')
      await loadMonthTransactions()
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao marcar transação como paga:', error)
      toast.error('Erro ao marcar transação como paga')
      return { success: false, error: error.message }
    }
  }

  const markTransactionAsPending = async (transactionId: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status: 'pendente' })
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Transação marcada como pendente!')
      await loadMonthTransactions()
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao marcar transação como pendente:', error)
      toast.error('Erro ao marcar transação como pendente')
      return { success: false, error: error.message }
    }
  }

  const getMonthSummary = () => {
    const totalReceitas = transactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0)
    
    const totalDespesas = transactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0)

    const transacoesPagas = transactions.filter(t => t.status === 'pago').length
    const transacoesPendentes = transactions.filter(t => t.status === 'pendente').length
    const transacoesVencidas = transactions.filter(t => t.status === 'vencido').length

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      totalTransacoes: transactions.length,
      transacoesPagas,
      transacoesPendentes,
      transacoesVencidas
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? subMonths(currentDate, 1)
      : addMonths(currentDate, 1)
    
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const applyFilters = (newFilters: CalendarFilters) => {
    setFilters(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
  }

  useEffect(() => {
    if (user) {
      loadMonthTransactions()
    }
  }, [user, currentDate, filters])

  return {
    currentDate,
    transactions,
    loading,
    filters,
    loadMonthTransactions,
    getTransactionsForDate,
    getDaySummary,
    getMonthSummary,
    markTransactionAsPaid,
    markTransactionAsPending,
    navigateMonth,
    goToToday,
    applyFilters,
    clearFilters
  }
}