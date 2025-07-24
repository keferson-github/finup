import React, { useState } from 'react'
import { Bell, X, Check, Trash2, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { format } from 'date-fns'

export const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return '⚠️'
      case 'overdue_transaction':
        return '🔴'
      case 'recurring_reminder':
        return '🔄'
      case 'goal_achieved':
        return '🎉'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return 'border-attention-emphasis dark:border-attention-dark-emphasis bg-attention-subtle dark:bg-attention-dark-subtle'
      case 'overdue_transaction':
        return 'border-danger-emphasis dark:border-danger-dark-emphasis bg-danger-subtle dark:bg-danger-dark-subtle'
      case 'recurring_reminder':
        return 'border-accent-emphasis dark:border-accent-dark-emphasis bg-accent-subtle dark:bg-accent-dark-subtle'
      case 'goal_achieved':
        return 'border-success-emphasis dark:border-success-dark-emphasis bg-success-subtle dark:bg-success-dark-subtle'
      default:
        return 'border-neutral-emphasis dark:border-neutral-dark-emphasis bg-neutral-subtle dark:bg-neutral-dark-subtle'
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-canvas-default dark:bg-canvas-dark-default rounded-xl border border-border-default dark:border-border-dark-default z-50">
          <div className="p-4 border-b border-border-default dark:border-border-dark-default">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Notificações</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-default dark:border-border-dark-default border-t-accent-emphasis dark:border-t-accent-dark-emphasis mx-auto"></div>
                <p className="text-fg-muted dark:text-fg-dark-muted mt-2">Carregando notificações...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
                <p className="text-fg-muted dark:text-fg-dark-muted">Nenhuma notificação ainda</p>
              </div>
            ) : (
              <div className="divide-y divide-border-default dark:divide-border-dark-default">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-canvas-subtle dark:hover:bg-canvas-dark-subtle transition-colors ${
                      !notification.is_read ? 'bg-accent-subtle dark:bg-accent-dark-subtle' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              !notification.is_read ? 'text-fg-default dark:text-fg-dark-default' : 'text-fg-muted dark:text-fg-dark-muted'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-fg-muted dark:text-fg-dark-muted opacity-75 mt-2">
                              {format(new Date(notification.criado_em), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
                                title="Marcar como lida"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors"
                              title="Excluir notificação"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-border-default dark:border-border-dark-default text-center">
              <button className="text-sm text-accent-fg dark:text-accent-dark-fg hover:text-accent-emphasis dark:hover:text-accent-dark-emphasis font-medium">
                Ver Todas as Notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}