import React from 'react'
import { Target, TrendingDown, CheckCircle, DollarSign } from 'lucide-react'

interface BudgetSummaryData {
  totalOrcado: number
  totalGasto: number
  totalRestante: number
  percentualGasto: number
  quantidadeOrcamentos: number
  orcamentosUltrapassados: number
  orcamentosEmAlerta: number
  orcamentosOk: number
}

interface BudgetSummaryProps {
  data: BudgetSummaryData
  loading?: boolean
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ data, loading = false }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="card"
            style={{
              transform: 'translateZ(0)',
              contain: 'layout style paint'
            }}
          >
            <div 
              className="animate-pulse"
              style={{
                willChange: 'opacity',
                contain: 'layout'
              }}
            >
              <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Orçado */}
      <div 
        className="card"
        style={{
          transform: 'translateZ(0)',
          contain: 'layout style paint'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Total Orçado</p>
            <p className="text-xl font-bold text-accent-fg dark:text-accent-dark-fg mt-1">
              {formatCurrency(data.totalOrcado)}
            </p>
            <p className="text-xs text-fg-muted dark:text-fg-dark-muted mt-1">
              {data.quantidadeOrcamentos} orçamento{data.quantidadeOrcamentos !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-10 h-10 bg-accent-subtle dark:bg-accent-dark-subtle rounded-lg flex items-center justify-center">
            <Target className="h-5 w-5 text-accent-fg dark:text-accent-dark-fg" />
          </div>
        </div>
      </div>

      {/* Total Gasto */}
      <div 
        className="card"
        style={{
          transform: 'translateZ(0)',
          contain: 'layout style paint'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Total Gasto</p>
            <p className="text-2xl font-bold text-danger-fg dark:text-danger-dark-fg mt-2">
              {formatCurrency(data.totalGasto)}
            </p>
            <p className="text-xs text-fg-muted dark:text-fg-dark-muted mt-1">
              {data.percentualGasto.toFixed(1)}% do orçado
            </p>
          </div>
          <div className="w-12 h-12 bg-danger-subtle dark:bg-danger-dark-subtle rounded-lg flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-danger-fg dark:text-danger-dark-fg" />
          </div>
        </div>
      </div>

      {/* Total Restante */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Total Restante</p>
            <p className={`text-2xl font-bold mt-2 ${
              data.totalRestante >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`}>
              {formatCurrency(data.totalRestante)}
            </p>
            <p className="text-xs text-fg-muted dark:text-fg-dark-muted mt-1">
              {data.totalRestante >= 0 ? 'Dentro do orçamento' : 'Acima do orçamento'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            data.totalRestante >= 0 ? 'bg-success-subtle dark:bg-success-dark-subtle' : 'bg-danger-subtle dark:bg-danger-dark-subtle'
          }`}>
            <DollarSign className={`h-6 w-6 ${
              data.totalRestante >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`} />
          </div>
        </div>
      </div>

      {/* Status dos Orçamentos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Status dos Orçamentos</p>
          <div className="w-12 h-12 bg-neutral-subtle dark:bg-neutral-dark-subtle rounded-lg flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-fg-muted dark:text-fg-dark-muted" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-success-emphasis dark:bg-success-dark-emphasis rounded-full mr-2"></div>
              <span className="text-xs text-fg-muted dark:text-fg-dark-muted">No Limite</span>
            </div>
            <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">{data.orcamentosOk}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-attention-emphasis dark:bg-attention-dark-emphasis rounded-full mr-2"></div>
              <span className="text-xs text-fg-muted dark:text-fg-dark-muted">Em Alerta</span>
            </div>
            <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">{data.orcamentosEmAlerta}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-danger-emphasis dark:bg-danger-dark-emphasis rounded-full mr-2"></div>
              <span className="text-xs text-fg-muted dark:text-fg-dark-muted">Ultrapassados</span>
            </div>
            <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">{data.orcamentosUltrapassados}</span>
          </div>
        </div>
      </div>
    </div>
  )
}