import React from 'react'
import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { useReports, ReportFilters } from '../hooks/useReports'
import { ReportFilters as ReportFiltersComponent } from '../components/reports/ReportFilters'
import { SummaryReport } from '../components/reports/SummaryReport'
import { CategoryChart } from '../components/reports/CategoryChart'
import { EvolutionChart } from '../components/reports/EvolutionChart'
import { AccountReport } from '../components/reports/AccountReport'

export const Reports: React.FC = () => {
  const {
    loading,
    summary,
    categoryReports,
    accountReports,
    evolutionData,
    generateSummaryReport,
    generateCategoryReport,
    generateAccountReport,
    generateEvolutionReport,
    exportReport
  } = useReports()

  const [filters, setFilters] = useState<ReportFilters>(() => {
    const now = new Date()
    const firstDay = startOfMonth(now)
    const lastDay = endOfMonth(now)
    
    return {
      dataInicio: format(firstDay, 'yyyy-MM-dd'),
      dataFim: format(lastDay, 'yyyy-MM-dd'),
      tipo: '',
      categoriaId: '',
      contaId: ''
    }
  })

  const [categoryViewType, setCategoryViewType] = useState<'pie' | 'bar'>('pie')
  const [evolutionViewType, setEvolutionViewType] = useState<'line' | 'area'>('line')

  // Carregar dados iniciais
  useEffect(() => {
    loadAllReports()
  }, [filters])

  const loadAllReports = async () => {
    await Promise.all([
      generateSummaryReport(filters),
      generateCategoryReport(filters),
      generateAccountReport(filters),
      generateEvolutionReport(12)
    ])
  }

  const handleFiltersChange = (newFilters: ReportFilters) => {
    setFilters(newFilters)
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel', type: 'summary' | 'category' | 'account' | 'evolution') => {
    exportReport(format, type)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-2">Analise seus dados financeiros e tome decisões baseadas em informações precisas</p>
      </div>

      {/* Filtros */}
      <ReportFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={handleExport}
        loading={loading}
      />

      {/* Relatório Resumo */}
      <SummaryReport data={summary} loading={loading} />

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Relatório por Categoria */}
        <CategoryChart
          data={categoryReports}
          loading={loading}
          viewType={categoryViewType}
          onViewTypeChange={setCategoryViewType}
        />

        {/* Relatório por Conta */}
        <AccountReport data={accountReports} loading={loading} />
      </div>

      {/* Evolução Temporal */}
      <EvolutionChart
        data={evolutionData}
        loading={loading}
        viewType={evolutionViewType}
        onViewTypeChange={setEvolutionViewType}
      />
    </div>
  )
}