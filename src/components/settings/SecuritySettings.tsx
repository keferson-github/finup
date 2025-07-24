import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Lock, LogOut, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { useAuthContext } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
  confirmation: z.string().min(1, 'Confirmação é obrigatória')
}).refine((data) => data.confirmation === 'EXCLUIR', {
  message: "Digite 'EXCLUIR' para confirmar",
  path: ["confirmation"]
})

type PasswordFormData = z.infer<typeof passwordSchema>
type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>

export const SecuritySettings: React.FC = () => {
  const { changePassword, deleteAccount } = useSettings()
  const { signOut } = useAuthContext()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showDeleteForm, setShowDeleteForm] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  const deleteForm = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema)
  })

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    
    try {
      const result = await changePassword(data.currentPassword, data.newPassword)
      if (result.success) {
        passwordForm.reset()
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const onDeleteSubmit = async (data: DeleteAccountFormData) => {
    setIsDeletingAccount(true)
    
    try {
      const result = await deleteAccount(data.password)
      if (result.success) {
        await signOut()
      }
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const handleLogoutAllDevices = async () => {
    if (window.confirm('Tem certeza que deseja sair de todos os dispositivos?')) {
      await signOut()
    }
  }

  return (
    <div className="space-y-6">
      {/* Alterar Senha */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Lock className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Alterar Senha</h3>
        </div>
        
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Senha Atual *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                {...passwordForm.register('currentPassword')}
                className="input pr-12"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-5 pb-1 transform -translate-y-1/2 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                {...passwordForm.register('newPassword')}
                className="input pr-12"
                placeholder="Digite sua nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-5 pb-1 transform -translate-y-1/2 text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {passwordForm.formState.errors.newPassword && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                {passwordForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Confirmar Nova Senha *
            </label>
            <input
              type="password"
              {...passwordForm.register('confirmPassword')}
              className="input"
              placeholder="Confirme sua nova senha"
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isChangingPassword && <LoadingSpinner size="sm" className="mr-2" />}
              <Lock className="h-4 w-4 mr-2" />
              Alterar Senha
            </button>
          </div>
        </form>
      </div>

      {/* Sessões e Segurança */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Shield className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Sessões e Segurança</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-canvas-subtle dark:bg-canvas-dark-subtle rounded-lg">
            <div>
              <h4 className="font-medium text-fg-default dark:text-fg-dark-default">Sair de Todos os Dispositivos</h4>
              <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
                Encerre todas as sessões ativas em outros dispositivos
              </p>
            </div>
            <button
              onClick={handleLogoutAllDevices}
              className="px-4 py-2 bg-attention-emphasis dark:bg-attention-dark-emphasis text-white rounded-lg hover:bg-attention-fg dark:hover:bg-attention-dark-fg transition-colors flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair de Todos
            </button>
          </div>
        </div>
      </div>

      {/* Zona de Perigo */}
      <div className="card border-danger-emphasis dark:border-danger-dark-emphasis">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-5 w-5 text-danger-fg dark:text-danger-dark-fg mr-2" />
          <h3 className="text-lg font-semibold text-danger-fg dark:text-danger-dark-fg">Zona de Perigo</h3>
        </div>
        
        <div className="alert alert-error mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-danger-fg dark:text-danger-dark-fg mr-2" />
            <div>
              <p className="text-sm font-medium text-danger-fg dark:text-danger-dark-fg">
                Atenção: Esta ação é irreversível
              </p>
              <p className="text-xs text-danger-fg dark:text-danger-dark-fg mt-1">
                Todos os seus dados serão permanentemente excluídos
              </p>
            </div>
          </div>
        </div>

        {!showDeleteForm ? (
          <button
            onClick={() => setShowDeleteForm(true)}
            className="btn btn-danger flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Conta
          </button>
        ) : (
          <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Digite sua senha para confirmar *
              </label>
              <input
                type="password"
                {...deleteForm.register('password')}
                className="input input-error"
                placeholder="Digite sua senha"
              />
              {deleteForm.formState.errors.password && (
                <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                  {deleteForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Digite "EXCLUIR" para confirmar *
              </label>
              <input
                type="text"
                {...deleteForm.register('confirmation')}
                className="input input-error"
                placeholder="EXCLUIR"
              />
              {deleteForm.formState.errors.confirmation && (
                <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                  {deleteForm.formState.errors.confirmation.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteForm(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isDeletingAccount}
                className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isDeletingAccount && <LoadingSpinner size="sm" className="mr-2" />}
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Conta Permanentemente
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}