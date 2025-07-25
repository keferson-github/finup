import React, { useState } from 'react'
import { useDashboardContext } from '../contexts/DashboardContext'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { EvolutionChart } from '../components/dashboard/EvolutionChart'
import { CategoryChart } from '../components/dashboard/CategoryChart'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { UpcomingTransactions } from '../components/dashboard/UpcomingTransactions'
import { BudgetStatus } from '../components/dashboard/BudgetStatus'
import { FinancialHealth } from '../components/dashboard/FinancialHealth'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const Dashboard: React.FC = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  
  const {
    loading,
    summary,
    evolution,
    categorySummary,
    recentTransactions,
    upcomingTransactions,
    budgetStatus
  } = useDashboardContext()



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

      {/* Seção de Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Transações Recentes */}
        <div>
          <RecentTransactions 
            data={recentTransactions} 
            loading={loading}
          />
        </div>

        {/* Próximas Transações */}
        <div>
          <UpcomingTransactions data={upcomingTransactions} loading={loading} />
        </div>
      </div>

      {/* Status dos Orçamentos e Saúde Financeira */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status dos Orçamentos */}
        <BudgetStatus data={budgetStatus} loading={loading} />
        
        {/* Saúde Financeira */}
        <FinancialHealth
          summary={summary}
          evolution={evolution}
          budgetStatus={budgetStatus}
          loading={loading}
        />
      </div>
      
      {/* Modal de Transação */}
      <TransactionForm
        isOpen={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
      />
    </div>
  )
}