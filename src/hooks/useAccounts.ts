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

  const loadAccounts = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: true })

      if (error) throw error

      setAccounts(data || [])
    } catch (error: any) {
      console.error('Error loading accounts:', error)
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

      // Fallback: recarregar dados após um pequeno delay para garantir sincronização
      setTimeout(() => {
        console.log('💳 🔄 Fallback: recarregando contas após criação')
        loadAccounts()
      }, 1000)

      // Disparar atualização do dashboard
      triggerDashboardUpdate('account')

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

      // Fallback: recarregar dados após um pequeno delay para garantir sincronização
      setTimeout(() => {
        console.log('💳 🔄 Fallback: recarregando contas após atualização')
        loadAccounts()
      }, 1000)

      // Disparar atualização do dashboard
      triggerDashboardUpdate('account')

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
      loadAccounts()

      // Configurar listener para mudanças em tempo real
      const channel = supabase
        .channel(`accounts-changes-${user.id}`, {
          config: {
            broadcast: { self: false },
            presence: { key: user.id }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'accounts',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('💳 🔄 Mudança detectada na tabela accounts:', payload.eventType, payload)
            
            if (payload.eventType === 'INSERT') {
              const newAccount = payload.new as Account
              console.log('💳 📥 INSERT detectado:', newAccount.nome, 'Ativo:', newAccount.ativo)
              if (newAccount.ativo) {
                setAccounts(prevAccounts => {
                  // Verificar se a conta já existe para evitar duplicatas
                  const exists = prevAccounts.some(acc => acc.id === newAccount.id)
                  if (!exists) {
                    const updatedAccounts = [...prevAccounts, newAccount].sort((a, b) => 
                      new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
                    )
                    console.log('💳 ✅ Nova conta adicionada via realtime:', newAccount.nome, 'Total:', updatedAccounts.length)
                    return updatedAccounts
                  }
                  console.log('💳 ⚠️ Conta já existe (realtime):', newAccount.nome)
                  return prevAccounts
                })
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedAccount = payload.new as Account
              console.log('💳 📝 UPDATE detectado:', updatedAccount.nome, 'Ativo:', updatedAccount.ativo)
              setAccounts(prevAccounts => {
                if (updatedAccount.ativo) {
                  // Verificar se a conta existe antes de atualizar
                  const exists = prevAccounts.some(acc => acc.id === updatedAccount.id)
                  if (exists) {
                    const updated = prevAccounts.map(account =>
                      account.id === updatedAccount.id ? updatedAccount : account
                    )
                    console.log('💳 ✅ Conta atualizada via realtime:', updatedAccount.nome)
                    return updated
                  } else {
                    // Adicionar conta se não existe (caso edge)
                    const updatedAccounts = [...prevAccounts, updatedAccount].sort((a, b) => 
                      new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
                    )
                    console.log('💳 ✅ Adicionando conta inexistente via realtime:', updatedAccount.nome, 'Total:', updatedAccounts.length)
                    return updatedAccounts
                  }
                } else {
                  // Remover conta se foi desativada
                  const filtered = prevAccounts.filter(account => account.id !== updatedAccount.id)
                  console.log('💳 ✅ Conta desativada via realtime:', updatedAccount.nome, 'Total:', filtered.length)
                  return filtered
                }
              })
            } else if (payload.eventType === 'DELETE') {
              const deletedAccount = payload.old as Account
              console.log('💳 🗑️ DELETE detectado:', deletedAccount.nome)
              setAccounts(prevAccounts => {
                const filtered = prevAccounts.filter(account => account.id !== deletedAccount.id)
                console.log('💳 ✅ Conta deletada via realtime:', deletedAccount.nome, 'Total:', filtered.length)
                return filtered
              })
            }
          }
        )
        .subscribe((status) => {
          console.log('💳 📡 Status da subscrição realtime:', status)
          if (status === 'SUBSCRIBED') {
            console.log('💳 ✅ Listener realtime ativo para contas')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('💳 ❌ Erro no canal realtime para contas')
          }
        })

      // Cleanup function
      return () => {
        console.log('💳 🧹 Limpando listener realtime para contas')
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