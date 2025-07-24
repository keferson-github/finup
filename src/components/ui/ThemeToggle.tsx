import React from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const

  return (
    <div className="flex items-center gap-1 p-1 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-md border border-border-default dark:border-border-dark-default">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            theme === value
              ? 'bg-canvas-default dark:bg-canvas-dark-default text-fg-default dark:text-fg-dark-default shadow-sm'
              : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
          }`}
          title={`Switch to ${label.toLowerCase()} theme`}
        >
          <Icon className="h-3 w-3" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}