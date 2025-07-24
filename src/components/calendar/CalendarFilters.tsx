import React from 'react'
import { Filter, RotateCcw, Calendar as CalendarIcon } from 'lucide-react'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'
import { CalendarFilters as ICalendarFilters } from '../../hooks/useCalendar'

interface CalendarFiltersProps {
  filters: ICalendarFilters
  onFiltersChange: (filters: ICalendarFilters) => void
  loading?: boolean
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false
}) => {
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const handleFilterChange = (key: keyof ICalendarFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  const resetFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Filtros do Calendário</h3>
        </div>
        <button
          onClick={resetFilters}
          disabled={loading}
          className="flex items-center px-3 py-2 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipo de Transação */}
        <div>
          <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
            Tipo de Transação
          </label>
          <select
            value={filters.tipo || ''}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            disabled={loading}
            className="input disabled:opacity-50"
          >
            <option value="">Todos os Tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
            className="input disabled:opacity-50"
          >
            <option value="">Todos os Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
            Categoria
          </label>
          <select
            value={filters.categoriaId || ''}
            onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
            disabled={loading}
            className="input disabled:opacity-50"
          >
            <option value="">Todas as Categorias</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icone} {category.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Conta */}
        <div>
          <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
            Conta
          </label>
          <select
            value={filters.contaId || ''}
            onChange={(e) => handleFilterChange('contaId', e.target.value)}
            disabled={loading}
            className="input disabled:opacity-50"
          >
            <option value="">Todas as Contas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de Filtros Ativos */}
      {Object.values(filters).some(value => value) && (
        <div className="mt-4 pt-4 border-t border-border-default dark:border-border-dark-default">
          <div className="flex items-center text-sm text-accent-fg dark:text-accent-dark-fg">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>Filtros ativos aplicados ao calendário</span>
          </div>
        </div>
      )}
    </div>
  )
}