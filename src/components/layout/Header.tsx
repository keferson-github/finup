import React from 'react'
import { Search, Plus } from 'lucide-react'
import { NotificationCenter } from '../notifications/NotificationCenter'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useAuthContext } from '../../contexts/AuthContext'

interface HeaderProps {
  onAddTransaction?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onAddTransaction }) => {
  const { user } = useAuthContext()

  return (
    <header className="bg-canvas-default dark:bg-canvas-dark-default border-b border-border-default dark:border-border-dark-default px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
            <input
              type="text"
              placeholder="Buscar transações, contas, categorias..."
              className="input pl-10"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </button>
          )}

          <ThemeToggle />
          <NotificationCenter />

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-fg-default dark:text-fg-dark-default">
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                {user?.email}
              </p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-success-emphasis to-accent-emphasis dark:from-success-dark-emphasis dark:to-accent-dark-emphasis rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}