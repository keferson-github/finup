import React, { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg'
}) => {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-canvas-default dark:bg-canvas-dark-default rounded-2xl w-full ${maxWidthClasses[maxWidth]} max-h-[85vh] border border-border-default dark:border-border-dark-default flex flex-col`}>
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-4 border-b border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default rounded-t-2xl">
          <h2 className="text-xl font-bold text-fg-default dark:text-fg-dark-default">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer Opcional */}
        {footer && (
          <div className="p-4 border-t border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}