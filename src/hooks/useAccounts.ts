import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
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
  criado_em: string
  atualizado_em: string
}

export const useAccounts = () => {
  const { user } = useAuthContext()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)

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
    description?: string
  }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...account,
          user_id: user.id,
          saldo: account.saldo_inicial,
          descricao: account.description
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Conta criada com sucesso!')
      await loadAccounts()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating account:', error)
      toast.error(error.message || 'Erro ao criar conta')
      return { success: false, error: error.message }
    }
  }

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Conta atualizada com sucesso!')
      await loadAccounts()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating account:', error)
      toast.error(error.message || 'Erro ao atualizar conta')
      return { success: false, error: error.message }
    }
  }

  const deleteAccount = async (id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

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
          .update({ ativo: false })
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Conta arquivada com sucesso!')
      } else {
        // Hard delete if no transactions
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Conta excluída com sucesso!')
      }

      await loadAccounts()
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Erro ao excluir conta')
      return { success: false, error: error.message }
    }
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + Number(account.saldo), 0)
  }

  useEffect(() => {
    if (user) {
      loadAccounts()
    }
  }, [user])

  return {
    accounts,
    loading,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance
  }
}