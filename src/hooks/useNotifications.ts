import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'budget_alert' | 'overdue_transaction' | 'recurring_reminder' | 'goal_achieved'
  is_read: boolean
  action_url: string | null
  related_transaction_id: string | null
  related_budget_id: string | null
  criado_em: string
}

export const useNotifications = () => {
  const { user } = useAuthContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadNotifications = async (limit = 50) => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(limit)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error: any) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      )
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const deleteNotification = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      const notification = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      
      toast.success('Notification deleted')
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const createNotification = async (notification: {
    title: string
    message: string
    type?: 'budget_alert' | 'overdue_transaction' | 'recurring_reminder' | 'goal_achieved'
    action_url?: string
    related_transaction_id?: string
    related_budget_id?: string
  }) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      setNotifications(prev => [data, ...prev])
      setUnreadCount(prev => prev + 1)
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Error creating notification:', error)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    if (user) {
      loadNotifications()
    }
  }, [user])

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show toast notification
          toast.success(newNotification.title, {
            duration: 5000
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  }
}