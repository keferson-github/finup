import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Clock } from 'lucide-react'
import { UpcomingTransaction } from '../../hooks/useDashboard'

interface UpcomingTransactionsProps {
  data: UpcomingTransaction[]
  loading: boolean
}

export const UpcomingTransactions: React.FC<UpcomingTransactionsProps> = ({ data, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Próximas Transações</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-neutral-muted dark:bg-neutral-dark-muted rounded-lg mr-3"></div>
                <div>
                  <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-24 mb-2"></div>
                  <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-16"></div>
                </div>
              </div>
              <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-16"></div>
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
          <Calendar className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Próximas Transações</h3>
        </div>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
          <p className="text-fg-muted dark:text-fg-dark-muted">Nenhuma transação agendada</p>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">
            Próximos 7 dias
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted transition-colors">
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  {transaction.category ? (
                    <span className="text-lg">{transaction.category.icone}</span>
                  ) : (
                    <Clock className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-fg-default dark:text-fg-dark-default text-sm">
                    {transaction.titulo}
                  </p>
                  <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                    {transaction.category?.nome || 'Sem categoria'} • {transaction.account.nome}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${
                  transaction.tipo === 'receita' 
                    ? 'text-success-fg dark:text-success-dark-fg' 
                    : 'text-danger-fg dark:text-danger-dark-fg'
                }`}>
                  {transaction.tipo === 'receita' ? '+' : '-'}
                  {formatCurrency(transaction.valor)}
                </p>
                <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                  {format(new Date(transaction.data), 'd MMM', { locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}