import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  CreditCard, 
  Tag, 
  BarChart3, 
  Calendar,
  Target,
  Settings,
  LogOut,
  Bug
} from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { Logo } from '../ui/Logo'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transações', href: '/transactions', icon: ArrowUpDown },
  { name: 'Contas', href: '/accounts', icon: CreditCard },
  { name: 'Categorias', href: '/categories', icon: Tag },
  { name: 'Relatórios', href: '/reports', icon: BarChart3 },
  { name: 'Calendário', href: '/calendar', icon: Calendar },
  { name: 'Orçamentos', href: '/budgets', icon: Target },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Teste Sync', href: '/test-sync', icon: Bug },
]

export const Sidebar: React.FC = () => {
  const { signOut } = useAuthContext()

  return (
    <div className="fixed left-0 top-0 flex h-full w-64 flex-col bg-canvas-default dark:bg-canvas-dark-default border-r border-border-default dark:border-border-dark-default z-10">
      <div className="flex flex-col flex-1">
        <div className="px-6 py-8">
          <Logo size="md" showText={true} />
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}`
              }
            >
              <item.icon
                className="mr-3 h-5 w-5 transition-colors"
                aria-hidden="true"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4">
          <button
            onClick={signOut}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg hover:bg-danger-subtle dark:hover:bg-danger-dark-subtle rounded-md transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:text-danger-fg dark:group-hover:text-danger-dark-fg transition-colors" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}