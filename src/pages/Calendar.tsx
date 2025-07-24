import React from 'react'
import { FinancialCalendar } from '../components/calendar/FinancialCalendar'
import { TransactionForm } from '../components/transactions/TransactionForm'
import { useState } from 'react'

export const Calendar: React.FC = () => {
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const handleAddTransaction = (date: string) => {
    setSelectedDate(date)
    setShowTransactionForm(true)
  }

  const handleCloseForm = () => {
    setShowTransactionForm(false)
    setSelectedDate('')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Calendário Financeiro</h1>
        <p className="text-gray-600 mt-2">
          Visualize e gerencie suas transações em formato de calendário mensal
        </p>
      </div>

      <FinancialCalendar onAddTransaction={handleAddTransaction} />

      <TransactionForm
        isOpen={showTransactionForm}
        onClose={handleCloseForm}
        initialData={{ data: selectedDate }}
      />
    </div>
  )
}