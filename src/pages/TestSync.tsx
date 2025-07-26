import React, { useState, useEffect } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useAccounts } from '../hooks/useAccounts'
import { Plus, RefreshCw } from 'lucide-react'

export const TestSync: React.FC = () => {
  const { categories, createCategory, updateCategory } = useCategories()
  const { accounts, createAccount, updateAccount } = useAccounts()
  const [logs, setLogs] = useState<string[]>([])

  // Interceptar console.log para mostrar na tela
  useEffect(() => {
    const originalLog = console.log
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      setLogs(prev => [...prev.slice(-19), `${new Date().toLocaleTimeString()}: ${message}`])
      originalLog(...args)
    }

    return () => {
      console.log = originalLog
    }
  }, [])

  const testCreateCategory = async () => {
    const randomName = `Categoria Teste ${Math.floor(Math.random() * 1000)}`
    await createCategory({
      nome: randomName,
      tipo: 'despesa',
      cor: '#3B82F6',
      icone: '🧪',
      descricao: 'Categoria criada para teste de sincronização'
    })
  }

  const testUpdateCategory = async () => {
    if (categories.length === 0) return
    
    const category = categories[0]
    await updateCategory(category.id, {
      nome: `${category.nome} (Editado ${Math.floor(Math.random() * 100)})`,
      descricao: 'Categoria editada para teste'
    })
  }

  const testCreateAccount = async () => {
    const randomName = `Conta Teste ${Math.floor(Math.random() * 1000)}`
    await createAccount({
      nome: randomName,
      tipo: 'conta_corrente',
      saldo_inicial: Math.floor(Math.random() * 10000),
      cor: '#10B981',
      description: 'Conta criada para teste de sincronização',
      banco: 'banco_do_brasil'
    })
  }

  const testUpdateAccount = async () => {
    if (accounts.length === 0) return
    
    const account = accounts[0]
    await updateAccount(account.id, {
      nome: `${account.nome} (Editado ${Math.floor(Math.random() * 100)})`,
      descricao: 'Conta editada para teste'
    })
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border-default dark:border-border-dark-default">
        <h1 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default mb-4">
          Teste de Sincronização
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <button
            onClick={testCreateCategory}
            className="btn btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Categoria
          </button>
          
          <button
            onClick={testUpdateCategory}
            disabled={categories.length === 0}
            className="btn btn-secondary flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Editar Categoria
          </button>
          
          <button
            onClick={testCreateAccount}
            className="btn btn-primary flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Conta
          </button>
          
          <button
            onClick={testUpdateAccount}
            disabled={accounts.length === 0}
            className="btn btn-secondary flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Editar Conta
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-fg-muted dark:text-fg-dark-muted">
            Categorias: {categories.length} | Contas: {accounts.length}
          </div>
          <button
            onClick={clearLogs}
            className="btn btn-secondary text-sm"
          >
            Limpar Logs
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-neutral-subtle dark:bg-neutral-dark-subtle rounded-lg p-4">
          <h2 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-4">
            Console Logs (Tempo Real)
          </h2>
          
          <div className="space-y-1 font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-fg-muted dark:text-fg-dark-muted">
                Nenhum log ainda. Execute uma ação para ver os logs.
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    log.includes('✅') ? 'bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg' :
                    log.includes('🎉') ? 'bg-accent-subtle dark:bg-accent-dark-subtle text-accent-fg dark:text-accent-dark-fg' :
                    log.includes('📝') || log.includes('💳') ? 'bg-attention-subtle dark:bg-attention-dark-subtle text-attention-fg dark:text-attention-dark-fg' :
                    'text-fg-default dark:text-fg-dark-default'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}