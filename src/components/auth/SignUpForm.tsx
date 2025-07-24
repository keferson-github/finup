import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

interface SignUpFormProps {
  onToggleMode: () => void
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthContext()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await signUp(email, password, fullName)
    setLoading(false)
    
    if (result.success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">Criar Conta</h2>
          <p className="text-sm text-fg-muted dark:text-fg-dark-muted mt-1">Comece a gerenciar suas finanças com o <span className="font-semibold text-success-emphasis dark:text-success-dark-emphasis">FinUp</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-1">
              Nome
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input pl-9 py-2"
                placeholder="Digite seu nome"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-9 py-2"
                placeholder="Digite seu email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pl-9 pr-10 py-2"
                placeholder="Crie uma senha"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default transition-colors"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-2"
          >
            {loading ? 'Criando Conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-fg-muted dark:text-fg-dark-muted">
            Já tem uma conta?{' '}
            <button
              onClick={onToggleMode}
              className="text-accent-fg dark:text-accent-dark-fg hover:text-accent-emphasis dark:hover:text-accent-dark-emphasis font-medium transition-colors"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}