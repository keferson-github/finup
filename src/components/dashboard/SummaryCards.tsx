import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react'
import { DashboardSummary } from '../../hooks/useDashboard'

interface SummaryCardsProps {
  data: DashboardSummary | null
  loading: boolean
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data, loading }) => {
  const formatCurrency = (amount: number | undefined | null) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(validAmount)
  }

  const formatPercentage = (percentage: number | undefined | null) => {
    const validPercentage = typeof percentage === 'number' && !isNaN(percentage) ? percentage : 0
    const sign = validPercentage >= 0 ? '+' : ''
    return `${sign}${validPercentage.toFixed(1)}%`
  }

  const getPercentageColor = (percentage: number | undefined | null) => {
    const validPercentage = typeof percentage === 'number' && !isNaN(percentage) ? percentage : 0
    return validPercentage >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="animate-pulse">
              <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="text-center py-8">
              <div className="text-fg-muted dark:text-fg-dark-muted">Sem dados disponíveis</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Saldo Consolidado */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Saldo Total</p>
            <p className="text-2xl font-bold text-fg-default dark:text-fg-dark-default mt-1 truncate">
              {formatCurrency(data?.saldoConsolidado)}
            </p>
            <p className="text-xs text-fg-muted dark:text-fg-dark-muted mt-1">
              Todas as contas
            </p>
          </div>
          <div className="w-10 h-10 bg-accent-subtle dark:bg-accent-dark-subtle rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
            <DollarSign className="h-5 w-5 text-accent-fg dark:text-accent-dark-fg" />
          </div>
        </div>
      </div>

      {/* Receitas do Mês */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Receitas do Mês</p>
            <p className="text-2xl font-bold text-success-fg dark:text-success-dark-fg mt-1 truncate">
              {formatCurrency(data?.totalReceitas)}
            </p>
            <p className={`text-xs mt-1 ${getPercentageColor(data?.comparativoComMesAnterior?.receitas)}`}>
              {formatPercentage(data?.comparativoComMesAnterior?.receitas)} vs mês anterior
            </p>
          </div>
          <div className="w-10 h-10 bg-success-subtle dark:bg-success-dark-subtle rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
            <TrendingUp className="h-5 w-5 text-success-fg dark:text-success-dark-fg" />
          </div>
        </div>
      </div>

      {/* Despesas do Mês */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Despesas do Mês</p>
            <p className="text-2xl font-bold text-danger-fg dark:text-danger-dark-fg mt-1 truncate">
              {formatCurrency(data?.totalDespesas)}
            </p>
            <p className={`text-xs mt-1 ${getPercentageColor(data?.comparativoComMesAnterior?.despesas)}`}>
              {formatPercentage(data?.comparativoComMesAnterior?.despesas)} vs mês anterior
            </p>
          </div>
          <div className="w-10 h-10 bg-danger-subtle dark:bg-danger-dark-subtle rounded-lg flex items-center justify-center flex-shrink-0 ml-3">
            <TrendingDown className="h-5 w-5 text-danger-fg dark:text-danger-dark-fg" />
          </div>
        </div>
      </div>

      {/* Saldo do Mês */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Saldo do Mês</p>
            <p className={`text-2xl font-bold mt-1 truncate ${
              (data?.saldoMesAtual || 0) >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`}>
              {formatCurrency(data?.saldoMesAtual)}
            </p>
            <p className={`text-xs mt-1 ${getPercentageColor(data?.comparativoComMesAnterior?.saldo)}`}>
              {formatPercentage(data?.comparativoComMesAnterior?.saldo)} vs mês anterior
            </p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3 ${
            (data?.saldoMesAtual || 0) >= 0 ? 'bg-success-subtle dark:bg-success-dark-subtle' : 'bg-danger-subtle dark:bg-danger-dark-subtle'
          }`}>
            <CreditCard className={`h-5 w-5 ${
              (data?.saldoMesAtual || 0) >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`} />
          </div>
        </div>
      </div>
    </div>
  )
}