import React from 'react'
import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { BudgetWithProgress } from '../../hooks/useBudgets'

interface BudgetAlertsProps {
  orcamentosUltrapassados: BudgetWithProgress[]
  orcamentosEmAlerta: BudgetWithProgress[]
}

export const BudgetAlerts: React.FC<BudgetAlertsProps> = ({
  orcamentosUltrapassados,
  orcamentosEmAlerta
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const hasAlerts = orcamentosUltrapassados.length > 0 || orcamentosEmAlerta.length > 0

  if (!hasAlerts) {
    return (
      <div className="card mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-success-subtle dark:bg-success-dark-subtle rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success-fg dark:text-success-dark-fg" />
          </div>
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-2">
            Todos os Orçamentos Estão no Controle! 🎉
          </h3>
          <p className="text-fg-muted dark:text-fg-dark-muted">
            Parabéns! Você está mantendo seus gastos dentro dos limites estabelecidos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Orçamentos Ultrapassados */}
      {orcamentosUltrapassados.length > 0 && (
        <div className="alert alert-error">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-danger-fg dark:text-danger-dark-fg mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-danger-fg dark:text-danger-dark-fg">
                Orçamentos Ultrapassados ({orcamentosUltrapassados.length})
              </h3>
              <p className="text-sm text-danger-fg dark:text-danger-dark-fg">
                Estes orçamentos excederam o limite estabelecido
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orcamentosUltrapassados.map((budget) => (
              <div key={budget.id} className="bg-canvas-default dark:bg-canvas-dark-default rounded-lg p-4 border border-danger-muted dark:border-danger-dark-muted">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-fg-default dark:text-fg-dark-default">{budget.nome}</h4>
                  <span className="text-sm font-bold text-danger-fg dark:text-danger-dark-fg">
                    {budget.progresso_percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-fg-muted dark:text-fg-dark-muted">
                  <p>Gasto: {formatCurrency(budget.valor_gasto)}</p>
                  <p>Limite: {formatCurrency(budget.valor_limite)}</p>
                  <p className="text-danger-fg dark:text-danger-dark-fg font-medium">
                    Excesso: {formatCurrency(budget.valor_gasto - budget.valor_limite)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orçamentos em Alerta */}
      {orcamentosEmAlerta.length > 0 && (
        <div className="alert alert-warning">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-attention-fg dark:text-attention-dark-fg mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-attention-fg dark:text-attention-dark-fg">
                Orçamentos em Alerta ({orcamentosEmAlerta.length})
              </h3>
              <p className="text-sm text-attention-fg dark:text-attention-dark-fg">
                Estes orçamentos estão próximos do limite
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orcamentosEmAlerta.map((budget) => (
              <div key={budget.id} className="bg-canvas-default dark:bg-canvas-dark-default rounded-lg p-4 border border-attention-muted dark:border-attention-dark-muted">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-fg-default dark:text-fg-dark-default">{budget.nome}</h4>
                  <span className="text-sm font-bold text-attention-fg dark:text-attention-dark-fg">
                    {budget.progresso_percentual.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-fg-muted dark:text-fg-dark-muted">
                  <p>Gasto: {formatCurrency(budget.valor_gasto)}</p>
                  <p>Limite: {formatCurrency(budget.valor_limite)}</p>
                  <p className="text-attention-fg dark:text-attention-dark-fg font-medium">
                    Restante: {formatCurrency(budget.valor_restante)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}