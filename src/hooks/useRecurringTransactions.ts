import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export interface RecurringTemplate {
  id: string
  user_id: string
  name: string
  account_id: string
  category_id: string | null
  title: string
  description: string | null
  amount: number
  type: 'income' | 'expense'
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  start_date: string
  end_date: string | null
  next_execution_date: string
  is_active: boolean
  created_at: string
  updated_at: string
  account?: {
    name: string
    color: string
  }
  category?: {
    name: string
    color: string
    icon: string
  }
}

export const useRecurringTransactions = () => {
  const { user } = useAuthContext()
  const [templates, setTemplates] = useState<RecurringTemplate[]>([])
  const [loading, setLoading] = useState(false)

  const loadTemplates = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('recurring_templates')
        .select(`
          *,
          accounts(name, color),
          categories(name, color, icon)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedTemplates = data?.map(template => ({
        ...template,
        account: template.accounts ? {
          name: template.accounts.name,
          color: template.accounts.color
        } : undefined,
        category: template.categories ? {
          name: template.categories.name,
          color: template.categories.color,
          icon: template.categories.icon
        } : undefined
      })) || []

      setTemplates(formattedTemplates)
    } catch (error: any) {
      console.error('Error loading recurring templates:', error)
      toast.error('Failed to load recurring templates')
    } finally {
      setLoading(false)
    }
  }

  const createTemplate = async (template: {
    name: string
    account_id: string
    category_id?: string
    title: string
    description?: string
    amount: number
    type: 'income' | 'expense'
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    start_date: string
    end_date?: string
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('recurring_templates')
        .insert({
          ...template,
          user_id: user.id,
          next_execution_date: template.start_date
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Recurring template created successfully!')
      await loadTemplates()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating recurring template:', error)
      toast.error(error.message || 'Failed to create recurring template')
      return { success: false, error: error.message }
    }
  }

  const updateTemplate = async (id: string, updates: Partial<RecurringTemplate>) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('recurring_templates')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Recurring template updated successfully!')
      await loadTemplates()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating recurring template:', error)
      toast.error(error.message || 'Failed to update recurring template')
      return { success: false, error: error.message }
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('recurring_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Recurring template deleted successfully!')
      await loadTemplates()
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting recurring template:', error)
      toast.error(error.message || 'Failed to delete recurring template')
      return { success: false, error: error.message }
    }
  }

  const toggleTemplate = async (id: string, isActive: boolean) => {
    return updateTemplate(id, { is_active: isActive })
  }

  const executeTemplate = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      // Call the database function to generate the next transaction
      const { error } = await supabase.rpc('generate_recurring_transaction', {
        template_id: id
      })

      if (error) throw error

      toast.success('Recurring transaction executed successfully!')
      await loadTemplates()
      return { success: true }
    } catch (error: any) {
      console.error('Error executing recurring template:', error)
      toast.error(error.message || 'Failed to execute recurring template')
      return { success: false, error: error.message }
    }
  }

  const getActiveTemplates = () => {
    return templates.filter(template => template.is_active)
  }

  const getUpcomingExecutions = () => {
    const today = new Date().toISOString().split('T')[0]
    return templates.filter(template => 
      template.is_active && 
      template.next_execution_date <= today
    )
  }

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly'
    }
    return labels[frequency as keyof typeof labels] || frequency
  }

  useEffect(() => {
    if (user) {
      loadTemplates()
    }
  }, [user])

  return {
    templates,
    loading,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplate,
    executeTemplate,
    getActiveTemplates,
    getUpcomingExecutions,
    getFrequencyLabel
  }
}