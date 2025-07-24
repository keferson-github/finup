import React from 'react'
import { Plus, TrendingUp, TrendingDown, CreditCard, BarChart3, Target } from 'lucide-react'

interface QuickActionsProps {
  onAddTransaction?: () => void
  onAddAccount?: () => void
  onViewReports?: () => void
  onViewBudgets?: () => void
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddTransaction,
  onAddAccount,
  onViewReports,
  onViewBudgets
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Ações Rápidas</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onAddTransaction}
          className="p-4 bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg rounded-lg hover:bg-success-muted dark:hover:bg-success-dark-muted transition-colors text-center group"
        >
          <TrendingUp className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Adicionar Receita</span>
        </button>
        
        <button 
          onClick={onAddTransaction}
          className="p-4 bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg rounded-lg hover:bg-danger-muted dark:hover:bg-danger-dark-muted transition-colors text-center group"
        >
          <TrendingDown className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Adicionar Despesa</span>
        </button>
        
        <button 
          onClick={onAddAccount}
          className="p-4 bg-accent-subtle dark:bg-accent-dark-subtle text-accent-fg dark:text-accent-dark-fg rounded-lg hover:bg-accent-muted dark:hover:bg-accent-dark-muted transition-colors text-center group"
        >
          <CreditCard className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Nova Conta</span>
        </button>
        
        <button 
          onClick={onViewReports}
          className="p-4 bg-attention-subtle dark:bg-attention-dark-subtle text-attention-fg dark:text-attention-dark-fg rounded-lg hover:bg-attention-muted dark:hover:bg-attention-dark-muted transition-colors text-center group"
        >
          <BarChart3 className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Ver Relatórios</span>
        </button>
      </div>
    </div>
  )
}