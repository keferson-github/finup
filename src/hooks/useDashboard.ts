import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

export interface DashboardSummary {
  totalReceitas: number
  totalDespesas: number
  saldoMesAtual: number
  saldoConsolidado: number
  comparativoComMesAnterior: {
    receitas: number
    despesas: number
    saldo: number
  }
}

export interface EvolutionData {
  mes: string
  receitas: number
  despesas: number
  saldo: number
}

export interface CategorySummary {
  categoria: string
  cor: string
  icone: string
  total: number
  porcentagem: number
  tipo: 'receita' | 'despesa'
}

export interface RecentTransaction {
  id: string
  titulo: string
  valor: number
  tipo: 'receita' | 'despesa'
  status: 'pago' | 'pendente' | 'vencido'
  data: string
  category: {
    nome: string
    cor: string
    icone: string
  } | null
  account: {
    nome: string
    cor: string
  }
}

export interface UpcomingTransaction {
  id: string
  titulo: string
  valor: number
  tipo: 'receita' | 'despesa'
  data: string
  category: {
    nome: string
    cor: string
    icone: string
  } | null
  account: {
    nome: string
  }
}

export interface BudgetStatus {
  id: string
  nome: string
  valor_limite: number
  valor_gasto: number
  progresso_percentual: number
  status: 'ok' | 'alerta' | 'ultrapassado'
  categoria_principal?: {
    nome: string
    cor: string
    icone: string
  }
}

export const useDashboard = () => {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [evolution, setEvolution] = useState<EvolutionData[]>([])
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [upcomingTransactions, setUpcomingTransactions] = useState<UpcomingTransaction[]>([])
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([])

  const loadDashboardSummary = async () => {
    if (!user) return

    try {
      const now = new Date()
      const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const currentMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')
      
      const previousMonth = subMonths(now, 1)
      const previousMonthStart = format(startOfMonth(previousMonth), 'yyyy-MM-dd')
      const previousMonthEnd = format(endOfMonth(previousMonth), 'yyyy-MM-dd')

      // Transações do mês atual
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('valor, tipo')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('data', currentMonthStart)
        .lte('data', currentMonthEnd)

      // Transações do mês anterior
      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('valor, tipo')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('data', previousMonthStart)
        .lte('data', previousMonthEnd)

      // Saldo consolidado de todas as contas
      const { data: accounts } = await supabase
        .from('accounts')
        .select('saldo')
        .eq('user_id', user.id)
        .eq('ativo', true)

      const totalReceitas = currentTransactions
        ?.filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const totalDespesas = currentTransactions
        ?.filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const previousReceitas = previousTransactions
        ?.filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const previousDespesas = previousTransactions
        ?.filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const saldoConsolidado = accounts
        ?.reduce((sum, account) => sum + Number(account.saldo), 0) || 0

      const saldoMesAtual = totalReceitas - totalDespesas
      const saldoMesAnterior = previousReceitas - previousDespesas

      setSummary({
        totalReceitas,
        totalDespesas,
        saldoMesAtual,
        saldoConsolidado,
        comparativoComMesAnterior: {
          receitas: previousReceitas > 0 ? ((totalReceitas - previousReceitas) / previousReceitas) * 100 : 0,
          despesas: previousDespesas > 0 ? ((totalDespesas - previousDespesas) / previousDespesas) * 100 : 0,
          saldo: saldoMesAnterior !== 0 ? ((saldoMesAtual - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100 : 0
        }
      })

    } catch (error: any) {
      console.error('Erro ao carregar resumo do dashboard:', error)
      toast.error('Erro ao carregar resumo financeiro')
    }
  }

  const loadEvolutionData = async () => {
    if (!user) return

    try {
      const evolutionData: EvolutionData[] = []

      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const monthStart = format(startOfMonth(date), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd')
        const monthName = format(date, 'MMM/yy', { locale: ptBR })

        const { data: transactions } = await supabase
          .from('transactions')
          .select('valor, tipo')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .gte('data', monthStart)
          .lte('data', monthEnd)

        const receitas = transactions
          ?.filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + Number(t.valor), 0) || 0

        const despesas = transactions
          ?.filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + Number(t.valor), 0) || 0

        evolutionData.push({
          mes: monthName,
          receitas,
          despesas,
          saldo: receitas - despesas
        })
      }

      setEvolution(evolutionData)

    } catch (error: any) {
      console.error('Erro ao carregar evolução financeira:', error)
      toast.error('Erro ao carregar evolução financeira')
    }
  }

  const loadCategorySummary = async () => {
    if (!user) return

    try {
      const now = new Date()
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          valor,
          tipo,
          categories(nome, cor, icone)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('data', monthStart)
        .lte('data', monthEnd)
        .not('category_id', 'is', null)

      const categoryMap = new Map<string, {
        nome: string
        cor: string
        icone: string
        total: number
        tipo: 'receita' | 'despesa'
      }>()

      transactions?.forEach(transaction => {
        if (!transaction.categories) return

        const key = `${transaction.categories.nome}-${transaction.tipo}`
        const existing = categoryMap.get(key)

        if (existing) {
          existing.total += Number(transaction.valor)
        } else {
          categoryMap.set(key, {
            nome: transaction.categories.nome,
            cor: transaction.categories.cor,
            icone: transaction.categories.icone,
            total: Number(transaction.valor),
            tipo: transaction.tipo
          })
        }
      })

      const totalGeral = Array.from(categoryMap.values())
        .reduce((sum, cat) => sum + cat.total, 0)

      const categoryData: CategorySummary[] = Array.from(categoryMap.values())
        .map(cat => ({
          categoria: cat.nome,
          cor: cat.cor,
          icone: cat.icone,
          total: cat.total,
          porcentagem: totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0,
          tipo: cat.tipo
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 8) // Top 8 categorias

      setCategorySummary(categoryData)

    } catch (error: any) {
      console.error('Erro ao carregar resumo por categoria:', error)
      toast.error('Erro ao carregar resumo por categoria')
    }
  }

  const loadRecentTransactions = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('transactions')
        .select(`
          id,
          titulo,
          valor,
          tipo,
          status,
          data,
          categories(nome, cor, icone),
          accounts!inner(nome, cor)
        `)
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(10)

      const formattedTransactions: RecentTransaction[] = data?.map(t => ({
        id: t.id,
        titulo: t.titulo,
        valor: Number(t.valor),
        tipo: t.tipo,
        status: t.status,
        data: t.data,
        category: t.categories ? {
          nome: t.categories.nome,
          cor: t.categories.cor,
          icone: t.categories.icone
        } : null,
        account: {
          nome: t.accounts.nome,
          cor: t.accounts.cor
        }
      })) || []

      setRecentTransactions(formattedTransactions)

    } catch (error: any) {
      console.error('Erro ao carregar transações recentes:', error)
      toast.error('Erro ao carregar transações recentes')
    }
  }

  const loadUpcomingTransactions = async () => {
    if (!user) return

    try {
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      const { data } = await supabase
        .from('transactions')
        .select(`
          id,
          titulo,
          valor,
          tipo,
          data,
          categories(nome, cor, icone),
          accounts!inner(nome)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pendente')
        .gte('data', format(today, 'yyyy-MM-dd'))
        .lte('data', format(nextWeek, 'yyyy-MM-dd'))
        .order('data', { ascending: true })
        .limit(5)

      const formattedTransactions: UpcomingTransaction[] = data?.map(t => ({
        id: t.id,
        titulo: t.titulo,
        valor: Number(t.valor),
        tipo: t.tipo,
        data: t.data,
        category: t.categories ? {
          nome: t.categories.nome,
          cor: t.categories.cor,
          icone: t.categories.icone
        } : null,
        account: {
          nome: t.accounts.nome
        }
      })) || []

      setUpcomingTransactions(formattedTransactions)

    } catch (error: any) {
      console.error('Erro ao carregar próximas transações:', error)
      toast.error('Erro ao carregar próximas transações')
    }
  }

  const loadBudgetStatus = async () => {
    if (!user) return

    try {
      const now = new Date()
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

      const { data: budgets } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .gte('data_inicio', monthStart)
        .lte('data_inicio', monthEnd)

      if (!budgets) return

      const budgetStatusData: BudgetStatus[] = []

      for (const budget of budgets) {
        // Calcular gasto atual do orçamento
        let query = supabase
          .from('transactions')
          .select('valor')
          .eq('user_id', user.id)
          .eq('tipo', 'despesa')
          .eq('status', 'pago')
          .gte('data', budget.data_inicio)

        if (budget.data_fim) {
          query = query.lte('data', budget.data_fim)
        }

        if (budget.category_ids && budget.category_ids.length > 0) {
          query = query.in('category_id', budget.category_ids)
        }

        if (budget.account_ids && budget.account_ids.length > 0) {
          query = query.in('account_id', budget.account_ids)
        }

        const { data: transactions } = await query

        const valorGasto = transactions?.reduce((sum, t) => sum + Number(t.valor), 0) || 0
        const progressoPercentual = budget.valor_limite > 0 
          ? Math.min((valorGasto / budget.valor_limite) * 100, 100)
          : 0

        let status: 'ok' | 'alerta' | 'ultrapassado' = 'ok'
        if (valorGasto > budget.valor_limite) {
          status = 'ultrapassado'
        } else if (progressoPercentual >= budget.percentual_alerta) {
          status = 'alerta'
        }

        // Buscar categoria principal se houver
        let categoriaPrincipal = null
        if (budget.category_ids && budget.category_ids.length > 0) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('nome, cor, icone')
            .eq('id', budget.category_ids[0])
            .single()
          
          if (categoryData) {
            categoriaPrincipal = categoryData
          }
        }

        budgetStatusData.push({
          id: budget.id,
          nome: budget.nome,
          valor_limite: budget.valor_limite,
          valor_gasto: valorGasto,
          progresso_percentual: progressoPercentual,
          status,
          categoria_principal: categoriaPrincipal
        })
      }

      setBudgetStatus(budgetStatusData)

    } catch (error: any) {
      console.error('Erro ao carregar status dos orçamentos:', error)
      toast.error('Erro ao carregar status dos orçamentos')
    }
  }

  const loadAllDashboardData = async () => {
    if (!user) return

    setLoading(true)
    try {
      await Promise.all([
        loadDashboardSummary(),
        loadEvolutionData(),
        loadCategorySummary(),
        loadRecentTransactions(),
        loadUpcomingTransactions(),
        loadBudgetStatus()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadAllDashboardData()
    }
  }, [user])

  return {
    loading,
    summary,
    evolution,
    categorySummary,
    recentTransactions,
    upcomingTransactions,
    budgetStatus,
    loadAllDashboardData
  }
}