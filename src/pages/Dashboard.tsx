import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../hooks/useDashboard'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { EvolutionChart } from '../components/dashboard/EvolutionChart'
import { CategoryChart } from '../components/dashboard/CategoryChart'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { UpcomingTransactions } from '../components/dashboard/UpcomingTransactions'
import { BudgetStatus } from '../components/dashboard/BudgetStatus'
import { QuickActions } from '../components/dashboard/QuickActions'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  
  const {
    loading,
    summary,
    evolution,
    categorySummary,
    recentTransactions,
    upcomingTransactions,
    budgetStatus
  } = useDashboard()

  const handleAddTransaction = () => {
    setShowTransactionForm(true)
  }

  const handleAddAccount = () => {
    navigate('/accounts')
  }

  const handleViewReports = () => {
    navigate('/reports')
  }

  const handleViewBudgets = () => {
    navigate('/budgets')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg-default dark:text-fg-dark-default">Dashboard</h1>
        <p className="text-fg-muted dark:text-fg-dark-muted mt-2">
          Visão geral da sua situação financeira
        </p>
      </div>

      {/* Cards de Resumo */}
      <SummaryCards data={summary} loading={loading} />

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <EvolutionChart data={evolution} loading={loading} />
        <CategoryChart data={categorySummary} loading={loading} />
      </div>

      {/* Seção Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transações Recentes */}
        <div className="lg:col-span-2">
          <RecentTransactions 
            data={recentTransactions} 
            loading={loading}
            onAddTransaction={handleAddTransaction}
          />
        </div>

        {/* Sidebar Direita */}
        <div className="space-y-6">
          {/* Próximas Transações */}
          <UpcomingTransactions data={upcomingTransactions} loading={loading} />
          
          {/* Status dos Orçamentos */}
          <BudgetStatus data={budgetStatus} loading={loading} />
          
          {/* Ações Rápidas */}
          <QuickActions
            onAddTransaction={handleAddTransaction}
            onAddAccount={handleAddAccount}
            onViewReports={handleViewReports}
            onViewBudgets={handleViewBudgets}
          />
        </div>
      </div>
      
      {/* Modal de Transação */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
      />
    </div>
  )
}