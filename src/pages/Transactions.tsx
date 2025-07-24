import React from 'react'
import { Plus, Upload } from 'lucide-react'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { TransactionList } from '../components/transactions/TransactionList'
import { DataImportModal } from '../components/import/DataImportModal'
import { useState } from 'react'

export const Transactions: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
          <p className="text-gray-600 mt-2">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowImport(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Transação
          </button>
        </div>
      </div>

      <TransactionList />
      
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />
      
      <DataImportModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
      />
    </div>
  )
}