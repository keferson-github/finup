import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { EvolutionData } from '../../hooks/useDashboard'
import { TrendingUp } from 'lucide-react'

interface EvolutionChartProps {
  data: EvolutionData[]
  loading: boolean
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, loading }) => {
  const [themeKey, setThemeKey] = useState(0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Cores adaptáveis ao tema
  const getChartColors = () => {
    const isDark = document.documentElement.classList.contains('dark')
    return {
      grid: isDark ? '#30363d' : '#d0d7de',
      text: isDark ? '#848d97' : '#656d76',
      textSecondary: isDark ? '#7d8590' : '#6e7781',
      receitas: isDark ? '#3fb950' : '#1f883d',
      despesas: isDark ? '#f85149' : '#a40e26',
      saldo: isDark ? '#2f81f7' : '#0969da'
    }
  }

  const colors = getChartColors()

  // Detectar mudanças de tema
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setThemeKey(prev => prev + 1)
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

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
        <ResponsiveContainer width="100%" height="100%" key={themeKey}>
          <LineChart data={data}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.grid}
              opacity={0.3}
            />
            <XAxis 
              dataKey="mes" 
              stroke={colors.text}
              fontSize={12}
              tick={{ 
                fill: colors.text,
                fontSize: 12
              }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
            <YAxis 
              tickFormatter={formatCurrency} 
              stroke={colors.text}
              fontSize={12}
              tick={{ 
                fill: colors.text,
                fontSize: 12
              }}
              axisLine={{ stroke: colors.grid }}
              tickLine={{ stroke: colors.grid }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                color: colors.text,
                fontSize: '12px',
                fontWeight: '500'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke={colors.receitas}
              strokeWidth={3}
              name="Receitas"
              dot={{ 
                fill: colors.receitas, 
                strokeWidth: 2, 
                r: 5,
                stroke: colors.receitas
              }}
              activeDot={{ 
                r: 6, 
                fill: colors.receitas,
                stroke: colors.receitas,
                strokeWidth: 2
              }}
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke={colors.despesas}
              strokeWidth={3}
              name="Despesas"
              dot={{ 
                fill: colors.despesas, 
                strokeWidth: 2, 
                r: 5,
                stroke: colors.despesas
              }}
              activeDot={{ 
                r: 6, 
                fill: colors.despesas,
                stroke: colors.despesas,
                strokeWidth: 2
              }}
            />
            <Line 
              type="monotone" 
              dataKey="saldo" 
              stroke={colors.saldo}
              strokeWidth={3}
              name="Saldo Líquido"
              dot={{ 
                fill: colors.saldo, 
                strokeWidth: 2, 
                r: 5,
                stroke: colors.saldo
              }}
              activeDot={{ 
                r: 6, 
                fill: colors.saldo,
                stroke: colors.saldo,
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}