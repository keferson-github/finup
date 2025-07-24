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
            <h1 className="text-4xl font-bold text-fg-default dark:text-fg-dark-default mb-4">
              Controle Inteligente das Suas
              <span className="bg-gradient-to-r from-success-emphasis to-accent-emphasis dark:from-success-dark-emphasis dark:to-accent-dark-emphasis bg-clip-text text-transparent">
                {" "}Finanças Pessoais
              </span>
            </h1>
            <p className="text-lg text-fg-muted dark:text-fg-dark-muted mb-6 leading-relaxed">
              Acompanhe gastos, gerencie orçamentos e alcance suas metas financeiras com o <span className="font-semibold text-success-emphasis dark:text-success-dark-emphasis">FinUp</span>.
            </p>
            
            {/* Recursos Principais */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-fg-default dark:text-fg-dark-default mb-3">🚀 Recursos Principais</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-success-emphasis dark:bg-success-dark-emphasis rounded-full"></div>
                  <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Controle em tempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-success-emphasis dark:bg-success-dark-emphasis rounded-full"></div>
                  <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Relatórios inteligentes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-success-emphasis dark:bg-success-dark-emphasis rounded-full"></div>
                  <span className="text-sm text-fg-muted dark:text-fg-dark-muted">Planejamento de orçamentos</span>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 card">
                <div className="text-2xl font-bold text-success-emphasis dark:text-success-dark-emphasis mb-1">100%</div>
                <div className="text-sm text-fg-muted dark:text-fg-dark-muted">Seguro</div>
              </div>
              <div className="text-center p-4 card">
                <div className="text-2xl font-bold text-success-emphasis dark:text-success-dark-emphasis mb-1">24/7</div>
                <div className="text-sm text-fg-muted dark:text-fg-dark-muted">Disponível</div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="p-4 card bg-gradient-to-r from-success-subtle to-accent-subtle dark:from-success-dark-subtle dark:to-accent-dark-subtle">
              <h4 className="text-sm font-semibold text-fg-default dark:text-fg-dark-default mb-2">💡 Por que escolher o FinUp?</h4>
              <div className="text-xs text-fg-muted dark:text-fg-dark-muted space-y-1">
                <p>✓ Interface intuitiva</p>
                <p>✓ Dados protegidos</p>
                <p>✓ Insights personalizados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full relative overflow-hidden">
          <div className="transition-all duration-500 ease-in-out transform">
            <div className={`transition-all duration-500 ease-in-out transform ${
              isLogin 
                ? 'translate-x-0 opacity-100' 
                : '-translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}>
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            </div>
            <div className={`transition-all duration-500 ease-in-out transform ${
              !isLogin 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 absolute top-0 left-0 w-full'
            }`}>
              <SignUpForm onToggleMode={() => setIsLogin(true)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}