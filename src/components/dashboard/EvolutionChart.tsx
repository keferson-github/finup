import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { EvolutionData } from '../../hooks/useDashboard'
import { TrendingUp } from 'lucide-react'

interface EvolutionChartProps {
  data: EvolutionData[]
  loading: boolean
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, loading }) => {
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
        <div className="card-header">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Evolução Financeira</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-32 mb-4"></div>
            <div className="h-64 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Evolução Financeira</h3>
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
      <div className="card-header">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Evolução Financeira (6 meses)</h3>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted)" />
            <XAxis 
              dataKey="mes" 
              stroke="var(--color-fg-muted)"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatCurrency} 
              stroke="var(--color-fg-muted)"
              fontSize={12}
            />
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
        </ResponsiveContainer>
      </div>
    </div>
  )
}