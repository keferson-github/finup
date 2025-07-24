import React from 'react'
import { Target, Plus } from 'lucide-react'
import { useState } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import { BudgetForm } from '../components/budgets/BudgetForm'
import { BudgetCard } from '../components/budgets/BudgetCard'
import { BudgetSummary } from '../components/budgets/BudgetSummary'
import { BudgetAlerts } from '../components/budgets/BudgetAlerts'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const Budgets: React.FC = () => {
  const { 
    budgets, 
    loading, 
    deleteBudget, 
    getOrcamentosUltrapassados,
    getOrcamentosEmAlerta,
    getResumoGeral
  } = useBudgets()
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)

  const handleEdit = (budget: any) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleDelete = async (budget: any) => {
    if (window.confirm(`Tem certeza que deseja excluir o orçamento "${budget.name}"?`)) {
      await deleteBudget(budget.id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  // Obter dados para componentes
  const resumoGeral = getResumoGeral()
  const orcamentosUltrapassados = getOrcamentosUltrapassados()
  const orcamentosEmAlerta = getOrcamentosEmAlerta()

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">Orçamentos</h1>
          <p className="text-fg-muted dark:text-fg-dark-muted text-sm mt-1">Controle seus gastos</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Orçamento
        </button>
      </div>

      {/* Resumo Geral */}
      <BudgetSummary data={resumoGeral} loading={loading} />

      {/* Alertas */}
      <BudgetAlerts 
        orcamentosUltrapassados={orcamentosUltrapassados}
        orcamentosEmAlerta={orcamentosEmAlerta}
      />

      {/* Lista de Orçamentos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="card">
          <div className="p-6 text-center">
            <Target className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-3" />
            <h3 className="text-base font-medium text-fg-default dark:text-fg-dark-default mb-2">Nenhum orçamento</h3>
            <p className="text-fg-muted dark:text-fg-dark-muted text-sm mb-4">Crie seu primeiro orçamento.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex items-center mx-auto text-sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Criar Orçamento
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <BudgetForm
        isOpen={showForm}
        onClose={handleCloseForm}
        initialData={editingBudget}
        mode={editingBudget ? 'edit' : 'create'}
      />
    </div>
  )
}