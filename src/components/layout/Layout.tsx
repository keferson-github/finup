import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-canvas-inset dark:bg-canvas-dark-inset">
      <Sidebar />
      <Header />
      <main className="flex-1 overflow-hidden ml-64">
        <div className="h-full overflow-y-auto pt-20 pb-16">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}