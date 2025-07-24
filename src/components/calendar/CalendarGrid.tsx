import React, { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Clock, AlertCircle, Plus, Eye } from 'lucide-react'
import { CalendarTransaction, DaySummary } from '../../hooks/useCalendar'
import { TransactionDetailModal } from './TransactionDetailModal'

interface CalendarGridProps {
  currentDate: Date
  getTransactionsForDate: (date: string) => CalendarTransaction[]
  getDaySummary: (date: string) => DaySummary
  onAddTransaction?: (date: string) => void
  onTransactionUpdate?: () => void
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  getTransactionsForDate,
  getDaySummary,
  onAddTransaction,
  onTransactionUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<CalendarTransaction | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-3 w-3 text-emerald-600" />
      case 'pendente':
        return <Clock className="h-3 w-3 text-amber-600" />
      case 'vencido':
        return <AlertCircle className="h-3 w-3 text-red-600" />
      default:
        return <Clock className="h-3 w-3 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pendente':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleTransactionClick = (transaction: CalendarTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const handleCloseModal = () => {
    setShowTransactionModal(false)
    setSelectedTransaction(null)
    if (onTransactionUpdate) {
      onTransactionUpdate()
    }
  }

  // Gerar dias do mês
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Adicionar dias da semana anterior para completar a primeira semana
  const startDay = getDay(monthStart)
  const previousDays = []
  for (let i = startDay - 1; i >= 0; i--) {
    const day = new Date(monthStart)
    day.setDate(day.getDate() - (i + 1))
    previousDays.push(day)
  }

  // Adicionar dias da próxima semana para completar a última semana
  const endDay = getDay(monthEnd)
  const nextDays = []
  for (let i = 1; i <= (6 - endDay); i++) {
    const day = new Date(monthEnd)
    day.setDate(day.getDate() + i)
    nextDays.push(day)
  }

  const allDays = [...previousDays, ...days, ...nextDays]

  return (
    <div className="card p-0">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-border-default dark:border-border-dark-default">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="p-4 text-center text-sm font-medium text-fg-muted dark:text-fg-dark-muted bg-canvas-subtle dark:bg-canvas-dark-subtle">
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7">
        {allDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayTransactions = getTransactionsForDate(dateStr)
          const daySummary = getDaySummary(dateStr)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isDayToday = isToday(day)
          const isSelected = selectedDate === dateStr

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                !isCurrentMonth ? 'bg-canvas-subtle dark:bg-canvas-dark-subtle text-fg-muted dark:text-fg-dark-muted' : ''
              } ${isDayToday ? 'bg-accent-subtle dark:bg-accent-dark-subtle border-accent-emphasis dark:border-accent-dark-emphasis' : ''} ${
                isSelected ? 'ring-2 ring-accent-emphasis dark:ring-accent-dark-emphasis' : ''
              }`}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
            >
              {/* Cabeçalho do dia */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isDayToday ? 'text-accent-fg dark:text-accent-dark-fg' : isCurrentMonth ? 'text-fg-default dark:text-fg-dark-default' : 'text-fg-muted dark:text-fg-dark-muted'
                }`}>
                  {format(day, 'd')}
                </span>
                {isCurrentMonth && onAddTransaction && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddTransaction(dateStr)
                    }}
                    className="p-1 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Adicionar transação"
                  >
                    <Plus className="h-3 w-3 text-fg-muted dark:text-fg-dark-muted" />
                  </button>
                )}
              </div>

              {/* Transações do dia */}
              {isCurrentMonth && (
                <div className="space-y-1">
                  {dayTransactions.slice(0, 3).map(transaction => (
                    <div
                      key={transaction.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTransactionClick(transaction)
                      }}
                      className={`text-xs p-1 rounded border cursor-pointer transition-all hover:scale-105 ${
                        transaction.tipo === 'receita' 
                         ? 'bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg border-success-emphasis dark:border-success-dark-emphasis hover:bg-success-muted dark:hover:bg-success-dark-muted' 
                         : 'bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg border-danger-emphasis dark:border-danger-dark-emphasis hover:bg-danger-muted dark:hover:bg-danger-dark-muted'
                      }`}
                      title={`${transaction.titulo} - ${formatCurrency(transaction.valor)}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 truncate text-xs">
                            {transaction.titulo}
                          </span>
                        </div>
                        {transaction.eh_parcelamento && (
                          <span className="text-xs opacity-75">
                            {transaction.numero_parcela}/{transaction.total_parcelas}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {dayTransactions.length > 3 && (
                    <div className="text-xs text-fg-muted dark:text-fg-dark-muted text-center py-1">
                      +{dayTransactions.length - 3} mais
                    </div>
                  )}
                </div>
              )}

              {/* Resumo do dia */}
              {isCurrentMonth && dayTransactions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border-default dark:border-border-dark-default">
                  <div className={`text-xs font-medium text-center ${
                    daySummary.saldoLiquido >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                  }`}>
                    {formatCurrency(daySummary.saldoLiquido)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detalhes do dia selecionado */}
      {selectedDate && (
        <div className="border-t border-border-default dark:border-border-dark-default p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">
              {format(new Date(selectedDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors"
            >
              ✕
            </button>
          </div>

          {(() => {
            const dayTransactions = getTransactionsForDate(selectedDate)
            const daySummary = getDaySummary(selectedDate)

            if (dayTransactions.length === 0) {
              return (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
                  <p className="text-fg-muted dark:text-fg-dark-muted">Nenhuma transação neste dia</p>
                  {onAddTransaction && (
                    <button
                      onClick={() => onAddTransaction(selectedDate)}
                      className="mt-4 btn btn-primary flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Transação
                    </button>
                  )}
                </div>
              )
            }

            return (
              <div className="space-y-4">
                {/* Resumo do dia */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Receitas</p>
                    <p className="text-lg font-semibold text-success-fg dark:text-success-dark-fg">
                      {formatCurrency(daySummary.totalReceitas)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Despesas</p>
                    <p className="text-lg font-semibold text-danger-fg dark:text-danger-dark-fg">
                      {formatCurrency(daySummary.totalDespesas)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Saldo</p>
                    <p className={`text-lg font-semibold ${
                      daySummary.saldoLiquido >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                    }`}>
                      {formatCurrency(daySummary.saldoLiquido)}
                    </p>
                  </div>
                </div>

                {/* Lista de transações */}
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => handleTransactionClick(transaction)}
                      className="flex items-center justify-between p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center">
                        <div className="flex items-center mr-3">
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div className="flex items-center mr-4">
                          {transaction.category && (
                            <span className="text-lg mr-2">{transaction.category.icone}</span>
                          )}
                          <div>
                            <p className="font-medium text-fg-default dark:text-fg-dark-default">{transaction.titulo}</p>
                            <div className="flex items-center text-sm text-fg-muted dark:text-fg-dark-muted">
                              <span>{transaction.category?.nome || 'Sem categoria'}</span>
                              <span className="mx-2">•</span>
                              <span>{transaction.account.nome}</span>
                              {transaction.eh_parcelamento && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Parcela {transaction.numero_parcela}/{transaction.total_parcelas}</span>
                                </>
                              )}
                              {transaction.eh_recorrente && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Recorrente</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-semibold mr-3 ${
                          transaction.tipo === 'receita' ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                        }`}>
                          {transaction.tipo === 'receita' ? '+' : '-'}
                          {formatCurrency(transaction.valor)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Modal de detalhes da transação */}
      <TransactionDetailModal
        isOpen={showTransactionModal}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </div>
  )
}