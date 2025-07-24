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
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(validAmount)
  }

  if (loading) {
    return (
      <div className="card p-0 h-full">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Próximas Transações</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
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
    <div className="card p-0 h-full">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Próximas Transações</h3>
        </div>
      </div>
      <div className="p-6 pt-0">
        {!data || data.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
            <p className="text-fg-muted dark:text-fg-dark-muted">Nenhuma transação agendada</p>
            <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">
              Próximos 7 dias
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.filter(transaction => transaction && transaction.id).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted transition-colors">
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: `${transaction.category?.cor || '#6B7280'}20` }}
                  >
                    {transaction.category ? (
                      <span className="text-lg">{transaction.category.icone}</span>
                    ) : (
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: transaction.account?.cor || '#6B7280' }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-fg-default dark:text-fg-dark-default">
                      {transaction.titulo || 'Transação sem título'}
                    </p>
                    <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
                      {transaction.category?.nome || 'Sem categoria'} • {transaction.account?.nome || 'Conta não informada'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.tipo === 'receita' 
                      ? 'text-success-fg dark:text-success-dark-fg' 
                      : 'text-danger-fg dark:text-danger-dark-fg'
                  }`}>
                    {(transaction.tipo === 'receita' || transaction.tipo === 'despesa') ? (transaction.tipo === 'receita' ? '+' : '-') : ''}
                    {formatCurrency(transaction.valor)}
                  </p>
                  <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
                    {transaction.data && !isNaN(new Date(transaction.data).getTime()) ? format(new Date(transaction.data), 'd MMM', { locale: ptBR }) : 'Data inválida'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}