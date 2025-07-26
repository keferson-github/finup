import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
// Removido import de dados mock - usando apenas dados reais

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
  categoria: {
    nome: string
    cor: string
    icone: string
  } | null
  conta: {
    nome: string
    cor: string
  } | null
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
    cor: string
  } | null
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

    console.log('🔄 Carregando resumo de categorias...')
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

      // Se não há transações reais, exibir lista vazia
      if (!transactions || transactions.length === 0) {
        console.log('Nenhuma transação encontrada para o período')
        setCategorySummary([])
        return
      }

      const categoryMap = new Map<string, {
        nome: string
        cor: string
        icone: string
        total: number
        tipo: 'receita' | 'despesa'
      }>()

      transactions?.forEach(transaction => {
        if (!transaction.categories || !Array.isArray(transaction.categories) || transaction.categories.length === 0) return

        const category = transaction.categories[0]
        const key = `${category.nome}-${transaction.tipo}`
        const existing = categoryMap.get(key)

        if (existing) {
          existing.total += Number(transaction.valor)
        } else {
          categoryMap.set(key, {
            nome: category.nome,
            cor: category.cor,
            icone: category.icone,
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

      console.log('✅ Resumo de categorias carregado:', categoryData.length, 'categorias')
      setCategorySummary(categoryData)

    } catch (error: any) {
      console.error('Erro ao carregar resumo por categoria:', error)
      toast.error('Erro ao carregar resumo por categoria')
      
      // Em caso de erro, exibir lista vazia
      setCategorySummary([])
    }
  }

  const loadRecentTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          titulo,
          valor,
          tipo,
          status,
          data,
          criado_em,
          categories(nome, cor, icone),
          accounts(nome, cor)
        `)
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Erro na consulta Supabase:', error)
        throw error
      }

      const formattedTransactions: RecentTransaction[] = data?.map(t => ({
        id: t.id,
        titulo: t.titulo || 'Transação sem título',
        valor: Number(t.valor) || 0,
        tipo: t.tipo,
        status: t.status,
        data: t.data,
        categoria: t.categories ? {
          nome: (t.categories as any)?.nome || 'Categoria sem nome',
          cor: (t.categories as any)?.cor || '#6B7280',
          icone: (t.categories as any)?.icone || '📊'
        } : null,
        conta: t.accounts ? {
          nome: (t.accounts as any)?.nome || 'Conta não informada',
          cor: (t.accounts as any)?.cor || '#6B7280'
        } : null
      })) || []

      console.log(`Carregadas ${formattedTransactions.length} transações recentes`)
      setRecentTransactions(formattedTransactions)

    } catch (error: any) {
      console.error('Erro ao carregar transações recentes:', error)
      toast.error('Erro ao carregar transações recentes')
      setRecentTransactions([])
    }
  }

  const loadUpcomingTransactions = async () => {
    if (!user) return

    try {
      const today = new Date()
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          titulo,
          valor,
          tipo,
          data,
          criado_em,
          categories(nome, cor, icone),
          accounts(nome, cor)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pendente')
        .gte('data', format(today, 'yyyy-MM-dd'))
        .lte('data', format(nextMonth, 'yyyy-MM-dd'))
        .order('data', { ascending: true })
        .limit(50)

      if (error) {
        console.error('Erro do Supabase ao carregar próximas transações:', error)
        toast.error('Erro ao carregar próximas transações')
        setUpcomingTransactions([])
        return
      }

      const formattedTransactions: UpcomingTransaction[] = data?.map(t => ({
        id: t.id,
        titulo: t.titulo || 'Transação sem título',
        valor: Number(t.valor) || 0,
        tipo: t.tipo,
        data: t.data,
        category: t.categories ? {
          nome: (t.categories as any)?.nome || 'Categoria sem nome',
          cor: (t.categories as any)?.cor || '#6B7280',
          icone: (t.categories as any)?.icone || '📊'
        } : null,
        account: t.accounts ? {
          nome: (t.accounts as any)?.nome || 'Conta não informada',
          cor: (t.accounts as any)?.cor || '#6B7280'
        } : null
      })) || []

      console.log(`Carregadas ${formattedTransactions.length} próximas transações`)
      setUpcomingTransactions(formattedTransactions)

    } catch (error: any) {
      console.error('Erro ao carregar próximas transações:', error)
      toast.error('Erro ao carregar próximas transações')
      setUpcomingTransactions([])
    }
  }

  const loadBudgetStatus = async () => {
    if (!user) return

    try {
      const now = new Date()
      const currentMonthStart = format(startOfMonth(now), 'yyyy-MM-dd')
      const currentMonthEnd = format(endOfMonth(now), 'yyyy-MM-dd')

      // Buscar todos os orçamentos ativos do usuário
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(20)

      if (budgetsError) {
        console.error('Erro do Supabase ao carregar orçamentos:', budgetsError)
        toast.error('Erro ao carregar orçamentos')
        setBudgetStatus([])
        return
      }

      if (!budgets || budgets.length === 0) {
        setBudgetStatus([])
        return
      }

      const budgetStatusData: BudgetStatus[] = []

      for (const budget of budgets) {
        if (!budget || !budget.id) continue
        
        // Determinar período de análise baseado no tipo de orçamento
        let dataInicio: string
        let dataFim: string
        
        switch (budget.periodo) {
          case 'mensal':
            dataInicio = currentMonthStart
            dataFim = currentMonthEnd
            break
          case 'semanal':
            const weekStart = new Date(now)
            weekStart.setDate(now.getDate() - now.getDay())
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekStart.getDate() + 6)
            dataInicio = format(weekStart, 'yyyy-MM-dd')
            dataFim = format(weekEnd, 'yyyy-MM-dd')
            break
          case 'anual':
            dataInicio = format(new Date(now.getFullYear(), 0, 1), 'yyyy-MM-dd')
            dataFim = format(new Date(now.getFullYear(), 11, 31), 'yyyy-MM-dd')
            break
          default:
            dataInicio = budget.data_inicio || currentMonthStart
            dataFim = budget.data_fim || currentMonthEnd
        }
        
        // Calcular gasto atual do orçamento
        let query = supabase
          .from('transactions')
          .select('valor')
          .eq('user_id', user.id)
          .eq('tipo', 'despesa')
          .in('status', ['pago', 'pendente']) // Incluir pendentes para melhor controle
          .gte('data', dataInicio)
          .lte('data', dataFim)

        // Filtrar por categorias se especificado
        if (budget.category_ids && Array.isArray(budget.category_ids) && budget.category_ids.length > 0) {
          query = query.in('category_id', budget.category_ids)
        }

        // Filtrar por contas se especificado
        if (budget.account_ids && Array.isArray(budget.account_ids) && budget.account_ids.length > 0) {
          query = query.in('account_id', budget.account_ids)
        }

        const { data: transactions, error: transactionsError } = await query

        if (transactionsError) {
          console.error('Erro ao buscar transações do orçamento:', transactionsError)
          continue
        }

        const valorGasto = transactions?.reduce((sum, t) => sum + (Number(t.valor) || 0), 0) || 0
        const valorLimite = Number(budget.valor_limite) || 0
        const progressoPercentual = valorLimite > 0 
          ? (valorGasto / valorLimite) * 100
          : 0

        let status: 'ok' | 'alerta' | 'ultrapassado' = 'ok'
        if (valorGasto > valorLimite) {
          status = 'ultrapassado'
        } else if (progressoPercentual >= (Number(budget.percentual_alerta) || 80)) {
          status = 'alerta'
        }

        // Buscar categoria principal se houver
        let categoriaPrincipal: { nome: string; cor: string; icone: string } | undefined = undefined
        if (budget.category_ids && budget.category_ids.length > 0) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('nome, cor, icone')
            .eq('id', budget.category_ids[0])
            .single()
          
          if (categoryData) {
            categoriaPrincipal = {
              nome: categoryData.nome || 'Categoria sem nome',
              cor: categoryData.cor || '#6B7280',
              icone: categoryData.icone || '📊'
            }
          }
        }

        budgetStatusData.push({
          id: budget.id,
          nome: budget.nome || 'Orçamento sem nome',
          valor_limite: valorLimite,
          valor_gasto: valorGasto,
          progresso_percentual: Math.min(progressoPercentual, 999), // Limitar para evitar valores muito altos
          status,
          categoria_principal: categoriaPrincipal
        })
      }

      console.log(`Carregados ${budgetStatusData.length} status de orçamentos`)
      setBudgetStatus(budgetStatusData)

    } catch (error: any) {
      console.error('Erro ao carregar status dos orçamentos:', error)
      toast.error('Erro ao carregar status dos orçamentos')
      setBudgetStatus([])
    }
  }

  const loadAllDashboardData = useCallback(async () => {
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
  }, [user])

  // Função para atualização silenciosa (sem loading)
  const refreshDashboardSilently = useCallback(async () => {
    if (!user) return

    console.log('🔄 Iniciando refresh silencioso do dashboard...')
    try {
      await Promise.all([
        loadDashboardSummary(),
        loadEvolutionData(),
        loadCategorySummary(),
        loadRecentTransactions(),
        loadUpcomingTransactions(),
        loadBudgetStatus()
      ])
      console.log('✅ Refresh silencioso do dashboard concluído')
    } catch (error) {
      console.error('Erro ao atualizar dados do dashboard:', error)
    }
  }, [user])

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user) return

    // Subscription para transações
    const transactionsSubscription = supabase
      .channel('dashboard-transactions')
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
          console.log('🔔 Transação modificada - atualizando dashboard', payload.eventType, transactionTitle)
          setTimeout(() => {
            console.log('🔄 Executando refresh do dashboard devido a mudança em transação')
            refreshDashboardSilently()
          }, 100)
        }
      )
      .subscribe()

    // Subscription para contas
    const accountsSubscription = supabase
      .channel('dashboard-accounts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const accountName = (payload.new as any)?.nome || (payload.old as any)?.nome || 'Conta desconhecida'
          console.log('🔔 Conta modificada - atualizando dashboard', payload.eventType, accountName)
          setTimeout(() => {
            console.log('🔄 Executando refresh do dashboard devido a mudança em conta')
            refreshDashboardSilently()
          }, 100)
        }
      )
      .subscribe()

    // Subscription para categorias
    const categoriesSubscription = supabase
      .channel('dashboard-categories')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Categoria modificada - atualizando dashboard', payload)
          setTimeout(() => {
            console.log('Executando refresh silencioso do dashboard devido a mudança em categoria')
            refreshDashboardSilently()
          }, 100)
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(transactionsSubscription)
      supabase.removeChannel(accountsSubscription)
      supabase.removeChannel(categoriesSubscription)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadAllDashboardData()
    }
  }, [user, loadAllDashboardData])

  return {
    loading,
    summary,
    evolution,
    categorySummary,
    recentTransactions,
    upcomingTransactions,
    budgetStatus,
    loadAllDashboardData,
    refreshDashboardSilently
  }
}