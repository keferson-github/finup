import React, { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Clock, AlertCircle, CreditCard, Filter, TrendingUp, TrendingDown, Eye } from 'lucide-react'
import { RecentTransaction } from '../../hooks/useDashboard'

interface RecentTransactionsProps {
  data: RecentTransaction[]
  loading: boolean
}

type FilterType = 'all' | 'receita' | 'despesa'
type StatusFilter = 'all' | 'pago' | 'pendente' | 'vencido'

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  data, 
  loading
}) => {
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(10)

  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(validAmount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-success-fg dark:text-success-dark-fg" />
      case 'pendente':
        return <Clock className="h-4 w-4 text-attention-fg dark:text-attention-dark-fg" />
      case 'vencido':
        return <AlertCircle className="h-4 w-4 text-danger-fg dark:text-danger-dark-fg" />
      default:
        return <Clock className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
    }
  }

  // Filtrar dados
  const filteredData = data.filter(transaction => {
    if (typeFilter !== 'all' && transaction.tipo !== typeFilter) return false
    if (statusFilter !== 'all' && transaction.status !== statusFilter) return false
    return true
  })

  // Estatísticas dos dados filtrados
  const stats = {
    total: filteredData.length,
    receitas: filteredData.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0),
    despesas: filteredData.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0),
    pagas: filteredData.filter(t => t.status === 'pago').length,
    pendentes: filteredData.filter(t => t.status === 'pendente').length
  }

  // Dados para exibição (limitados pelo displayCount)
  const displayData = filteredData.slice(0, displayCount)



  if (loading) {
    return (
    <div className="bg-white dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-lg p-0">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Transações Recentes</h3>
        </div>
        <div className="p-6">
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
        {/* Cabeçalho com título e filtros */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">
              Todas as Transações Recentes
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
              {stats.total} transação{stats.total !== 1 ? 'ões' : ''} encontrada{stats.total !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-bg-subtle dark:bg-bg-dark-subtle hover:bg-bg-muted dark:hover:bg-bg-dark-muted rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-success-fg dark:text-success-dark-fg" />
              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">Receitas</span>
            </div>
            <p className="text-lg font-semibold text-success-fg dark:text-success-dark-fg">
              {formatCurrency(stats.receitas)}
            </p>
          </div>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-danger-fg dark:text-danger-dark-fg" />
              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">Despesas</span>
            </div>
            <p className="text-lg font-semibold text-danger-fg dark:text-danger-dark-fg">
              {formatCurrency(stats.despesas)}
            </p>
          </div>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success-fg dark:text-success-dark-fg" />
              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">Pagas</span>
            </div>
            <p className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">
              {stats.pagas}
            </p>
          </div>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-attention-fg dark:text-attention-dark-fg" />
              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">Pendentes</span>
            </div>
            <p className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">
              {stats.pendentes}
            </p>
          </div>
        </div>
      </div>
      
      {/* Área de conteúdo com scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Filtros com altura fixa */}
        <div className="px-6 flex-shrink-0" style={{ height: showFilters ? '140px' : '0px', overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
          <div className="bg-bg-subtle dark:bg-bg-dark-subtle rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                  Tipo de Transação
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                  className="w-full px-3 py-2 bg-bg-default dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-md text-fg-default dark:text-fg-dark-default"
                >
                  <option value="all">Todas</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-3 py-2 bg-bg-default dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-md text-fg-default dark:text-fg-dark-default"
                >
                  <option value="all">Todos</option>
                  <option value="pago">Pagas</option>
                  <option value="pendente">Pendentes</option>
                  <option value="vencido">Vencidas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                  Exibir
                </label>
                <select
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-bg-default dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-md text-fg-default dark:text-fg-dark-default"
                >
                  <option value={5}>5 transações</option>
                  <option value={10}>10 transações</option>
                  <option value={20}>20 transações</option>
                  <option value={50}>50 transações</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lista de transações com scroll */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-20 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
              <p className="text-fg-muted dark:text-fg-dark-muted">
                {data.length === 0 ? 'Nenhuma transação recente' : 'Nenhuma transação encontrada com os filtros aplicados'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {displayData.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-bg-dark-subtle rounded-lg hover:bg-gray-100 dark:hover:bg-bg-dark-muted transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-bg-default dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default">
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <p className="font-medium text-fg-default dark:text-fg-dark-default">
                          {transaction.titulo || 'Sem título'}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-fg-muted dark:text-fg-dark-muted">
                           <span>{transaction.categoria?.nome || 'Sem categoria'}</span>
                           <span>•</span>
                           <span>{transaction.conta?.nome || 'Sem conta'}</span>
                           <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.status === 'pago' 
                              ? 'bg-success-bg dark:bg-success-dark-bg text-success-fg dark:text-success-dark-fg'
                              : transaction.status === 'pendente'
                              ? 'bg-attention-bg dark:bg-attention-dark-bg text-attention-fg dark:text-attention-dark-fg'
                              : 'bg-danger-bg dark:bg-danger-dark-bg text-danger-fg dark:text-danger-dark-fg'
                          }`}>
                            {transaction.status === 'pago' ? 'Paga' : transaction.status === 'pendente' ? 'Pendente' : 'Vencida'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.tipo === 'receita' 
                          ? 'text-success-fg dark:text-success-dark-fg' 
                          : 'text-danger-fg dark:text-danger-dark-fg'
                      }`}>
                        {transaction.tipo === 'receita' ? '+' : '-'}{formatCurrency(transaction.valor)}
                      </p>
                      <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
                        {transaction.data ? format(new Date(transaction.data), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mostrar mais transações */}
              {filteredData.length > displayCount && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setDisplayCount(prev => Math.min(prev + 10, filteredData.length))}
                    className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium text-accent-fg dark:text-accent-dark-fg hover:bg-gray-50 dark:hover:bg-bg-dark-subtle rounded-md transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Mostrar mais ({filteredData.length - displayCount} restantes)</span>
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