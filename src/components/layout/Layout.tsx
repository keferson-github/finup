import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-canvas-inset dark:bg-canvas-dark-inset">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header />
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}