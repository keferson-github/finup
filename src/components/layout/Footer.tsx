import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 right-0 left-64 bg-canvas-default dark:bg-canvas-dark-default border-t border-border-default dark:border-border-dark-default px-6 py-4 z-10">
      <div className="flex items-center justify-center">
        <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
          © 2025 <span className="font-semibold text-fg-default dark:text-fg-dark-default">Tech Solutions Pro</span>. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}