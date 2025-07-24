import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export interface UserProfile {
  id: string
  email: string
  nome_completo: string | null
  avatar_url: string | null
  moeda: string
  fuso_horario: string
  criado_em: string
  atualizado_em: string
}

export interface UserPreferences {
  idioma: string
  tema: 'claro' | 'escuro' | 'automatico'
  moeda: string
  formato_data: string
  arredondamento: boolean
  notificacoes_email: boolean
  alertas_orcamento: boolean
}

export const useSettings = () => {
  const { user } = useAuthContext()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences>({
    idioma: 'pt-BR',
    tema: 'claro',
    moeda: 'BRL',
    formato_data: 'DD/MM/YYYY',
    arredondamento: false,
    notificacoes_email: true,
    alertas_orcamento: true
  })
  const [loading, setLoading] = useState(false)

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error)
      toast.error('Erro ao carregar dados do perfil')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: {
    nome_completo?: string
    avatar_url?: string
  }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      toast.success('Perfil atualizado com sucesso!')
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error(error.message || 'Erro ao atualizar perfil')
      return { success: false, error: error.message }
    }
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const updatedPreferences = { ...preferences, ...newPreferences }
      
      // Salvar no localStorage para persistência
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences))
      
      setPreferences(updatedPreferences)
      toast.success('Preferências atualizadas com sucesso!')
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao atualizar preferências:', error)
      toast.error('Erro ao atualizar preferências')
      return { success: false, error: error.message }
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      // Verificar senha atual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      })

      if (signInError) {
        throw new Error('Senha atual incorreta')
      }

      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      toast.success('Senha alterada com sucesso!')
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      toast.error(error.message || 'Erro ao alterar senha')
      return { success: false, error: error.message }
    }
  }

  const deleteAccount = async (password: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      // Verificar senha antes de excluir
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
      })

      if (signInError) {
        throw new Error('Senha incorreta')
      }

      // Excluir dados do usuário (cascade delete)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (deleteError) throw deleteError

      toast.success('Conta excluída com sucesso!')
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error)
      toast.error(error.message || 'Erro ao excluir conta')
      return { success: false, error: error.message }
    }
  }

  const getAccountStats = async () => {
    if (!user) return null

    try {
      // Buscar estatísticas da conta
      const [accountsResult, transactionsResult, categoriesResult] = await Promise.all([
        supabase.from('accounts').select('id').eq('user_id', user.id),
        supabase.from('transactions').select('id').eq('user_id', user.id),
        supabase.from('categories').select('id').eq('user_id', user.id)
      ])

      return {
        totalContas: accountsResult.data?.length || 0,
        totalTransacoes: transactionsResult.data?.length || 0,
        totalCategorias: categoriesResult.data?.length || 0
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      return null
    }
  }

  // Carregar preferências do localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userPreferences')
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Erro ao carregar preferências salvas:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  return {
    profile,
    preferences,
    loading,
    loadProfile,
    updateProfile,
    updatePreferences,
    changePassword,
    deleteAccount,
    getAccountStats
  }
}