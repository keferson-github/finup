import React, { createContext, useContext, useCallback } from 'react'
import { useDashboard } from '../hooks/useDashboard'

interface DashboardContextType {
  refreshDashboard: () => Promise<void>
  refreshDashboardSilently: () => Promise<void>
  loading: boolean
  summary: any
  evolution: any
  categorySummary: any
  recentTransactions: any
  upcomingTransactions: any
  budgetStatus: any
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dashboardData = useDashboard()

  const refreshDashboard = useCallback(async () => {
    await dashboardData.loadAllDashboardData()
  }, [dashboardData.loadAllDashboardData])

  const refreshDashboardSilently = useCallback(async () => {
    await dashboardData.refreshDashboardSilently()
  }, [dashboardData.refreshDashboardSilently])

  const value = {
    ...dashboardData,
    refreshDashboard,
    refreshDashboardSilently
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboardContext = () => {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return context
}