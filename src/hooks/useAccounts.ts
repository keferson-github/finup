import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { triggerDashboardUpdate } from './useDashboardSync'
import toast from 'react-hot-toast'

export interface Account {
  id: string
  user_id: string
  nome: string
  tipo: 'conta_corrente' | 'poupanca' | 'cartao_credito' | 'dinheiro' | 'investimento'
  saldo: number
  saldo_inicial: number
  cor: string
  descricao: string | null
  ativo: boolean
  banco?: string | null
  bandeira_cartao?: string | null
  criado_em: string
  atualizado_em: string
}

export const useAccounts = () => {
  const { user } = useAuthContext()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Debug: Log do estado do usuário
  console.log('💳 🔍 [DEBUG] useAccounts - Estado do usuário:', {
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    accountsCount: accounts.length
  })

  const loadAccounts = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log('💳 📥 [LOAD] Carregando contas para usuário:', user.id)

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: true })

      if (error) {
        console.error('💳 ❌ [LOAD] Erro na query:', error)
        throw error
      }

      console.log('💳 ✅ [LOAD] Contas carregadas:', data?.length || 0)
      console.log('💳 📋 [LOAD] Lista:', data?.map(acc => `${acc.nome} (${acc.id.slice(-8)})`).join(', ') || 'Nenhuma')
      
      setAccounts(data || [])
    } catch (error: any) {
      console.error('💳 ❌ [LOAD] Error loading accounts:', error)
      toast.error('Erro ao carregar contas')
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async (account: {
    nome: string
    tipo: 'conta_corrente' | 'poupanca' | 'cartao_credito' | 'dinheiro' | 'investimento'
    saldo_inicial: number
    cor?: string
    descricao?: string
    banco?: string
    bandeira_cartao?: string
  }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    console.log('💳 Criando nova conta:', account.nome)
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          nome: account.nome,
          tipo: account.tipo,
          saldo_inicial: account.saldo_inicial,
          saldo: account.saldo_inicial,
          cor: account.cor,
          descricao: account.descricao,
          user_id: user.id,
          ativo: true,
          banco: account.banco || null,
          bandeira_cartao: account.bandeira_cartao || null
        })
        .select()
        .single()

      if (error) throw error

      // Atualiza o estado local imediatamente para feedback instantâneo
      const newAccount = {
        ...data,
        criado_em: data.criado_em || new Date().toISOString(),
        atualizado_em: data.atualizado_em || new Date().toISOString()
      }

      setAccounts(prevAccounts => {
        // Verificar se a conta já existe para evitar duplicatas
        const exists = prevAccounts.some(acc => acc.id === newAccount.id)
        if (!exists) {
          const updatedAccounts = [...prevAccounts, newAccount]
          console.log('💳 ✅ Nova conta adicionada:', account.nome, 'Total:', updatedAccounts.length)
          return updatedAccounts
        }
        console.log('💳 ⚠️ Conta já existe no estado local:', account.nome)
        return prevAccounts
      })

      toast.success('Conta criada com sucesso!')

      // Disparar atualização do dashboard
      triggerDashboardUpdate('account')
      
      // Forçar recarregamento após 500ms para garantir sincronização
      setTimeout(() => {
        console.log('💳 🔄 [CREATE] Forçando recarregamento para garantir sincronização')
        loadAccounts()
      }, 500)

      return { success: true, data: newAccount }
    } catch (error: any) {
      console.error('Error creating account:', error)
      toast.error(error.message || 'Erro ao criar conta')
      return { success: false, error: error.message }
    } finally {
      setCreating(false)
    }
  }

  const updateAccount = async (id: string, updates: {
    nome?: string
    tipo?: 'conta_corrente' | 'poupanca' | 'cartao_credito' | 'dinheiro' | 'investimento'
    saldo_inicial?: number
    cor?: string
    descricao?: string
    banco?: string
    bandeira_cartao?: string
  }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    console.log('💳 Iniciando edição da conta:', id, updates)
    setUpdating(true)
    try {
      // Preparar dados para atualização
      const updateData: any = {
        ...updates,
        atualizado_em: new Date().toISOString()
      }

      // Se saldo_inicial foi alterado, atualizar também o saldo atual
      if (updates.saldo_inicial !== undefined) {
        updateData.saldo = updates.saldo_inicial
      }

      const { data, error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Atualiza o estado local imediatamente
      setAccounts(prevAccounts => {
        const updatedAccounts = prevAccounts.map(account =>
          account.id === id ? { ...account, ...data, atualizado_em: data.atualizado_em || new Date().toISOString() } : account
        )
        console.log('💳 ✅ Conta atualizada:', data.nome, 'ID:', id)
        return updatedAccounts
      })

      toast.success('Conta atualizada com sucesso!')

      // Disparar atualização do dashboard
      triggerDashboardUpdate('account')
      
      // Forçar recarregamento após 500ms para garantir sincronização
      setTimeout(() => {
        console.log('💳 🔄 [UPDATE] Forçando recarregamento para garantir sincronização')
        loadAccounts()
      }, 500)

      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating account:', error)
      toast.error(error.message || 'Erro ao atualizar conta')
      return { success: false, error: error.message }
    } finally {
      setUpdating(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    console.log('💳 Iniciando exclusão da conta:', id)
    setDeleting(true)
    try {
      // Check if account has transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('account_id', id)
        .limit(1)

      if (transactions && transactions.length > 0) {
        // Soft delete by marking as inactive
        const { error } = await supabase
          .from('accounts')
          .update({
            ativo: false,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        // Remove da lista local imediatamente (soft delete)
        setAccounts(prevAccounts => {
          const filteredAccounts = prevAccounts.filter(account => account.id !== id)
          console.log('💳 Conta arquivada (soft delete) - Total anterior:', prevAccounts.length)
          console.log('💳 Total após arquivamento:', filteredAccounts.length)
          return filteredAccounts
        })

        toast.success('Conta arquivada com sucesso!')
      } else {
        // Hard delete if no transactions
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        // Remove da lista local imediatamente (hard delete)
        setAccounts(prevAccounts => {
          const filteredAccounts = prevAccounts.filter(account => account.id !== id)
          console.log('💳 Conta excluída (hard delete) - Total anterior:', prevAccounts.length)
          console.log('💳 Total após exclusão:', filteredAccounts.length)
          return filteredAccounts
        })

        toast.success('Conta excluída com sucesso!')
      }

      // Disparar atualização do dashboard
      triggerDashboardUpdate('account')

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Erro ao excluir conta')
      return { success: false, error: error.message }
    } finally {
      setDeleting(false)
    }
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + Number(account.saldo), 0)
  }



  useEffect(() => {
    if (user) {
      console.log('💳 🚀 Inicializando useAccounts para usuário:', user.id)
      
      // Carregar contas
      loadAccounts()

      // Configurar listener simplificado para mudanças em tempo real
      const channelName = `accounts-simple-${user.id}`
      console.log('💳 📡 [REALTIME] Criando canal:', channelName)
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const recordId = (payload.new as any)?.id || (payload.old as any)?.id
            console.log('💳 📡 [REALTIME] Evento recebido:', payload.eventType, 'ID:', recordId)
            
            // Simplesmente recarregar a lista após qualquer mudança
            setTimeout(() => {
              console.log('💳 🔄 [REALTIME] Recarregando lista após evento:', payload.eventType)
              loadAccounts()
            }, 200)
          }
        )
        .subscribe((status) => {
          console.log('💳 📡 [REALTIME] Status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('💳 ✅ [REALTIME] Listener ativo!')
          }
        })

      // Cleanup function
      return () => {
        console.log('💳 🧹 [REALTIME] Removendo listener para contas')
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  return {
    accounts,
    loading,
    creating,
    updating,
    deleting,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance
  }
}