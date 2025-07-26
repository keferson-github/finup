import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock, Filter, TrendingUp, TrendingDown, CheckCircle, Eye } from 'lucide-react'
import { UpcomingTransaction } from '../../hooks/useDashboard'

type FilterType = 'todos' | 'receita' | 'despesa'
type PeriodFilter = '7dias' | '15dias' | '30dias'

interface UpcomingTransactionsProps {
  data: UpcomingTransaction[]
  loading: boolean
}

export const UpcomingTransactions: React.FC<UpcomingTransactionsProps> = ({ data, loading }) => {
  const [typeFilter, setTypeFilter] = useState<FilterType>('todos')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('7dias')
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(10)

  const formatCurrency = (amount: number) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(validAmount)
  }

  // Filtrar dados baseado nos filtros selecionados
  const filteredData = useMemo(() => {
    if (!data) return []
    
    let filtered = data.filter(transaction => transaction && transaction.id)
    
    // Filtro por tipo
    if (typeFilter !== 'todos') {
      filtered = filtered.filter(transaction => transaction.tipo === typeFilter)
    }
    
    // Filtro por período (baseado na data)
    const today = new Date()
    const periodDays = periodFilter === '7dias' ? 7 : periodFilter === '15dias' ? 15 : 30
    const maxDate = new Date(today.getTime() + periodDays * 24 * 60 * 60 * 1000)
    
    filtered = filtered.filter(transaction => {
      const transactionDate = new Date(transaction.data)
      return transactionDate >= today && transactionDate <= maxDate
    })
    
    return filtered
  }, [data, typeFilter, periodFilter])

  // Calcular estatísticas dos dados filtrados
  const statistics = useMemo(() => {
    const totalTransactions = filteredData.length
    const totalReceitas = filteredData
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + (t.valor || 0), 0)
    const totalDespesas = filteredData
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + (t.valor || 0), 0)
    const receitasCount = filteredData.filter(t => t.tipo === 'receita').length
    const despesasCount = filteredData.filter(t => t.tipo === 'despesa').length
    
    return {
      totalTransactions,
      totalReceitas,
      totalDespesas,
      receitasCount,
      despesasCount
    }
  }, [filteredData])

  // Dados para exibição (limitados pelo displayCount)
  const displayData = useMemo(() => {
    return filteredData.slice(0, displayCount)
  }, [filteredData, displayCount])

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-lg p-0 h-full">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Próximas Transações</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 dark:bg-bg-dark-subtle rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-neutral-muted dark:bg-neutral-dark-muted rounded-lg mr-4"></div>
                  <div>
                    <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-20 mb-2"></div>
                  <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-lg h-[600px] flex flex-col">
      {/* Header fixo */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
            <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Próximas Transações</h3>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-bg-subtle dark:bg-bg-dark-subtle hover:bg-bg-muted dark:hover:bg-bg-dark-muted rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
        
        {/* Estatísticas Rápidas */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle p-3 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted mr-2" />
              <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Total</span>
            </div>
            <p className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">
              {statistics.totalTransactions}
            </p>
          </div>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle p-3 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-success-fg dark:text-success-dark-fg mr-2" />
              <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Receitas</span>
            </div>
            <p className="text-lg font-semibold text-success-fg dark:text-success-dark-fg">
              {formatCurrency(statistics.totalReceitas)}
            </p>
          </div>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle p-3 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-danger-fg dark:text-danger-dark-fg mr-2" />
              <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Despesas</span>
            </div>
            <p className="text-lg font-semibold text-danger-fg dark:text-danger-dark-fg">
              {formatCurrency(statistics.totalDespesas)}
            </p>
          </div>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle p-3 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted mr-2" />
              <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Saldo</span>
            </div>
            <p className={`text-lg font-semibold ${
              (statistics.totalReceitas - statistics.totalDespesas) >= 0
                ? 'text-success-fg dark:text-success-dark-fg'
                : 'text-danger-fg dark:text-danger-dark-fg'
            }`}>
              {formatCurrency(statistics.totalReceitas - statistics.totalDespesas)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Área de conteúdo com scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Filtros com altura fixa */}
        <div className="px-6 flex-shrink-0" style={{ height: showFilters ? '120px' : '0px', overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
          <div className="p-4 bg-bg-subtle dark:bg-bg-dark-subtle rounded-lg space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                  Tipo
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                  className="w-full px-3 py-2 bg-bg-default dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-md text-fg-default dark:text-fg-dark-default"
                >
                  <option value="todos">Todos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
              </div>
              <div className="flex-1 min-w-[120px]">
                <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                  Período
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                  className="w-full px-3 py-2 bg-bg-default dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-md text-fg-default dark:text-fg-dark-default"
                >
                  <option value="7dias">Próximos 7 dias</option>
                  <option value="15dias">Próximos 15 dias</option>
                  <option value="30dias">Próximos 30 dias</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de transações com scroll */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          {!filteredData || filteredData.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
              <p className="text-fg-muted dark:text-fg-dark-muted">Nenhuma transação agendada</p>
              <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">
                {periodFilter === '7dias' ? 'Próximos 7 dias' : periodFilter === '15dias' ? 'Próximos 15 dias' : 'Próximos 30 dias'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {displayData.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-bg-dark-subtle rounded-lg hover:bg-gray-100 dark:hover:bg-bg-dark-muted transition-colors">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: `${transaction.category?.cor || '#6B7280'}20` }}
                      >
                        {transaction.category ? (
                          <span className="text-lg">{transaction.category.icone}</span>
                        ) : (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: transaction.account?.cor || '#6B7280' }}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-fg-default dark:text-fg-dark-default">
                          {transaction.titulo || 'Transação sem título'}
                        </p>
                        <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
                          {transaction.category?.nome || 'Sem categoria'} • {transaction.account?.nome || 'Conta não informada'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          'bg-attention-subtle dark:bg-attention-dark-subtle text-attention-fg dark:text-attention-dark-fg'
                        }`}>
                          Pendente
                        </span>
                      </div>
                      <p className={`font-semibold mt-1 ${
                        transaction.tipo === 'receita' 
                          ? 'text-success-fg dark:text-success-dark-fg' 
                          : 'text-danger-fg dark:text-danger-dark-fg'
                      }`}>
                        {transaction.tipo === 'receita' ? '+' : '-'}
                        {formatCurrency(transaction.valor)}
                      </p>
                      <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
                        {transaction.data && !isNaN(new Date(transaction.data).getTime()) ? format(new Date(transaction.data), 'd MMM', { locale: ptBR }) : 'Data inválida'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Botão Mostrar Mais */}
              {filteredData.length > displayCount && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 10)}
                    className="inline-flex items-center px-4 py-2 bg-gray-50 dark:bg-bg-dark-subtle hover:bg-gray-100 dark:hover:bg-bg-dark-muted text-fg-default dark:text-fg-dark-default rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mostrar mais ({filteredData.length - displayCount} restantes)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}