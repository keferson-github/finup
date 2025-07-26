import React from 'react'
import { useDashboardSync } from '../../hooks/useDashboardSync'

interface DashboardSyncWrapperProps {
  children: React.ReactNode
}

export const DashboardSyncWrapper: React.FC<DashboardSyncWrapperProps> = ({ children }) => {
  // Ativar sincronização automática do dashboard
  useDashboardSync()
  
  return <>{children}</>
}