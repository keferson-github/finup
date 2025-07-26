import { useEffect } from 'react'
import { useDashboardContext } from '../contexts/DashboardContext'
import { useAuthContext } from '../contexts/AuthContext'

// Hook para sincronizar o dashboard automaticamente
export const useDashboardSync = () => {
  const { user } = useAuthContext()
  const { refreshDashboardSilently } = useDashboardContext()

  useEffect(() => {
    // Só ativar sincronização se o usuário estiver logado
    if (!user) return

    // Função para atualizar o dashboard
    const handleDashboardUpdate = (event: Event) => {
      console.log(`📡 Evento customizado recebido para atualização do dashboard:`, event.type)
      try {
        console.log('🔄 Chamando refreshDashboardSilently via evento customizado')
        refreshDashboardSilently()
      } catch (error) {
        console.error('❌ Erro ao atualizar dashboard via evento:', error)
      }
    }

    // Escutar eventos customizados de atualização
    window.addEventListener('transactionUpdated', handleDashboardUpdate)
    window.addEventListener('accountUpdated', handleDashboardUpdate)
    window.addEventListener('categoryUpdated', handleDashboardUpdate)
    window.addEventListener('budgetUpdated', handleDashboardUpdate)

    // Cleanup
    return () => {
      window.removeEventListener('transactionUpdated', handleDashboardUpdate)
      window.removeEventListener('accountUpdated', handleDashboardUpdate)
      window.removeEventListener('categoryUpdated', handleDashboardUpdate)
      window.removeEventListener('budgetUpdated', handleDashboardUpdate)
    }
  }, [user, refreshDashboardSilently])
}

// Função utilitária para disparar atualização do dashboard
export const triggerDashboardUpdate = (type: 'transaction' | 'account' | 'category' | 'budget') => {
  console.log(`🔔 Disparando evento ${type}Updated para atualização do dashboard`)
  window.dispatchEvent(new CustomEvent(`${type}Updated`))
}