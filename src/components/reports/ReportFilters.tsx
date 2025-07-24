import React from 'react'
import { Calendar, Filter, Download, RotateCcw } from 'lucide-react'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'
import { ReportFilters as IReportFilters } from '../../hooks/useReports'

interface ReportFiltersProps {
  filters: IReportFilters
  onFiltersChange: (filters: IReportFilters) => void
  onExport: (format: 'csv' | 'pdf' | 'excel', type: 'summary' | 'category' | 'account' | 'evolution') => void
  loading?: boolean
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  loading = false
}) => {
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const handleFilterChange = (key: keyof IReportFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const resetFilters = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    onFiltersChange({
      dataInicio: firstDay.toISOString().split('T')[0],
      dataFim: lastDay.toISOString().split('T')[0],
      tipo: '',
      categoriaId: '',
      contaId: ''
    })
  }

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Filtros do Relatório</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetFilters}
            className="btn btn-ghost"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </button>
          <div className="relative">
            <select
              onChange={(e) => {
                const [format, type] = e.target.value.split('-')
                if (format && type) {
                  onExport(format as any, type as any)
                }
              }}
              className="btn btn-primary cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </option>
              <option value="csv-summary">CSV - Resumo</option>
              <option value="csv-category">CSV - Categorias</option>
              <option value="csv-account">CSV - Contas</option>
              <option value="csv-evolution">CSV - Evolução</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dataInicio}
              onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
              className="input pl-10 block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={filters.dataFim}
              onChange={(e) => handleFilterChange('dataFim', e.target.value)}
              className="input pl-10 block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2"
            />
          </div>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={filters.tipo || ''}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={filters.categoriaId || ''}
            onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
            className="input"
          >
            <option value="">Todas</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icone} {category.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Conta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conta
          </label>
          <select
            value={filters.contaId || ''}
            onChange={(e) => handleFilterChange('contaId', e.target.value)}
            className="input"
          >
            <option value="">Todas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.nome}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}