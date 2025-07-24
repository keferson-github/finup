import React, { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../../lib/supabase'
import { useAuthContext } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ChartData {
  monthlyFlow: Array<{
    month: string
    income: number
    expense: number
    net: number
  }>
  categoryExpenses: Array<{
    name: string
    value: number
    color: string
  }>
  accountBalances: Array<{
    name: string
    balance: number
    color: string
  }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export const ReportsCharts: React.FC = () => {
  const { user } = useAuthContext()
  const [chartData, setChartData] = useState<ChartData>({
    monthlyFlow: [],
    categoryExpenses: [],
    accountBalances: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(6) // 6 meses

  useEffect(() => {
    if (user) {
      loadChartData()
    }
  }, [user, selectedPeriod])

  const loadChartData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Dados do fluxo mensal
      const monthlyFlow = []
      for (let i = selectedPeriod - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const monthStart = format(startOfMonth(date), 'yyyy-MM-dd')
        const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd')
        const monthName = format(date, 'MMM/yy', { locale: ptBR })

        const { data: transactions } = await supabase
          .from('transactions')
          .select('valor, tipo')
          .eq('user_id', user.id)
          .eq('status', 'pago')
          .gte('data', monthStart)
          .lte('data', monthEnd)

        const income = transactions?.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + Number(t.valor), 0) || 0
        const expense = transactions?.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + Number(t.valor), 0) || 0

        monthlyFlow.push({
          month: monthName,
          income,
          expense,
          net: income - expense
        })
      }

      // Dados de gastos por categoria (últimos 3 meses)
      const threeMonthsAgo = format(subMonths(new Date(), 3), 'yyyy-MM-dd')
      const { data: categoryData } = await supabase
        .from('transactions')
        .select(`
          valor,
          categories(nome, cor)
        `)
        .eq('user_id', user.id)
        .eq('tipo', 'despesa')
        .eq('status', 'pago')
        .gte('data', threeMonthsAgo)
        .not('category_id', 'is', null)

      const categoryExpenses = categoryData?.reduce((acc: any[], transaction) => {
        if (!transaction.categories) return acc
        
        const existing = acc.find(item => item.name === transaction.categories.nome)
        if (existing) {
          existing.value += Number(transaction.valor)
        } else {
          acc.push({
            name: transaction.categories.nome,
            value: Number(transaction.valor),
            color: transaction.categories.cor
          })
        }
        return acc
      }, []) || []

      // Dados de saldo por conta
      const { data: accounts } = await supabase
        .from('accounts')
        .select('nome, saldo, cor')
        .eq('user_id', user.id)
        .eq('ativo', true)

      const accountBalances = accounts?.map(account => ({
        name: account.nome,
        balance: Number(account.saldo),
        color: account.cor
      })) || []

      setChartData({
        monthlyFlow,
        categoryExpenses: categoryExpenses.slice(0, 8), // Top 8 categorias
        accountBalances
      })

    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Controles */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Análise Gráfica</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={3}>Últimos 3 meses</option>
          <option value={6}>Últimos 6 meses</option>
          <option value={12}>Últimos 12 meses</option>
        </select>
      </div>

      {/* Fluxo de Caixa Mensal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Fluxo de Caixa Mensal</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.monthlyFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Receitas" />
              <Bar dataKey="expense" fill="#EF4444" name="Despesas" />
              <Bar dataKey="net" fill="#3B82F6" name="Saldo Líquido" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gastos por Categoria */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Gastos por Categoria (3 meses)</h3>
          {chartData.categoryExpenses.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryExpenses}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.categoryExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nenhum dado de categoria disponível
            </div>
          )}
        </div>

        {/* Saldo por Conta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Saldo por Conta</h3>
          {chartData.accountBalances.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.accountBalances} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={formatCurrency} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="balance" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Nenhuma conta cadastrada
            </div>
          )}
        </div>
      </div>

      {/* Evolução do Patrimônio */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução Patrimonial</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.monthlyFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Saldo Líquido Mensal"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}