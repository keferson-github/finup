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

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.saldo), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas</h1>
          <p className="text-gray-600 mt-2">Gerencie suas contas financeiras</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showBalances ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showBalances ? 'Ocultar Saldos' : 'Mostrar Saldos'}
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </button>
        </div>
      </div>

      {/* Resumo Total */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl shadow-sm p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Saldo Total</p>
              <p className="text-3xl font-bold">
                {showBalances ? formatCurrency(totalBalance) : '••••••'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Total de Contas</p>
              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="card hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${account.cor}20` }}
                    >
                      <div 
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: account.cor }}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-fg-default dark:text-fg-dark-default">{account.nome}</h3>
                      <p className="text-sm text-fg-muted dark:text-fg-dark-muted">{getAccountTypeLabel(account.tipo)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(account)}
                      className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-default dark:border-border-dark-default pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Saldo Atual</span>
                    <span className={`text-xl font-bold ${
                      Number(account.saldo) >= 0 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg'
                    }`}>
                      {showBalances ? formatCurrency(Number(account.saldo)) : '••••••'}
                    </span>
                  </div>
                  {account.descricao && (
                    <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-2">{account.descricao}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AccountForm
        isOpen={showForm}
        onClose={handleCloseForm}
        initialData={editingAccount}
        mode={editingAccount ? 'edit' : 'create'}
      />
    </div>
  )
}