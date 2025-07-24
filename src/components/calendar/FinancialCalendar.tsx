import React, { useState, useEffect } from 'react'
import { useCalendar } from '../../hooks/useCalendar'
import { CalendarFilters } from './CalendarFilters'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CalendarProps {
  onAddTransaction?: (date: string) => void
}

export const FinancialCalendar: React.FC<CalendarProps> = ({ onAddTransaction }) => {
  const {
    currentDate,
    loading,
    filters,
    getTransactionsForDate,
    getDaySummary,
    getMonthSummary,
    navigateMonth,
    goToToday,
    applyFilters,
    clearFilters,
    loadMonthTransactions
  } = useCalendar()

  const handleTransactionUpdate = () => {
    loadMonthTransactions()
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={applyFilters}
        loading={loading}
      />

      {/* Cabeçalho com Resumo */}
      <CalendarHeader
        currentDate={currentDate}
        monthSummary={getMonthSummary()}
        onNavigateMonth={navigateMonth}
        onGoToToday={goToToday}
        loading={loading}
      />

      {/* Grid do Calendário */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          getTransactionsForDate={getTransactionsForDate}
          getDaySummary={getDaySummary}
          onAddTransaction={onAddTransaction}
          onTransactionUpdate={handleTransactionUpdate}
        />
      )}
    </div>
  )
}