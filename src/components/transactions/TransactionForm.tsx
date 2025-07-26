import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, DollarSign, Tag, CreditCard, FileText, Repeat, Calculator, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTransactions } from '../../hooks/useTransactions'
import { useAccounts } from '../../hooks/useAccounts'
import { useCategories } from '../../hooks/useCategories'
import { useDashboardContext } from '../../contexts/DashboardContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { NumericFormat } from 'react-number-format'

const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  account_id: z.string().min(1, 'Account is required'),
  category_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['paid', 'pending']).default('paid'),
  is_installment: z.boolean().default(false),
  total_installments: z.number().min(1).default(1),
  is_recurring: z.boolean().default(false),
  recurring_frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  recurring_end_date: z.string().optional(),
  tags: z.string().optional(),
  notes: z.string().optional()
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<TransactionFormData>
  mode?: 'create' | 'edit'
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const { refreshDashboard } = useDashboardContext()
  const { createTransaction } = useTransactions(refreshDashboard)
  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      status: 'paid',
      date: new Date().toISOString().split('T')[0],
      is_installment: false,
      total_installments: 1,
      is_recurring: false,
      ...initialData
    }
  })

  const watchType = watch('type')
  const watchIsInstallment = watch('is_installment')
  const watchIsRecurring = watch('is_recurring')

  const filteredCategories = categories.filter(cat => {
    const typeMapping = {
      'income': 'receita',
      'expense': 'despesa'
    }
    return cat.tipo === typeMapping[watchType]
  })

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    
    try {
      const transactionData = {
        ...data,
        titulo: data.title,
        data: data.date,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : undefined
      }

      console.log('📝 Criando transação via formulário:', transactionData.title)
      const result = await createTransaction(transactionData)
      
      if (result.success) {
        console.log('✅ Transação criada com sucesso via formulário')
        reset()
        onClose()
      }
    } catch (error) {
      console.error('Error submitting transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalSteps = 3

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Informações Básicas'
      case 2:
        return 'Detalhes da Transação'
      case 3:
        return 'Opções Avançadas'
      default:
        return 'Adicionar Transação'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl w-full max-w-lg max-h-[85vh] border border-border-default dark:border-border-dark-default flex flex-col">
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-4 border-b border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-fg-default dark:text-fg-dark-default">
              {mode === 'create' ? 'Adicionar Transação' : 'Editar Transação'}
            </h2>
            <p className="text-sm text-fg-muted dark:text-fg-dark-muted">
              {getStepTitle()} ({currentStep}/{totalSteps})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4">
            {/* Step 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-3">
                    Tipo de Transação
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative">
                      <input
                        type="radio"
                        value="income"
                        {...register('type')}
                        className="sr-only"
                      />
                      <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        watchType === 'income'
                          ? 'border-success-emphasis dark:border-success-dark-emphasis bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg'
                          : 'border-border-default dark:border-border-dark-default hover:border-border-muted dark:hover:border-border-dark-muted'
                      }`}>
                        <div className="flex items-center justify-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">Receita</span>
                        </div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        value="expense"
                        {...register('type')}
                        className="sr-only"
                      />
                      <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        watchType === 'expense'
                          ? 'border-danger-emphasis dark:border-danger-dark-emphasis bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg'
                          : 'border-border-default dark:border-border-dark-default hover:border-border-muted dark:hover:border-border-dark-muted'
                      }`}>
                        <div className="flex items-center justify-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="font-medium text-sm">Despesa</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Title and Amount */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      {...register('title')}
                      className="input"
                      placeholder="Digite o título da transação"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Valor *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
                      <Controller
                        name="amount"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <NumericFormat
                            value={value}
                            onValueChange={(values) => {
                              onChange(values.floatValue);
                            }}
                            thousandSeparator="."
                            decimalSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                            prefix="R$ "
                            placeholder="R$ 0,00"
                            className="input pl-10"
                          />
                        )}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.amount.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Detalhes da Transação */}
            {currentStep === 2 && (
              <div className="space-y-4" style={{ minHeight: '300px' }}>
                {/* Account and Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Conta *
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
                      <select
                        {...register('account_id')}
                        className="input pl-10 w-full appearance-none bg-canvas-default dark:bg-canvas-dark-default"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                      >
                        <option value="">Selecione uma conta</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.account_id && (
                      <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.account_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Categoria
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
                      <select
                        {...register('category_id')}
                        className="input pl-10 w-full appearance-none bg-canvas-default dark:bg-canvas-dark-default"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                      >
                        <option value="">Selecione uma categoria</option>
                        {filteredCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Date and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Data *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
                      <input
                        type="date"
                        {...register('date')}
                        className="input pl-10 w-full"
                        style={{ colorScheme: 'auto' }}
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        {...register('status')}
                        className="input w-full appearance-none bg-canvas-default dark:bg-canvas-dark-default"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                      >
                        <option value="paid">Pago</option>
                        <option value="pending">Pendente</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                    Descrição
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-fg-muted dark:text-fg-dark-muted" />
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="input pl-10 resize-none w-full"
                      placeholder="Adicione uma descrição..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Opções Avançadas */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Installments */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('is_installment')}
                    className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
                  />
                  <label className="text-sm font-medium text-fg-default dark:text-fg-dark-default flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    Dividir em parcelas
                  </label>
                </div>

                {watchIsInstallment && (
                  <div className="ml-7">
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Número de parcelas
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="60"
                      {...register('total_installments', { valueAsNumber: true })}
                      className="input w-32"
                    />
                  </div>
                )}

                {/* Recurring */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    {...register('is_recurring')}
                    className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
                  />
                  <label className="text-sm font-medium text-fg-default dark:text-fg-dark-default flex items-center">
                    <Repeat className="h-4 w-4 mr-2" />
                    Tornar recorrente
                  </label>
                </div>

                {watchIsRecurring && (
                  <div className="ml-7 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                        Frequência
                      </label>
                      <select
                        {...register('recurring_frequency')}
                        className="input"
                      >
                        <option value="">Selecione a frequência</option>
                        <option value="daily">Diário</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensal</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                        Data final (opcional)
                      </label>
                      <input
                        type="date"
                        {...register('recurring_end_date')}
                        className="input"
                      />
                    </div>
                  </div>
                )}

                {/* Tags and Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="input"
                      placeholder="tag1, tag2, tag3"
                    />
                    <p className="mt-1 text-xs text-fg-muted dark:text-fg-dark-muted">Separe as tags com vírgulas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Observações
                    </label>
                    <input
                      type="text"
                      {...register('notes')}
                      className="input"
                      placeholder="Observações adicionais..."
                    />
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Botões Fixos no Rodapé */}
        <div className="p-4 border-t border-border-default dark:border-border-dark-default bg-canvas-default dark:bg-canvas-dark-default rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-secondary flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary flex items-center"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
                  {mode === 'create' ? 'Criar Transação' : 'Atualizar Transação'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}