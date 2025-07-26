import React, { useState, useMemo } from 'react'
import { Target, AlertTriangle, CheckCircle, Filter, DollarSign, ChevronDown } from 'lucide-react'
import { BudgetStatus as IBudgetStatus } from '../../hooks/useDashboard'

interface BudgetStatusProps {
  data: IBudgetStatus[]
  loading: boolean
}

type StatusFilter = 'todos' | 'ok' | 'alerta' | 'ultrapassado'
type SortBy = 'nome' | 'progresso' | 'valor_gasto' | 'valor_limite'

export const BudgetStatus: React.FC<BudgetStatusProps> = ({ data, loading }) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [sortBy, setSortBy] = useState<SortBy>('progresso')
  const [showFilters, setShowFilters] = useState(false)
  const [displayCount, setDisplayCount] = useState(5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  // Filtrar e ordenar dados
  const { filteredData, statistics } = useMemo(() => {
    let filtered = [...data]

    // Aplicar filtro de status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(budget => budget.status === statusFilter)
    }

    // Ordenar dados
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nome':
          return a.nome.localeCompare(b.nome)
        case 'progresso':
          return b.progresso_percentual - a.progresso_percentual
        case 'valor_gasto':
          return b.valor_gasto - a.valor_gasto
        case 'valor_limite':
          return b.valor_limite - a.valor_limite
        default:
          return 0
      }
    })

    // Calcular estatísticas
    const stats = {
      total: data.length,
      ok: data.filter(b => b.status === 'ok').length,
      alerta: data.filter(b => b.status === 'alerta').length,
      ultrapassado: data.filter(b => b.status === 'ultrapassado').length,
      totalLimite: data.reduce((sum, b) => sum + b.valor_limite, 0),
      totalGasto: data.reduce((sum, b) => sum + b.valor_gasto, 0),
      mediaProgresso: data.length > 0 ? data.reduce((sum, b) => sum + b.progresso_percentual, 0) / data.length : 0
    }

    return {
      filteredData: filtered,
      statistics: stats
    }
  }, [data, statusFilter, sortBy])

  const displayData = filteredData.slice(0, displayCount)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ultrapassado':
        return <AlertTriangle className="h-4 w-4 text-danger-fg dark:text-danger-dark-fg" />
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-attention-fg dark:text-attention-dark-fg" />
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-success-fg dark:text-success-dark-fg" />
      default:
        return <CheckCircle className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ultrapassado':
        return 'bg-danger-subtle dark:bg-danger-dark-subtle'
      case 'alerta':
        return 'bg-attention-subtle dark:bg-attention-dark-subtle'
      case 'ok':
        return 'bg-success-subtle dark:bg-success-dark-subtle'
      default:
        return 'bg-neutral-subtle dark:bg-neutral-dark-subtle'
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'ultrapassado':
        return 'bg-danger-emphasis dark:bg-danger-dark-emphasis'
      case 'alerta':
        return 'bg-attention-emphasis dark:bg-attention-dark-emphasis'
      case 'ok':
        return 'bg-success-emphasis dark:bg-success-dark-emphasis'
      default:
        return 'bg-neutral-emphasis dark:bg-neutral-dark-emphasis'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-lg">
        <div className="p-4 border-b border-border-default dark:border-border-dark-default">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Status dos Orçamentos</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-32"></div>
                <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-16"></div>
              </div>
              <div className="h-2 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-bg-dark-default border border-border-default dark:border-border-dark-default rounded-lg">
      <div className="p-4 border-b border-border-default dark:border-border-dark-default">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
            <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Status dos Orçamentos</h3>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="p-4 border-b border-border-default dark:border-border-dark-default">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Filtrar por Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 border border-border-default dark:border-border-dark-default rounded-md bg-bg-default dark:bg-bg-dark-default text-fg-default dark:text-fg-dark-default"
              >
                <option value="todos">Todos os Status</option>
                <option value="ok">✅ No Limite</option>
                <option value="alerta">⚠️ Em Alerta</option>
                <option value="ultrapassado">🚨 Ultrapassado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="w-full px-3 py-2 border border-border-default dark:border-border-dark-default rounded-md bg-bg-default dark:bg-bg-dark-default text-fg-default dark:text-fg-dark-default"
              >
                <option value="progresso">Progresso (%)</option>
                <option value="nome">Nome</option>
                <option value="valor_gasto">Valor Gasto</option>
                <option value="valor_limite">Valor Limite</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas Rápidas */}
      {data.length > 0 && (
        <div className="p-4 border-b border-border-default dark:border-border-dark-default">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted mr-1" />
                <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
                  {statistics.total}
                </span>
              </div>
              <p className="text-xs text-fg-muted dark:text-fg-dark-muted">Total</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="h-4 w-4 text-success-fg dark:text-success-dark-fg mr-1" />
                <span className="text-sm font-medium text-success-fg dark:text-success-dark-fg">
                  {statistics.ok}
                </span>
              </div>
              <p className="text-xs text-fg-muted dark:text-fg-dark-muted">No Limite</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <AlertTriangle className="h-4 w-4 text-attention-fg dark:text-attention-dark-fg mr-1" />
                <span className="text-sm font-medium text-attention-fg dark:text-attention-dark-fg">
                  {statistics.alerta + statistics.ultrapassado}
                </span>
              </div>
              <p className="text-xs text-fg-muted dark:text-fg-dark-muted">Atenção</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted mr-1" />
                <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
                  {statistics.mediaProgresso.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-fg-muted dark:text-fg-dark-muted">Média</p>
            </div>
          </div>
        </div>
      )}
      
      {data.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
          <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum orçamento ativo</p>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">
            Crie orçamentos para acompanhar seus gastos
          </p>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-8">
          <Filter className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
          <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum orçamento encontrado</p>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">
            Ajuste os filtros para ver mais resultados
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 p-4">
            {displayData.map((budget) => (
              <div key={budget.id} className="p-4 bg-gray-50 dark:bg-bg-dark-subtle rounded-lg hover:bg-gray-100 dark:hover:bg-bg-dark-muted transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getStatusColor(budget.status)}`}>
                      {getStatusIcon(budget.status)}
                    </div>
                    <div>
                      <p className="font-medium text-fg-default dark:text-fg-dark-default text-sm">
                        {budget.nome}
                      </p>
                      {budget.categoria_principal && (
                        <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                          {budget.categoria_principal.icone} {budget.categoria_principal.nome}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-fg-default dark:text-fg-dark-default">
                      {budget.progresso_percentual.toFixed(1)}%
                    </p>
                    <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                      {formatCurrency(budget.valor_gasto)} / {formatCurrency(budget.valor_limite)}
                    </p>
                  </div>
                </div>
                
                {/* Barra de Progresso */}
                <div className="w-full bg-neutral-muted dark:bg-neutral-dark-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${getProgressBarColor(budget.status)}`}
                    style={{ width: `${Math.min(budget.progresso_percentual, 100)}%` }}
                  />
                </div>
                
                {/* Status Badge */}
                <div className="mt-2 flex justify-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    budget.status === 'ultrapassado' ? 'bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg' :
                    budget.status === 'alerta' ? 'bg-attention-subtle dark:bg-attention-dark-subtle text-attention-fg dark:text-attention-dark-fg' :
                    'bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg'
                  }`}>
                    {budget.status === 'ultrapassado' ? '🚨 Ultrapassado' :
                     budget.status === 'alerta' ? '⚠️ Em Alerta' :
                     '✅ No Limite'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Mostrar Mais */}
          {filteredData.length > displayCount && (
            <div className="p-4 border-t border-border-default dark:border-border-dark-default">
              <button
                onClick={() => setDisplayCount(prev => prev + 5)}
                className="w-full flex items-center justify-center py-2 px-4 text-sm font-medium text-accent-fg dark:text-accent-dark-fg hover:bg-gray-50 dark:hover:bg-bg-dark-subtle rounded-md transition-colors"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Mostrar Mais ({filteredData.length - displayCount} restantes)
              </button>
            </div>
          )}

          {/* Resumo dos Valores */}
          {data.length > 0 && (
            <div className="p-4 border-t border-border-default dark:border-border-dark-default bg-gray-50 dark:bg-bg-dark-subtle">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Total Orçado:</span>
                  <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
                    {formatCurrency(statistics.totalLimite)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Total Gasto:</span>
                  <span className={`text-sm font-medium ${
                    statistics.totalGasto > statistics.totalLimite 
                      ? 'text-danger-fg dark:text-danger-dark-fg' 
                      : 'text-success-fg dark:text-success-dark-fg'
                  }`}>
                    {formatCurrency(statistics.totalGasto)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}