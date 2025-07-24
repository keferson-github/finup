import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Camera, Save } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { SecuritySettings } from './SecuritySettings'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const profileSchema = z.object({
  nome_completo: z.string().min(1, 'Nome é obrigatório'),
  avatar_url: z.string().refine(
    (val) => val === '' || z.string().url().safeParse(val).success,
    { message: 'URL inválida' }
  ).optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

export const ProfileSettings: React.FC = () => {
  const { profile, loading, updateProfile, getAccountStats } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountStats, setAccountStats] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome_completo: '',
      avatar_url: ''
    }
  })

  // Atualizar valores do formulário quando o profile for carregado
  React.useEffect(() => {
    if (profile) {
      reset({
        nome_completo: profile.nome_completo || '',
        avatar_url: profile.avatar_url || ''
      })
    }
  }, [profile])

  React.useEffect(() => {
    if (profile) {
      getAccountStats().then(setAccountStats).catch(error => {
        console.error('Erro ao carregar estatísticas:', error)
      })
    }
  }, [profile])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    
    try {
      await updateProfile({
        nome_completo: data.nome_completo,
        avatar_url: data.avatar_url || undefined
      })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Informações da Conta */}
      <div className="card">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-6">Informações da Conta</h3>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-border-default dark:border-border-dark-default"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-success-emphasis to-accent-emphasis dark:from-success-dark-emphasis dark:to-accent-dark-emphasis flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {(profile.nome_completo || profile.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <button
                type="button"
                className="absolute bottom-0 right-0 w-6 h-6 bg-accent-emphasis dark:bg-accent-dark-emphasis rounded-full flex items-center justify-center text-white hover:bg-accent-fg dark:hover:bg-accent-dark-fg transition-colors"
              >
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <h4 className="font-medium text-fg-default dark:text-fg-dark-default">Foto do Perfil</h4>
              <p className="text-sm text-fg-muted dark:text-fg-dark-muted">Adicione uma foto para personalizar seu perfil</p>
            </div>
          </div>

          {/* URL do Avatar */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              URL da Foto de Perfil
            </label>
            <input
              type="text"
              {...register('avatar_url')}
              className="input"
              placeholder="URL da sua foto de perfil (opcional)"
            />
            {errors.avatar_url && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.avatar_url.message}</p>
            )}
          </div>

          {/* Nome Completo */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <input
                type="text"
                {...register('nome_completo')}
                className="input pl-10"
                placeholder="Digite seu nome completo"
              />
            </div>
            {errors.nome_completo && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.nome_completo.message}</p>
            )}
          </div>

          {/* E-mail (somente leitura) */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <input
                type="email"
                value={profile.email || ''}
                disabled
                className="input pl-10 bg-canvas-subtle dark:bg-canvas-dark-subtle text-fg-muted dark:text-fg-dark-muted cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-fg-muted dark:text-fg-dark-muted">
              O e-mail não pode ser alterado por questões de segurança
            </p>
          </div>



          {/* Botão de Salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isDirty || isSubmitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </button>
          </div>
        </form>
        
        {/* Configurações de Segurança */}
        <div className="mt-8 pt-8 border-t border-border-default dark:border-border-dark-default">
          <SecuritySettings />
        </div>
      </div>

      {/* Estatísticas da Conta */}
      {accountStats && (
        <div className="card">
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default mb-6">Estatísticas da Conta</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-accent-subtle dark:bg-accent-dark-subtle rounded-lg">
              <div className="text-2xl font-bold text-accent-fg dark:text-accent-dark-fg">{accountStats.totalContas}</div>
              <div className="text-sm text-accent-fg dark:text-accent-dark-fg">Contas Cadastradas</div>
            </div>
            <div className="text-center p-4 bg-success-subtle dark:bg-success-dark-subtle rounded-lg">
              <div className="text-2xl font-bold text-success-fg dark:text-success-dark-fg">{accountStats.totalTransacoes}</div>
              <div className="text-sm text-success-fg dark:text-success-dark-fg">Transações Registradas</div>
            </div>
            <div className="text-center p-4 bg-attention-subtle dark:bg-attention-dark-subtle rounded-lg">
              <div className="text-2xl font-bold text-attention-fg dark:text-attention-dark-fg">{accountStats.totalCategorias}</div>
              <div className="text-sm text-attention-fg dark:text-attention-dark-fg">Categorias Criadas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}