import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  Search,
  CreditCard
} from 'lucide-react'
import { useTransactions, TransactionWithDetails } from '../../hooks/useTransactions'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'
import { useDashboardContext } from '../../contexts/DashboardContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface TransactionListProps {
  onEditTransaction?: (transaction: TransactionWithDetails) => void
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onEditTransaction
}) => {
  const { refreshDashboard } = useDashboardContext()
  const { transactions, loading, markAsPaid, markAsPending, deleteTransaction } = useTransactions(refreshDashboard)
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  
  const [filters, setFilters] = useState({
    search: '',
    accountId: '',
    categoryId: '',
    type: '' as '' | 'income' | 'expense',
    status: '' as '' | 'paid' | 'pending' | 'overdue',
    startDate: '',
    endDate: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'pendente':
        return <Clock className="h-4 w-4 text-amber-600" />
      case 'vencido':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
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

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.search && !transaction.titulo.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.accountId && transaction.account_id !== filters.accountId) {
      return false
    }
    if (filters.categoryId && transaction.category_id !== filters.categoryId) {
      return false
    }
    if (filters.type) {
      const tipoValue = filters.type === 'income' ? 'receita' : 'despesa'
      if (transaction.tipo !== tipoValue) {
        return false
      }
    }
    if (filters.status) {
      const statusValue = filters.status === 'paid' ? 'pago' : filters.status === 'pending' ? 'pendente' : 'vencido'
      if (transaction.status !== statusValue) {
        return false
      }
    }
    if (filters.startDate && transaction.data < filters.startDate) {
      return false
    }
    if (filters.endDate && transaction.data > filters.endDate) {
      return false
    }
    return true
  })

  const handleStatusToggle = async (transaction: TransactionWithDetails) => {
    if (transaction.status === 'pago') {
      await markAsPending(transaction.id)
    } else {
      await markAsPaid(transaction.id)
    }
  }

  const handleDelete = async (transaction: TransactionWithDetails) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(transaction.id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Filtros</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-accent-fg dark:text-accent-dark-fg hover:text-accent-emphasis dark:hover:text-accent-dark-emphasis transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input pl-10"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
            className="input"
          >
            <option value="">Todos os Tipos</option>
            <option value="income">Receita</option>
            <option value="expense">Despesa</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            className="input"
          >
            <option value="">Todos os Status</option>
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
            <option value="overdue">Vencido</option>
          </select>

          <button
            onClick={() => setFilters({
              search: '',
              accountId: '',
              categoryId: '',
              type: '',
              status: '',
              startDate: '',
              endDate: ''
            })}
            className="btn btn-secondary"
          >
            Limpar Filtros
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border-default dark:border-border-dark-default">
            <select
              value={filters.accountId}
              onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
              className="input"
            >
              <option value="">Todas as Contas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.nome}
                </option>
              ))}
            </select>

            <select
              value={filters.categoryId}
              onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
              className="input"
            >
              <option value="">Todas as Categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>

            <input
              type="date"
              placeholder="Data Inicial"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input"
            />

            <input
              type="date"
              placeholder="Data Final"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input"
            />
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="card p-0">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
            <p className="text-fg-muted dark:text-fg-dark-muted text-lg">Nenhuma transação encontrada</p>
            <p className="text-fg-muted dark:text-fg-dark-muted text-sm mt-2">
              {transactions.length === 0 
                ? "Adicione sua primeira transação para começar"
                : "Tente ajustar seus filtros"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-canvas-subtle dark:bg-canvas-dark-subtle border-b border-border-default dark:border-border-dark-default">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Transação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Conta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-canvas-default dark:bg-canvas-dark-default divide-y divide-border-default dark:divide-border-dark-default">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-canvas-subtle dark:hover:bg-canvas-dark-subtle transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
                          {transaction.titulo}
                        </div>
                        {transaction.descricao && (
                          <div className="text-sm text-fg-muted dark:text-fg-dark-muted">
                            {transaction.descricao}
                          </div>
                        )}
                        {transaction.eh_parcelamento && (
                          <div className="text-xs text-accent-fg dark:text-accent-dark-fg mt-1">
                            Parcela {transaction.numero_parcela}/{transaction.total_parcelas}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.category ? (
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: transaction.category.color }}
                          />
                          <span className="text-sm text-fg-default dark:text-fg-dark-default">
                            {transaction.category.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Sem categoria</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: transaction.account.color }}
                        />
                        <span className="text-sm text-fg-default dark:text-fg-dark-default">
                          {transaction.account.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        transaction.tipo === 'receita' ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                      }`}>
                        {transaction.tipo === 'receita' ? '+' : '-'}
                        {formatCurrency(transaction.valor)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-fg-default dark:text-fg-dark-default">
                        {format(new Date(transaction.data), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1 capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStatusToggle(transaction)}
                          className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
                          title={transaction.status === 'pago' ? 'Marcar como pendente' : 'Marcar como pago'}
                        >
                          {transaction.status === 'pago' ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </button>
                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(transaction)}
                            className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
                            title="Editar transação"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(transaction)}
                          className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors"
                          title="Excluir transação"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}