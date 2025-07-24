import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { EvolutionData } from '../../hooks/useReports'
import { TrendingUp } from 'lucide-react'

interface EvolutionChartProps {
  data: EvolutionData[]
  loading: boolean
  viewType: 'line' | 'area'
  onViewTypeChange: (type: 'line' | 'area') => void
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ 
  data, 
  loading, 
  viewType, 
  onViewTypeChange 
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-canvas-overlay dark:bg-canvas-dark-overlay p-4 border border-border-default dark:border-border-dark-default rounded-lg shadow-lg">
          <p className="font-medium text-fg-default dark:text-fg-dark-default mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-fg-muted dark:text-fg-dark-muted">{entry.name}:</span>
              </div>
              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default ml-4">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Evolução Temporal</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border-default dark:border-border-dark-default border-t-accent-emphasis dark:border-t-accent-dark-emphasis"></div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Evolução Temporal</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
            <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum dado de evolução disponível</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Evolução Temporal</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewTypeChange('line')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'line'
                ? 'bg-accent-subtle dark:bg-accent-dark-subtle text-accent-fg dark:text-accent-dark-fg'
                : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
            }`}
          >
            Linha
          </button>
          <button
            onClick={() => onViewTypeChange('area')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'area'
                ? 'bg-accent-subtle dark:bg-accent-dark-subtle text-accent-fg dark:text-accent-dark-fg'
                : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
            }`}
          >
            Área
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--color-fg-muted)' }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fill: 'var(--color-fg-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="receitas" 
                stroke="var(--color-success-emphasis)" 
                strokeWidth={3}
                name="Receitas"
                dot={{ fill: 'var(--color-success-emphasis)', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="despesas" 
                stroke="var(--color-danger-emphasis)" 
                strokeWidth={3}
                name="Despesas"
                dot={{ fill: 'var(--color-danger-emphasis)', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="var(--color-accent-emphasis)" 
                strokeWidth={3}
                name="Saldo Líquido"
                dot={{ fill: 'var(--color-accent-emphasis)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted)" />
              <XAxis dataKey="mes" tick={{ fill: 'var(--color-fg-muted)' }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fill: 'var(--color-fg-muted)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="receitas"
                stackId="1"
                stroke="var(--color-success-emphasis)"
                fill="var(--color-success-emphasis)"
                fillOpacity={0.6}
                name="Receitas"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                stackId="2"
                stroke="var(--color-danger-emphasis)"
                fill="var(--color-danger-emphasis)"
                fillOpacity={0.6}
                name="Despesas"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-default dark:border-border-dark-default">
        <div className="text-center">
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Média de Receitas</p>
          <p className="text-lg font-semibold text-success-fg dark:text-success-dark-fg">
            {formatCurrency(data.reduce((sum, item) => sum + item.receitas, 0) / data.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Média de Despesas</p>
          <p className="text-lg font-semibold text-danger-fg dark:text-danger-dark-fg">
            {formatCurrency(data.reduce((sum, item) => sum + item.despesas, 0) / data.length)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Saldo Médio</p>
          <p className={`text-lg font-semibold ${
            (data.reduce((sum, item) => sum + item.saldo, 0) / data.length) >= 0 
              ? 'text-success-fg dark:text-success-dark-fg' 
              : 'text-danger-fg dark:text-danger-dark-fg'
          }`}>
            {formatCurrency(data.reduce((sum, item) => sum + item.saldo, 0) / data.length)}
          </p>
        </div>
      </div>
    </div>
  )
}