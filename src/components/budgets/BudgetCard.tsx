import React from 'react'
import { Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { BudgetWithProgress } from '../../hooks/useBudgets'

interface BudgetCardProps {
  budget: BudgetWithProgress
  onEdit: (budget: BudgetWithProgress) => void
  onDelete: (budget: BudgetWithProgress) => void
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getPeriodLabel = (period: string) => {
    const periods = {
      semanal: 'Semanal',
      mensal: 'Mensal',
      anual: 'Anual'
    }
    return periods[period as keyof typeof periods] || period
  }

  const getStatusIcon = () => {
    switch (budget.status) {
      case 'ultrapassado':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'alerta':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (budget.status) {
      case 'ultrapassado':
        return 'bg-red-100'
      case 'alerta':
        return 'bg-amber-100'
      case 'ok':
        return 'bg-emerald-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getProgressBarColor = () => {
    switch (budget.status) {
      case 'ultrapassado':
        return 'bg-red-500'
      case 'alerta':
        return 'bg-amber-500'
      case 'ok':
        return 'bg-emerald-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (budget.status) {
      case 'ultrapassado':
        return 'Ultrapassado'
      case 'alerta':
        return 'Atenção'
      case 'ok':
        return 'No Limite'
      default:
        return 'Indefinido'
    }
  }

  return (
    <div 
      className="card transition-colors"
      style={{
        transform: 'translateZ(0)',
        willChange: 'box-shadow',
        contain: 'layout style paint'
      }}
    >
      <div className="p-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-base text-fg-default dark:text-fg-dark-default">{budget.nome}</h3>
              <div className="flex items-center text-xs text-fg-muted dark:text-fg-dark-muted">
                <span>{getPeriodLabel(budget.periodo)}</span>
                {budget.categoria_principal && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="mr-1">{budget.categoria_principal.icone}</span>
                    <span>{budget.categoria_principal.nome}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(budget)}
              className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
              title="Editar orçamento"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(budget)}
              className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors"
              title="Excluir orçamento"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Progresso</span>
            <div className="flex items-center">
              <span className={`text-sm font-medium mr-2 ${
                budget.status === 'ultrapassado' ? 'text-danger-fg dark:text-danger-dark-fg' : 
                budget.status === 'alerta' ? 'text-attention-fg dark:text-attention-dark-fg' : 'text-success-fg dark:text-success-dark-fg'
              }`}>
                {budget.progresso_percentual.toFixed(1)}%
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                budget.status === 'ultrapassado' ? 'bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg' :
                budget.status === 'alerta' ? 'bg-attention-subtle dark:bg-attention-dark-subtle text-attention-fg dark:text-attention-dark-fg' :
                'bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg'
              }`}>
                {getStatusText()}
              </span>
            </div>
          </div>
          <div className="progress">
            <div 
              className={`progress-bar ${getProgressBarColor()}`}
              style={{ width: `${Math.min(budget.progresso_percentual, 100)}%` }}
            />
          </div>
        </div>

        {/* Valores */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Valor Gasto</span>
            <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
              {formatCurrency(budget.valor_gasto)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Limite Orçado</span>
            <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
              {formatCurrency(budget.valor_limite)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-border-default dark:border-border-dark-default pt-2">
            <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Valor Restante</span>
            <span className={`text-sm font-bold ${
              budget.valor_restante >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`}>
              {budget.valor_restante >= 0 ? '+' : ''}
              {formatCurrency(budget.valor_restante)}
            </span>
          </div>
        </div>

        {/* Descrição */}
        {budget.descricao && (
          <div className="mt-3 pt-3 border-t border-border-default dark:border-border-dark-default">
            <p className="text-xs text-fg-muted dark:text-fg-dark-muted">{budget.descricao}</p>
          </div>
        )}

        {/* Período */}
        <div className="mt-3 pt-3 border-t border-border-default dark:border-border-dark-default">
          <div className="flex items-center text-xs text-fg-muted dark:text-fg-dark-muted">
            <span>Período: {budget.data_inicio}</span>
            {budget.data_fim && (
              <>
                <span className="mx-2">até</span>
                <span>{budget.data_fim}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}