import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { format, startOfMonth, endOfMonth, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

export interface ReportSummary {
  totalReceitas: number
  totalDespesas: number
  saldoFinal: number
  comparacaoMesAnterior: {
    receitas: number
    despesas: number
    saldo: number
  }
}

export interface CategoryReport {
  categoria: string
  cor: string
  icone: string
  total: number
  porcentagem: number
  tipo: 'receita' | 'despesa'
}

export interface AccountReport {
  conta: string
  cor: string
  saldoAtual: number
  totalMovimentacoes: number
  receitas: number
  despesas: number
}

export interface EvolutionData {
  mes: string
  receitas: number
  despesas: number
  saldo: number
}

export interface ReportFilters {
  dataInicio: string
  dataFim: string
  tipo?: 'receita' | 'despesa' | ''
  categoriaId?: string
  contaId?: string
}

export const useReports = () => {
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([])
  const [accountReports, setAccountReports] = useState<AccountReport[]>([])
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([])

  const generateSummaryReport = async (filters: ReportFilters) => {
    if (!user) return

    try {
      setLoading(true)

      // Dados do período atual
      const { data: currentTransactions } = await supabase
        .from('transactions')
        .select('valor, tipo')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('data', filters.dataInicio)
        .lte('data', filters.dataFim)

      const totalReceitas = currentTransactions
        ?.filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const totalDespesas = currentTransactions
        ?.filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      // Dados do período anterior (mesmo intervalo, mas mês anterior)
      const startDate = parseISO(filters.dataInicio)
      const endDate = parseISO(filters.dataFim)
      const previousStart = format(subMonths(startDate, 1), 'yyyy-MM-dd')
      const previousEnd = format(subMonths(endDate, 1), 'yyyy-MM-dd')

      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('valor, tipo')
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('data', previousStart)
        .lte('data', previousEnd)

      const previousReceitas = previousTransactions
        ?.filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const previousDespesas = previousTransactions
        ?.filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + Number(t.valor), 0) || 0

      const previousSaldo = previousReceitas - previousDespesas

      setSummary({
        totalReceitas,
        totalDespesas,
        saldoFinal: totalReceitas - totalDespesas,
        comparacaoMesAnterior: {
          receitas: previousReceitas > 0 ? ((totalReceitas - previousReceitas) / previousReceitas) * 100 : 0,
          despesas: previousDespesas > 0 ? ((totalDespesas - previousDespesas) / previousDespesas) * 100 : 0,
          saldo: previousSaldo !== 0 ? (((totalReceitas - totalDespesas) - previousSaldo) / Math.abs(previousSaldo)) * 100 : 0
        }
      })

    } catch (error: any) {
      console.error('Erro ao gerar relatório resumo:', error)
      toast.error('Erro ao carregar relatório resumo')
    } finally {
      setLoading(false)
    }
  }

  const generateCategoryReport = async (filters: ReportFilters) => {
    if (!user) return

    try {
      setLoading(true)

      let query = supabase
        .from('transactions')
        .select(`
          valor,
          tipo,
          categories(nome, cor, icone)
        `)
        .eq('user_id', user.id)
        .eq('status', 'pago')
        .gte('data', filters.dataInicio)
        .lte('data', filters.dataFim)
        .not('category_id', 'is', null)

      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo)
      }

      if (filters.categoriaId) {
        query = query.eq('category_id', filters.categoriaId)
      }

      const { data } = await query

      // Agrupar por categoria
      const categoryMap = new Map<string, {
        nome: string
        cor: string
        icone: string
        total: number
        tipo: 'receita' | 'despesa'
      }>()

      data?.forEach(transaction => {
        if (!transaction.categories) return

        const key = transaction.categories.nome
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

      // Calcular total geral para porcentagens
      const totalGeral = Array.from(categoryMap.values())
        .reduce((sum, cat) => sum + cat.total, 0)

      const reports: CategoryReport[] = Array.from(categoryMap.values())
        .map(cat => ({
          categoria: cat.nome,
          cor: cat.cor,
          icone: cat.icone,
          total: cat.total,
          porcentagem: totalGeral > 0 ? (cat.total / totalGeral) * 100 : 0,
          tipo: cat.tipo
        }))
        .sort((a, b) => b.total - a.total)

      setCategoryReports(reports)

    } catch (error: any) {
      console.error('Erro ao gerar relatório por categoria:', error)
      toast.error('Erro ao carregar relatório por categoria')
    } finally {
      setLoading(false)
    }
  }

  const generateAccountReport = async (filters: ReportFilters) => {
    if (!user) return

    try {
      setLoading(true)

      // Buscar contas
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, nome, cor, saldo')
        .eq('user_id', user.id)
        .eq('ativo', true)

      if (!accounts) return

      const reports: AccountReport[] = []

      for (const account of accounts) {
        let query = supabase
          .from('transactions')
          .select('valor, tipo')
          .eq('user_id', user.id)
          .eq('account_id', account.id)
          .eq('status', 'pago')
          .gte('data', filters.dataInicio)
          .lte('data', filters.dataFim)

        if (filters.tipo) {
          query = query.eq('tipo', filters.tipo)
        }

        const { data: transactions } = await query

        const receitas = transactions
          ?.filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + Number(t.valor), 0) || 0

        const despesas = transactions
          ?.filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + Number(t.valor), 0) || 0

        reports.push({
          conta: account.nome,
          cor: account.cor,
          saldoAtual: Number(account.saldo),
          totalMovimentacoes: transactions?.length || 0,
          receitas,
          despesas
        })
      }

      setAccountReports(reports.sort((a, b) => b.saldoAtual - a.saldoAtual))

    } catch (error: any) {
      console.error('Erro ao gerar relatório por conta:', error)
      toast.error('Erro ao carregar relatório por conta')
    } finally {
      setLoading(false)
    }
  }

  const generateEvolutionReport = async (months: number = 12) => {
    if (!user) return

    try {
      setLoading(true)

      const evolutionData: EvolutionData[] = []

      for (let i = months - 1; i >= 0; i--) {
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

      setEvolutionData(evolutionData)

    } catch (error: any) {
      console.error('Erro ao gerar relatório de evolução:', error)
      toast.error('Erro ao carregar relatório de evolução')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'csv' | 'excel', type: 'summary' | 'category' | 'account' | 'evolution') => {
    if (!user) return

    try {
      let data: any = null
      let filename = ''

      switch (type) {
        case 'summary':
          data = summary
          filename = `relatorio-resumo-${format}`
          break
        case 'category':
          data = categoryReports
          filename = `relatorio-categorias-${format}`
          break
        case 'account':
          data = accountReports
          filename = `relatorio-contas-${format}`
          break
        case 'evolution':
          data = evolutionData
          filename = `relatorio-evolucao-${format}`
          break
      }

      if (!data) {
        toast.error('Nenhum dado disponível para exportação')
        return
      }

      if (format === 'csv') {
        exportToCSV(data, filename)
      } else {
        toast.info('Exportação em PDF/Excel será implementada em breve')
      }

    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error)
      toast.error('Erro ao exportar relatório')
    }
  }

  const exportToCSV = (data: any, filename: string) => {
    let csvContent = ''

    if (Array.isArray(data)) {
      if (data.length === 0) return

      // Headers
      const headers = Object.keys(data[0])
      csvContent = headers.join(',') + '\n'

      // Data
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header]
          return typeof value === 'string' ? `"${value}"` : value
        })
        csvContent += values.join(',') + '\n'
      })
    } else {
      // Single object
      csvContent = 'Campo,Valor\n'
      Object.entries(data).forEach(([key, value]) => {
        csvContent += `"${key}","${value}"\n`
      })
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Relatório exportado com sucesso!')
  }

  return {
    loading,
    summary,
    categoryReports,
    accountReports,
    evolutionData,
    generateSummaryReport,
    generateCategoryReport,
    generateAccountReport,
    generateEvolutionReport,
    exportReport
  }
}