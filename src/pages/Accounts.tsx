import React from 'react'
import { Plus, CreditCard, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { AccountForm } from '../components/accounts/AccountForm'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const Accounts: React.FC = () => {
  const { accounts, loading, deleteAccount } = useAccounts()
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  const [showBalances, setShowBalances] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const getAccountTypeLabel = (type: string) => {
    const types = {
      conta_corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      cartao_credito: 'Cartão de Crédito',
      dinheiro: 'Dinheiro',
      investimento: 'Investimento'
    }
    return types[type as keyof typeof types] || type
  }

  const handleEdit = (account: any) => {
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleDelete = async (account: any) => {
    if (window.confirm(`Tem certeza que deseja excluir a conta "${account.nome}"?`)) {
      await deleteAccount(account.id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleAccountSuccess = () => {
    // A lista será atualizada automaticamente pelo hook useAccounts
    handleCloseForm()
  }

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.saldo), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho e Total de Contas Fixos */}
      <div className="sticky top-0 z-10 bg-canvas-default dark:bg-canvas-dark-default border-b border-border-default dark:border-border-dark-default">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">Contas</h1>
              <p className="text-fg-muted dark:text-fg-dark-muted mt-1">Gerencie suas contas financeiras</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="flex items-center px-4 py-2 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors"
              >
                {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showBalances ? 'Ocultar Saldos' : 'Mostrar Saldos'}
              </button>
              <button 
                onClick={() => setShowForm(true)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </button>
            </div>
          </div>

          {/* Card Total de Contas Fixo */}
          {accounts.length > 0 && (
            <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Saldo Total</p>
                  <p className="text-2xl font-bold">
                    {showBalances ? formatCurrency(totalBalance) : '••••••'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Total de Contas</p>
                  <p className="text-xl font-bold">{accounts.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Rolável - Apenas Lista de Contas */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 pt-6">

          {accounts.length === 0 ? (
            <div className="card">
              <div className="p-12 text-center">
                <CreditCard className="h-16 w-16 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
                <h3 className="text-lg font-medium text-fg-default dark:text-fg-dark-default mb-2">Nenhuma conta encontrada</h3>
                <p className="text-fg-muted dark:text-fg-dark-muted mb-6">Adicione sua primeira conta para começar a gerenciar suas finanças.</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary flex items-center mx-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeira Conta
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="divide-y divide-border-default dark:divide-border-dark-default">
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 hover:bg-neutral-subtle dark:hover:bg-neutral-dark-subtle transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${account.cor}20` }}
                        >
                          <div 
                            className="w-5 h-5 rounded-full"
                            style={{ backgroundColor: account.cor }}
                          />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-fg-default dark:text-fg-dark-default truncate">{account.nome}</h3>
                              <p className="text-sm text-fg-muted dark:text-fg-dark-muted">{getAccountTypeLabel(account.tipo)}</p>
                              {account.descricao && (
                                <p className="text-xs text-fg-muted dark:text-fg-dark-muted mt-1 truncate">{account.descricao}</p>
                              )}
                            </div>
                            <div className="ml-4 text-right flex-shrink-0">
                              <span className={`text-lg font-bold ${
                                Number(account.saldo) >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                              }`}>
                                {showBalances ? formatCurrency(Number(account.saldo)) : '••••••'}
                              </span>
                              <p className="text-xs text-fg-muted dark:text-fg-dark-muted">Saldo Atual</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
                          title="Editar conta"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors"
                          title="Excluir conta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <AccountForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSuccess={handleAccountSuccess}
        initialData={editingAccount}
        mode={editingAccount ? 'edit' : 'create'}
      />
    </div>
  )
}