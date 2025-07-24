import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CategorySummary } from '../../hooks/useDashboard'
import { Tag } from 'lucide-react'

interface CategoryChartProps {
  data: CategorySummary[]
  loading: boolean
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data, loading }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-canvas-overlay dark:bg-canvas-dark-overlay p-3 border border-border-default dark:border-border-dark-default rounded-lg shadow-lg">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">{data.icone}</span>
            <span className="font-medium text-fg-default dark:text-fg-dark-default">{data.categoria}</span>
          </div>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
            Valor: {formatCurrency(data.total)}
          </p>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
            Porcentagem: {data.porcentagem.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Gastos por Categoria</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="w-64 h-64 bg-neutral-muted dark:bg-neutral-dark-muted rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Gastos por Categoria</h3>
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
      <div className="card-header">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Gastos por Categoria</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                  label={({ porcentagem }) => `${porcentagem.toFixed(1)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {data.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: category.cor }}
                />
                <div>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">{category.icone}</span>
                    <span className="font-medium text-fg-default dark:text-fg-dark-default text-sm">
                      {category.categoria}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    category.tipo === 'receita' 
                      ? 'bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg'
                      : 'bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg'
                  }`}>
                    {category.tipo}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-fg-default dark:text-fg-dark-default text-sm">
                  {formatCurrency(category.total)}
                </p>
                <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                  {category.porcentagem.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}