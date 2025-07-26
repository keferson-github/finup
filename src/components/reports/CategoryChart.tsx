import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { CategoryReport } from '../../hooks/useReports'
import { Tag } from 'lucide-react'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CategoryChartProps {
  data: CategoryReport[]
  loading: boolean
  viewType: 'pie' | 'bar'
  onViewTypeChange: (type: 'pie' | 'bar') => void
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ 
  data, 
  loading, 
  viewType, 
  onViewTypeChange 
}) => {
  const formatCurrency = (value: number | undefined | null) => {
    const validValue = typeof value === 'number' && !isNaN(value) ? value : 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(validValue)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      if (!data) return null
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">{data.icone || '📁'}</span>
            <span className="font-medium">{data.categoria || 'Categoria sem nome'}</span>
          </div>
          <p className="text-sm text-gray-600">
            Valor: {formatCurrency(data.total)}
          </p>
          <p className="text-sm text-gray-600">
            Porcentagem: {(data.porcentagem || 0).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Relatório por Categoria</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Relatório por Categoria</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Tag className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
            <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum dado de categoria disponível</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Relatório por Categoria</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewTypeChange('pie')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'pie'
                ? 'bg-accent-subtle dark:bg-accent-dark-subtle text-accent-fg dark:text-accent-dark-fg'
                : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
            }`}
          >
            Pizza
          </button>
          <button
            onClick={() => onViewTypeChange('bar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'bar'
                ? 'bg-accent-subtle dark:bg-accent-dark-subtle text-accent-fg dark:text-accent-dark-fg'
                : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
            }`}
          >
            Barras
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                    label={({ porcentagem }) => `${(porcentagem || 0).toFixed(1)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.cor || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              ) : (
                <BarChart data={data} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis 
                    dataKey="categoria" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" fill="#3B82F6" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {data.filter(category => category && category.categoria).map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category?.cor || '#6B7280' }}
                />
                <div>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{category?.icone || '📁'}</span>
                    <span className="font-medium text-fg-default dark:text-fg-dark-default text-sm">
                      {category?.categoria || 'Categoria sem nome'}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category?.tipo === 'receita' 
                      ? 'bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg'
                      : 'bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg'
                  }`}>
                    {category?.tipo || 'tipo não definido'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-fg-default dark:text-fg-dark-default text-sm">
                  {formatCurrency(category?.total)}
                </p>
                <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                  {(category?.porcentagem || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}