import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AccountReport as IAccountReport } from '../../hooks/useReports'
import { CreditCard } from 'lucide-react'

interface AccountReportProps {
  data: IAccountReport[]
  loading: boolean
}

export const AccountReport: React.FC<AccountReportProps> = ({ data, loading }) => {
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
          <p className="font-medium text-fg-default dark:text-fg-dark-default mb-2">{data.conta}</p>
          <div className="space-y-1">
            <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
              Saldo Atual: {formatCurrency(data.saldoAtual)}
            </p>
            <p className="text-sm text-success-fg dark:text-success-dark-fg">
              Receitas: {formatCurrency(data.receitas)}
            </p>
            <p className="text-sm text-danger-fg dark:text-danger-dark-fg">
              Despesas: {formatCurrency(data.despesas)}
            </p>
            <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
              Movimentações: {data.totalMovimentacoes}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-6">Relatório por Conta</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-border-default dark:border-border-dark-default border-t-accent-emphasis dark:border-t-accent-dark-emphasis"></div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-6">Relatório por Conta</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
            <p className="text-fg-muted dark:text-fg-dark-muted">Nenhum dado de conta disponível</p>
          </div>
        </div>
      </div>
    )
  }

  // Preparar dados para o gráfico de pizza (saldos)
  const pieData = data.map(account => ({
    name: account.conta,
    value: Math.abs(account.saldoAtual),
    color: account.cor,
    originalValue: account.saldoAtual
  }))

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-6">Relatório por Conta</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Barras - Movimentações */}
        <div>
          <h4 className="text-md font-medium text-fg-default dark:text-fg-dark-default mb-4">Movimentações por Conta</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-muted)" />
                <XAxis 
                  dataKey="conta" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12, fill: 'var(--color-fg-muted)' }}
                />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: 'var(--color-fg-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="receitas" fill="var(--color-success-emphasis)" name="Receitas" />
                <Bar dataKey="despesas" fill="var(--color-danger-emphasis)" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza - Distribuição de Saldos */}
        <div>
          <h4 className="text-md font-medium text-fg-default dark:text-fg-dark-default mb-4">Distribuição de Saldos</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    formatCurrency(props.payload.originalValue), 
                    'Saldo'
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="mt-8">
        <h4 className="text-md font-medium text-fg-default dark:text-fg-dark-default mb-4">Detalhamento por Conta</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-canvas-subtle dark:bg-canvas-dark-subtle">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                  Conta
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                  Saldo Atual
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                  Receitas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                  Despesas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                  Movimentações
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-fg-muted dark:text-fg-dark-muted uppercase tracking-wider">
                  Saldo Líquido
                </th>
              </tr>
            </thead>
            <tbody className="bg-canvas-default dark:bg-canvas-dark-default divide-y divide-border-default dark:divide-border-dark-default">
              {data.map((account, index) => (
                <tr key={index} className="hover:bg-canvas-subtle dark:hover:bg-canvas-dark-subtle">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: account.cor }}
                      />
                      <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
                        {account.conta}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      account.saldoAtual >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                    }`}>
                      {formatCurrency(account.saldoAtual)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-success-fg dark:text-success-dark-fg">
                      {formatCurrency(account.receitas)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-danger-fg dark:text-danger-dark-fg">
                      {formatCurrency(account.despesas)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-fg-default dark:text-fg-dark-default">
                      {account.totalMovimentacoes}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      (account.receitas - account.despesas) >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                    }`}>
                      {formatCurrency(account.receitas - account.despesas)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}