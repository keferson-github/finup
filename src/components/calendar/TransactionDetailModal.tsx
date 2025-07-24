import React from 'react'
import { X, CheckCircle, Clock, AlertCircle, Calendar, CreditCard, Tag, Repeat, Calculator } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarTransaction } from '../../hooks/useCalendar'
import { useCalendar } from '../../hooks/useCalendar'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { useState } from 'react'

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: CalendarTransaction | null
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const { markTransactionAsPaid, markTransactionAsPending } = useCalendar()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !transaction) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case 'pendente':
        return <Clock className="h-5 w-5 text-amber-600" />
      case 'vencido':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
        return 'bg-emerald-100 text-emerald-800'
      case 'pendente':
        return 'bg-amber-100 text-amber-800'
      case 'vencido':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago':
        return 'Pago'
      case 'pendente':
        return 'Pendente'
      case 'vencido':
        return 'Vencido'
      default:
        return status
    }
  }

  const handleStatusToggle = async () => {
    setIsUpdating(true)
    try {
      if (transaction.status === 'pago') {
        await markTransactionAsPending(transaction.id)
      } else {
        await markTransactionAsPaid(transaction.id)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Detalhes da Transação</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Título e Valor */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {transaction.titulo}
            </h3>
            <div className={`text-3xl font-bold ${
              transaction.tipo === 'receita' ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {transaction.tipo === 'receita' ? '+' : '-'}
              {formatCurrency(transaction.valor)}
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
                <span className="ml-2">{getStatusLabel(transaction.status)}</span>
              </span>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="space-y-4">
            {/* Data */}
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Data</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(transaction.data), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Data de Vencimento */}
            {transaction.data_vencimento && (
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Data de Vencimento</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(transaction.data_vencimento), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}

            {/* Conta */}
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: transaction.account.cor }}
                />
                <div>
                  <p className="text-sm text-gray-600">Conta</p>
                  <p className="font-medium text-gray-900">{transaction.account.nome}</p>
                </div>
              </div>
            </div>

            {/* Categoria */}
            {transaction.category && (
              <div className="flex items-center">
                <Tag className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex items-center">
                  <span className="text-lg mr-2">{transaction.category.icone}</span>
                  <div>
                    <p className="text-sm text-gray-600">Categoria</p>
                    <p className="font-medium text-gray-900">{transaction.category.nome}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Características Especiais */}
            {(transaction.eh_parcelamento || transaction.eh_recorrente) && (
              <div className="space-y-2">
                {transaction.eh_parcelamento && (
                  <div className="flex items-center">
                    <Calculator className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Parcelamento</p>
                      <p className="font-medium text-gray-900">
                        Parcela {transaction.numero_parcela} de {transaction.total_parcelas}
                      </p>
                    </div>
                  </div>
                )}

                {transaction.eh_recorrente && (
                  <div className="flex items-center">
                    <Repeat className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Recorrência</p>
                      <p className="font-medium text-gray-900">Transação Recorrente</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                transaction.status === 'pago'
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isUpdating && <LoadingSpinner size="sm" className="mr-2" />}
              {transaction.status === 'pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}