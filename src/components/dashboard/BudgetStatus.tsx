import React from 'react'
import { Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { BudgetStatus as IBudgetStatus } from '../../hooks/useDashboard'

interface BudgetStatusProps {
  data: IBudgetStatus[]
  loading: boolean
}

export const BudgetStatus: React.FC<BudgetStatusProps> = ({ data, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

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
      <div className="card">
        <div className="card-header">
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
    <div className="card">
      <div className="card-header">
        <div className="flex items-center">
          <Target className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Status dos Orçamentos</h3>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
          <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum orçamento ativo</p>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">
            Crie orçamentos para acompanhar seus gastos
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((budget) => (
            <div key={budget.id} className="p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}