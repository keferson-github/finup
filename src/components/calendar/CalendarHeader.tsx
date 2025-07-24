import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthSummary {
  totalReceitas: number
  totalDespesas: number
  saldoLiquido: number
  totalTransacoes: number
  transacoesPagas: number
  transacoesPendentes: number
  transacoesVencidas: number
}

interface CalendarHeaderProps {
  currentDate: Date
  monthSummary: MonthSummary
  onNavigateMonth: (direction: 'prev' | 'next') => void
  onGoToToday: () => void
  loading?: boolean
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  monthSummary,
  onNavigateMonth,
  onGoToToday,
  loading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const isCurrentMonth = format(currentDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM')

  return (
    <div className="card mb-6">
      {/* Navegação do Calendário */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onNavigateMonth('prev')}
            disabled={loading}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
          
          <h2 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          
          <button
            onClick={() => onNavigateMonth('next')}
            disabled={loading}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {!isCurrentMonth && (
            <button
              onClick={onGoToToday}
              disabled={loading}
              className="btn btn-primary disabled:opacity-50 flex items-center"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Hoje
            </button>
          )}
        </div>
      </div>

      {/* Resumo do Mês */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total de Receitas */}
        <div className="bg-success-subtle dark:bg-success-dark-subtle border border-success-emphasis dark:border-success-dark-emphasis rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-success-fg dark:text-success-dark-fg">Receitas</p>
              <p className="text-xl font-bold text-success-fg dark:text-success-dark-fg">
                {formatCurrency(monthSummary.totalReceitas)}
              </p>
            </div>
            <div className="w-10 h-10 bg-success-muted dark:bg-success-dark-muted rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success-fg dark:text-success-dark-fg" />
            </div>
          </div>
        </div>

        {/* Total de Despesas */}
        <div className="bg-danger-subtle dark:bg-danger-dark-subtle border border-danger-emphasis dark:border-danger-dark-emphasis rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-danger-fg dark:text-danger-dark-fg">Despesas</p>
              <p className="text-xl font-bold text-danger-fg dark:text-danger-dark-fg">
                {formatCurrency(monthSummary.totalDespesas)}
              </p>
            </div>
            <div className="w-10 h-10 bg-danger-muted dark:bg-danger-dark-muted rounded-lg flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-danger-fg dark:text-danger-dark-fg" />
            </div>
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className={`border rounded-lg p-4 ${
          monthSummary.saldoLiquido >= 0 
            ? 'bg-accent-subtle dark:bg-accent-dark-subtle border-accent-emphasis dark:border-accent-dark-emphasis' 
            : 'bg-neutral-subtle dark:bg-neutral-dark-subtle border-border-default dark:border-border-dark-default'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                monthSummary.saldoLiquido >= 0 ? 'text-accent-fg dark:text-accent-dark-fg' : 'text-fg-muted dark:text-fg-dark-muted'
              }`}>
                Saldo Líquido
              </p>
              <p className={`text-xl font-bold ${
                monthSummary.saldoLiquido >= 0 ? 'text-accent-fg dark:text-accent-dark-fg' : 'text-fg-muted dark:text-fg-dark-muted'
              }`}>
                {formatCurrency(monthSummary.saldoLiquido)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              monthSummary.saldoLiquido >= 0 ? 'bg-accent-muted dark:bg-accent-dark-muted' : 'bg-neutral-muted dark:bg-neutral-dark-muted'
            }`}>
              <DollarSign className={`h-5 w-5 ${
                monthSummary.saldoLiquido >= 0 ? 'text-accent-fg dark:text-accent-dark-fg' : 'text-fg-muted dark:text-fg-dark-muted'
              }`} />
            </div>
          </div>
        </div>

        {/* Status das Transações */}
        <div className="bg-neutral-subtle dark:bg-neutral-dark-subtle border border-border-default dark:border-border-dark-default rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-fg-muted dark:text-fg-dark-muted">Transações</p>
            <span className="text-xl font-bold text-fg-default dark:text-fg-dark-default">
              {monthSummary.totalTransacoes}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-success-fg dark:text-success-dark-fg">Pagas</span>
              <span className="font-medium">{monthSummary.transacoesPagas}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-attention-fg dark:text-attention-dark-fg">Pendentes</span>
              <span className="font-medium">{monthSummary.transacoesPendentes}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-danger-fg dark:text-danger-dark-fg">Vencidas</span>
              <span className="font-medium">{monthSummary.transacoesVencidas}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}