import React, { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignUpForm } from '../components/auth/SignUpForm'

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-canvas-default dark:bg-canvas-dark-default flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold text-fg-default dark:text-fg-dark-default mb-6">
              Controle Inteligente das Suas
              <span className="bg-gradient-to-r from-success-emphasis to-accent-emphasis dark:from-success-dark-emphasis dark:to-accent-dark-emphasis bg-clip-text text-transparent">
                {" "}Finanças Pessoais
              </span>
            </h1>
            <p className="text-xl text-fg-muted dark:text-fg-dark-muted mb-8 leading-relaxed">
              Acompanhe gastos, gerencie orçamentos e alcance suas metas financeiras com o <span className="font-semibold text-success-emphasis dark:text-success-dark-emphasis">FinUp</span> - sua plataforma completa de gestão financeira.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 card">
                <div className="text-3xl font-bold text-success-emphasis dark:text-success-dark-emphasis mb-2">100%</div>
                <div className="text-fg-muted dark:text-fg-dark-muted">Seguro</div>
              </div>
              <div className="text-center p-6 card">
                <div className="text-3xl font-bold text-success-emphasis dark:text-success-dark-emphasis mb-2">24/7</div>
                <div className="text-fg-muted dark:text-fg-dark-muted">Disponível</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  )
}