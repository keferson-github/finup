import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import { ReportSummary } from '../../hooks/useReports'

interface SummaryReportProps {
  data: ReportSummary | null
  loading: boolean
}

export const SummaryReport: React.FC<SummaryReportProps> = ({ data, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : ''
    return `${sign}${percentage.toFixed(1)}%`
  }

  const getPercentageColor = (percentage: number) => {
    return percentage >= 0 ? 'text-emerald-600' : 'text-red-600'
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
      <div className="card text-center mb-8">
        <BarChart3 className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
        <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum dado disponível para o período selecionado</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total de Receitas */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Total de Receitas</p>
            <p className="text-2xl font-bold text-success-fg dark:text-success-dark-fg mt-2">
              {formatCurrency(data.totalReceitas)}
            </p>
            <p className={`text-xs mt-1 ${getPercentageColor(data.comparacaoMesAnterior.receitas)}`}>
              {formatPercentage(data.comparacaoMesAnterior.receitas)} vs mês anterior
            </p>
          </div>
          <div className="w-12 h-12 bg-success-subtle dark:bg-success-dark-subtle rounded-lg flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-success-fg dark:text-success-dark-fg" />
          </div>
        </div>
      </div>

      {/* Total de Despesas */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Total de Despesas</p>
            <p className="text-2xl font-bold text-danger-fg dark:text-danger-dark-fg mt-2">
              {formatCurrency(data.totalDespesas)}
            </p>
            <p className={`text-xs mt-1 ${getPercentageColor(data.comparacaoMesAnterior.despesas)}`}>
              {formatPercentage(data.comparacaoMesAnterior.despesas)} vs mês anterior
            </p>
          </div>
          <div className="w-12 h-12 bg-danger-subtle dark:bg-danger-dark-subtle rounded-lg flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-danger-fg dark:text-danger-dark-fg" />
          </div>
        </div>
      </div>

      {/* Saldo Final */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Saldo Final</p>
            <p className={`text-2xl font-bold mt-2 ${
              data.saldoFinal >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`}>
              {formatCurrency(data.saldoFinal)}
            </p>
            <p className={`text-xs mt-1 ${getPercentageColor(data.comparacaoMesAnterior.saldo)}`}>
              {formatPercentage(data.comparacaoMesAnterior.saldo)} vs mês anterior
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            data.saldoFinal >= 0 ? 'bg-success-subtle dark:bg-success-dark-subtle' : 'bg-danger-subtle dark:bg-danger-dark-subtle'
          }`}>
            <DollarSign className={`h-6 w-6 ${
              data.saldoFinal >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`} />
          </div>
        </div>
      </div>

      {/* Taxa de Economia */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Taxa de Economia</p>
            <p className={`text-2xl font-bold mt-2 ${
              data.saldoFinal >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
            }`}>
              {data.totalReceitas > 0 
                ? `${((data.saldoFinal / data.totalReceitas) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
            <p className="text-xs text-fg-muted dark:text-fg-dark-muted mt-1">
              Do total de receitas
            </p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            data.saldoFinal >= 0 ? 'bg-accent-subtle dark:bg-accent-dark-subtle' : 'bg-neutral-subtle dark:bg-neutral-dark-subtle'
          }`}>
            <BarChart3 className={`h-6 w-6 ${
              data.saldoFinal >= 0 ? 'text-accent-fg dark:text-accent-dark-fg' : 'text-fg-muted dark:text-fg-dark-muted'
            }`} />
          </div>
        </div>
      </div>
    </div>
  )
}