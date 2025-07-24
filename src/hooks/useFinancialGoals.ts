import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export interface FinancialGoal {
  id: string
  user_id: string
  name: string
  description: string | null
  target_amount: number
  current_amount: number
  target_date: string | null
  category_id: string | null
  is_achieved: boolean
  created_at: string
  updated_at: string
  category?: {
    name: string
    color: string
    icon: string
  }
  progress_percentage: number
  remaining_amount: number
  days_remaining: number | null
}

export const useFinancialGoals = () => {
  const { user } = useAuthContext()
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [loading, setLoading] = useState(false)

  const loadGoals = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('financial_goals')
        .select(`
          *,
          categories(name, color, icon)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const goalsWithProgress = data?.map(goal => {
        const progress_percentage = goal.target_amount > 0 
          ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
          : 0
        
        const remaining_amount = Math.max(goal.target_amount - goal.current_amount, 0)
        
        let days_remaining = null
        if (goal.target_date) {
          const today = new Date()
          const targetDate = new Date(goal.target_date)
          const diffTime = targetDate.getTime() - today.getTime()
          days_remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        return {
          ...goal,
          progress_percentage,
          remaining_amount,
          days_remaining,
          category: goal.categories ? {
            name: goal.categories.name,
            color: goal.categories.color,
            icon: goal.categories.icon
          } : undefined
        }
      }) || []

      setGoals(goalsWithProgress)
    } catch (error: any) {
      console.error('Error loading financial goals:', error)
      toast.error('Failed to load financial goals')
    } finally {
      setLoading(false)
    }
  }

  const createGoal = async (goal: {
    name: string
    description?: string
    target_amount: number
    target_date?: string
    category_id?: string
  }) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .insert({
          ...goal,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Financial goal created successfully!')
      await loadGoals()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating financial goal:', error)
      toast.error(error.message || 'Failed to create financial goal')
      return { success: false, error: error.message }
    }
  }

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Financial goal updated successfully!')
      await loadGoals()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating financial goal:', error)
      toast.error(error.message || 'Failed to update financial goal')
      return { success: false, error: error.message }
    }
  }

  const updateGoalProgress = async (id: string, amount: number) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const goal = goals.find(g => g.id === id)
      if (!goal) {
        throw new Error('Goal not found')
      }

      const newCurrentAmount = Math.max(0, goal.current_amount + amount)
      const isAchieved = newCurrentAmount >= goal.target_amount

      const { data, error } = await supabase
        .from('financial_goals')
        .update({
          current_amount: newCurrentAmount,
          is_achieved: isAchieved
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Create notification if goal is achieved
      if (isAchieved && !goal.is_achieved) {
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            title: 'Goal Achieved! 🎉',
            message: `Congratulations! You've achieved your goal: ${goal.name}`,
            type: 'goal_achieved'
          })
      }

      toast.success('Goal progress updated successfully!')
      await loadGoals()
      return { success: true, data }
    } catch (error: any) {
      console.error('Error updating goal progress:', error)
      toast.error(error.message || 'Failed to update goal progress')
      return { success: false, error: error.message }
    }
  }

  const deleteGoal = async (id: string) => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Financial goal deleted successfully!')
      await loadGoals()
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting financial goal:', error)
      toast.error(error.message || 'Failed to delete financial goal')
      return { success: false, error: error.message }
    }
  }

  const getAchievedGoals = () => {
    return goals.filter(goal => goal.is_achieved)
  }

  const getActiveGoals = () => {
    return goals.filter(goal => !goal.is_achieved)
  }

  const getOverdueGoals = () => {
    return goals.filter(goal => 
      !goal.is_achieved && 
      goal.days_remaining !== null && 
      goal.days_remaining < 0
    )
  }

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  return {
    goals,
    loading,
    loadGoals,
    createGoal,
    updateGoal,
    updateGoalProgress,
    deleteGoal,
    getAchievedGoals,
    getActiveGoals,
    getOverdueGoals
  }
}