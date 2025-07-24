import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, CreditCard, DollarSign, Palette } from 'lucide-react'
import { useAccounts } from '../../hooks/useAccounts'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const accountSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['conta_corrente', 'poupanca', 'cartao_credito', 'dinheiro', 'investimento']),
  saldo_inicial: z.number(),
  cor: z.string().min(1, 'Cor é obrigatória'),
  description: z.string().optional()
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<AccountFormData>
  mode?: 'create' | 'edit'
}

const accountTypes = [
  { value: 'conta_corrente', label: 'Conta Corrente', icon: '🏦' },
  { value: 'poupanca', label: 'Poupança', icon: '💰' },
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: '💳' },
  { value: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { value: 'investimento', label: 'Investimento', icon: '📈' }
]

const colors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
]

export const AccountForm: React.FC<AccountFormProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createAccount, updateAccount } = useAccounts()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      tipo: 'conta_corrente',
      saldo_inicial: 0,
      cor: colors[0],
      ...initialData
    }
  })

  const watchColor = watch('cor')

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true)
    
    try {
      const result = mode === 'create' 
        ? await createAccount(data)
        : await updateAccount(initialData?.id as string, data)
      
      if (result.success) {
        reset()
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar conta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border-default dark:border-border-dark-default">
        <div className="flex items-center justify-between p-6 border-b border-border-default dark:border-border-dark-default">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Nova Conta' : 'Editar Conta'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Nome da Conta *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <input
                type="text"
                {...register('nome')}
                className="input pl-10"
                placeholder="Ex: Banco do Brasil"
              />
            </div>
            {errors.nome && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Tipo de Conta *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {accountTypes.map((type) => (
                <label key={type.value} className="relative">
                  <input
                    type="radio"
                    value={type.value}
                    {...register('tipo')}
                    className="sr-only"
                  />
                  <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center ${
                    watch('tipo') === type.value
                      ? 'border-accent-emphasis dark:border-accent-dark-emphasis bg-accent-subtle dark:bg-accent-dark-subtle'
                      : 'border-border-default dark:border-border-dark-default hover:border-border-muted dark:hover:border-border-dark-muted'
                  }`}>
                    <span className="text-xl mr-3">{type.icon}</span>
                    <span className="font-medium text-fg-default dark:text-fg-dark-default">{type.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Saldo Inicial
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <input
                type="number"
                step="0.01"
                {...register('saldo_inicial', { valueAsNumber: true })}
                className="input pl-10"
                placeholder="0,00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Cor *
            </label>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue('cor', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      watchColor === color ? 'border-fg-default dark:border-fg-dark-default scale-110' : 'border-border-default dark:border-border-dark-default'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Descrição
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="input resize-none"
              placeholder="Descrição opcional da conta..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border-default dark:border-border-dark-default">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {mode === 'create' ? 'Criar Conta' : 'Atualizar Conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}