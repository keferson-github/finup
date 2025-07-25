import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export interface Category {
  id: string
  user_id: string
  nome: string
  tipo: 'receita' | 'despesa'
  cor: string
  icone: string
  descricao: string | null
  ativo: boolean
  criado_em: string
}

export const useCategories = () => {
  const { user } = useAuthContext()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  const loadCategories = async (tipo?: 'receita' | 'despesa') => {
    if (!user) return

    try {
      setLoading(true)
      
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (tipo) {
        query = query.eq('tipo', tipo)
      }

      const { data, error } = await query

      if (error) throw error

      setCategories(data || [])
    } catch (error: any) {
      console.error('Error loading categories:', error)
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (category: {
    nome: string
    tipo: 'receita' | 'despesa'
    cor?: string
    icone?: string
    descricao?: string
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      // Verificar se já existe categoria com mesmo nome e tipo
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('nome', category.nome)
        .eq('tipo', category.tipo)
        .eq('ativo', true)
        .single()

      if (existing) {
        toast.error('Já existe uma categoria com este nome para este tipo')
        return { success: false, error: 'Category name already exists for this type' }
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Categoria criada com sucesso!')
      await loadCategories()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating category:', error)
      toast.error(error.message || 'Erro ao criar categoria')
      return { success: false, error: error.message }
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      // Se está atualizando nome, verificar duplicatas
      if (updates.nome) {
        const currentCategory = categories.find(cat => cat.id === id)
        if (currentCategory) {
          const { data: existing } = await supabase
            .from('categories')
            .select('id')
            .eq('user_id', user.id)
            .eq('nome', updates.nome)
            .eq('tipo', updates.tipo || currentCategory.tipo)
            .eq('ativo', true)
            .neq('id', id)
            .single()

          if (existing) {
            toast.error('Já existe uma categoria com este nome para este tipo')
            return { success: false, error: 'Category name already exists for this type' }
          }
        }
      }

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Atualizar o estado local imediatamente para uma resposta mais rápida
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === id ? { ...category, ...data } : category
        )
      )
      
      toast.success('Categoria atualizada com sucesso!')
      // Carregar categorias em segundo plano para garantir sincronização
      loadCategories()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating category:', error)
      toast.error(error.message || 'Erro ao atualizar categoria')
      return { success: false, error: error.message }
    }
  }

  const deleteCategory = async (id: string, replacementCategoryId?: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      // Check if category has transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (transactions && transactions.length > 0) {
        if (replacementCategoryId) {
          // Replace category in all transactions
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ category_id: replacementCategoryId })
            .eq('category_id', id)
            .eq('user_id', user.id)

          if (updateError) throw updateError

          // Now delete the category
          const { error: deleteError } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

          if (deleteError) throw deleteError
          toast.success('Categoria excluída e transações transferidas!')
        } else {
          // Soft delete by marking as inactive
          const { error } = await supabase
            .from('categories')
            .update({ ativo: false })
            .eq('id', id)
            .eq('user_id', user.id)

          if (error) throw error
          toast.success('Categoria arquivada com sucesso!')
        }
      } else {
        // Hard delete if no transactions
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
        toast.success('Categoria excluída com sucesso!')
      }

      await loadCategories()
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting category:', error)
      toast.error(error.message || 'Erro ao excluir categoria')
      return { success: false, error: error.message }
    }
  }

  const checkCategoryUsage = async (id: string) => {
    if (!user) return { hasTransactions: false, count: 0 }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return {
        hasTransactions: (data?.length || 0) > 0,
        count: data?.length || 0
      }
    } catch (error) {
      console.error('Error checking category usage:', error)
      return { hasTransactions: false, count: 0 }
    }
  }

  const getIncomeCategories = () => {
    return categories.filter(cat => cat.tipo === 'receita')
  }

  const getExpenseCategories = () => {
    return categories.filter(cat => cat.tipo === 'despesa')
  }

  const getCategoriesByType = (tipo: 'receita' | 'despesa') => {
    return categories.filter(cat => cat.tipo === tipo)
  }

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  return {
    categories,
    loading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    checkCategoryUsage,
    getIncomeCategories,
    getExpenseCategories,
    getCategoriesByType
  }
}