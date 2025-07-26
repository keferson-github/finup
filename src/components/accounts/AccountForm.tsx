import React, { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, CreditCard, DollarSign, Palette, ChevronLeft, ChevronRight, Check, Building2 } from 'lucide-react'
import { useAccounts, Account } from '../../hooks/useAccounts'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { getLogosForAccountType } from '../../data/logos'
import toast from 'react-hot-toast'

// Funções para formatação monetária
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value).replace('R$', '').trim()
}

const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.')
  return parseFloat(cleanValue) || 0
}

const formatInputCurrency = (value: string): string => {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '')
  
  if (!numbers) return ''
  
  // Converte para centavos
  const cents = parseInt(numbers)
  const reais = cents / 100
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(reais)
}

const accountSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['conta_corrente', 'poupanca', 'cartao_credito', 'dinheiro', 'investimento']),
  saldo_inicial: z.number(),
  cor: z.string().min(1, 'Cor é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória').nullable(),
  banco: z.string().optional().nullable(),
  bandeira_cartao: z.string().optional().nullable()
}).refine((data) => {
  // Validação condicional: se for cartão de crédito, bandeira_cartao é obrigatória
  if (data.tipo === 'cartao_credito') {
    return data.bandeira_cartao && data.bandeira_cartao.trim().length > 0
  }
  // Se for conta bancária (não dinheiro), banco é obrigatório
  if (['conta_corrente', 'poupanca', 'investimento'].includes(data.tipo)) {
    return data.banco && data.banco.trim().length > 0
  }
  return true
}, {
  message: 'Selecione a instituição financeira apropriada para este tipo de conta',
  path: ['banco'] // ou ['bandeira_cartao'] dependendo do contexto
})

type AccountFormData = z.infer<typeof accountSchema>

interface AccountFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialData?: Partial<AccountFormData> | Account
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
  onSuccess,
  initialData,
  mode = 'create'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formattedBalance, setFormattedBalance] = useState('')
  const totalSteps = 4
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
      nome: '',
      descricao: '',
      banco: null,
      bandeira_cartao: null,
      ...initialData && {
        id: initialData.id,
        nome: initialData.nome || '',
        tipo: initialData.tipo || 'conta_corrente',
        saldo_inicial: initialData.saldo_inicial || 0,
        cor: initialData.cor || colors[0],
        descricao: initialData.descricao || '',
        banco: initialData.banco || null,
        bandeira_cartao: initialData.bandeira_cartao || null
      }
    }
  })

  const watchColor = watch('cor')
  const watchNome = watch('nome')
  const watchTipo = watch('tipo')
  const watchDescricao = watch('descricao')
  const watchBanco = watch('banco')
  const watchBandeiraCartao = watch('bandeira_cartao')

  // Inicializar valor formatado quando há dados iniciais
  React.useEffect(() => {
    if (initialData?.saldo_inicial !== undefined) {
      setFormattedBalance(formatCurrency(initialData.saldo_inicial))
    }
  }, [initialData])

  // Reset form quando initialData mudar (para modo edit)
  React.useEffect(() => {
    if (initialData && mode === 'edit') {
      const formData = {
        id: initialData.id,
        nome: initialData.nome || '',
        tipo: initialData.tipo || 'conta_corrente',
        saldo_inicial: initialData.saldo_inicial || 0,
        cor: initialData.cor || colors[0],
        descricao: initialData.descricao || '',
        banco: initialData.banco,
        bandeira_cartao: initialData.bandeira_cartao
      } as AccountFormData
      
      reset(formData)
      
      if (initialData.saldo_inicial !== undefined) {
        setFormattedBalance(formatCurrency(initialData.saldo_inicial))
      }
    }
  }, [initialData, mode, reset])
  
  // Controlar o overflow do body quando o modal estiver aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handler para mudança no input de saldo
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatInputCurrency(inputValue)
    setFormattedBalance(formatted)
    
    // Converte o valor formatado para número e atualiza o form
    const numericValue = parseCurrency(formatted)
    setValue('saldo_inicial', numericValue)
  }

  const steps = [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Nome e tipo da conta',
      fields: ['nome', 'tipo']
    },
    {
      id: 2,
      title: 'Instituição Financeira',
      description: 'Selecione o banco ou bandeira',
      fields: ['banco', 'bandeira_cartao']
    },
    {
      id: 3,
      title: 'Configurações Financeiras',
      description: 'Saldo inicial da conta',
      fields: ['saldo_inicial']
    },
    {
      id: 4,
      title: 'Personalização',
      description: 'Cor e descrição da conta',
      fields: ['cor', 'descricao']
    }
  ]

  const isStepValid = (stepNumber: number) => {
    const step = steps.find(s => s.id === stepNumber)
    if (!step) return false

    switch (stepNumber) {
      case 1:
        return watchNome && watchNome.trim().length > 0 && watchTipo
      case 2:
        // Validação para instituição financeira - opcional para dinheiro
        if (watchTipo === 'dinheiro') return true
        if (watchTipo === 'cartao_credito') {
          return watchBandeiraCartao && watchBandeiraCartao.trim().length > 0
        }
        return watchBanco && watchBanco.trim().length > 0
      case 3:
        return true // Saldo inicial é opcional
      case 4:
        return watchColor && watchColor.trim().length > 0 && watchDescricao && watchDescricao.trim().length > 0
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setFormattedBalance('')
    reset()
    onClose()
  }

  const onSubmit: SubmitHandler<AccountFormData> = async (data) => {
    // Previne submissão se não estiver na última etapa (modo create)
    if (mode === 'create' && currentStep < totalSteps) {
      return
    }
    
    // Validações finais antes do envio
    if (!data.cor) {
      toast.error('Por favor, selecione uma cor para a conta')
      return
    }
    
    if (!data.descricao || data.descricao.trim().length === 0) {
      toast.error('Por favor, adicione uma descrição para a conta')
      return
    }
    
    // Validação de instituição financeira
    if (data.tipo === 'cartao_credito' && (!data.bandeira_cartao || data.bandeira_cartao.trim().length === 0)) {
      toast.error('Por favor, selecione a bandeira do cartão de crédito')
      return
    }
    
    if (['conta_corrente', 'poupanca', 'investimento'].includes(data.tipo) && (!data.banco || data.banco.trim().length === 0)) {
      toast.error('Por favor, selecione a instituição financeira')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const result = mode === 'create'
        ? await createAccount({
            nome: data.nome,
            tipo: data.tipo,
            saldo_inicial: data.saldo_inicial,
            cor: data.cor,
            descricao: data.descricao || undefined,
            banco: data.banco || undefined,
            bandeira_cartao: data.bandeira_cartao || undefined
          })
        : await updateAccount(initialData?.id as string, {
            nome: data.nome,
            tipo: data.tipo,
            saldo_inicial: data.saldo_inicial,
            cor: data.cor,
            descricao: data.descricao || undefined,
            banco: data.banco || undefined,
            bandeira_cartao: data.bandeira_cartao || undefined
          })
      
      if (result.success) {
        console.log(`💳 ✅ ${mode === 'create' ? 'Criação' : 'Edição'} de conta bem-sucedida:`, data.nome)
        
        // Reset do formulário
        setCurrentStep(1)
        setFormattedBalance('')
        reset()
        
        // Chamar callback de sucesso para atualizar a UI
        if (onSuccess) {
          onSuccess()
        } else {
          onClose()
        }
        
        // Toast de confirmação já é exibido no hook useAccounts
      }
    } catch (error) {
      console.error('Erro ao salvar conta:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const currentStepData = steps.find(s => s.id === currentStep)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl w-full max-w-lg max-h-[70vh] overflow-hidden border border-border-default dark:border-border-dark-default flex flex-col transform transition-all duration-300 ease-in-out">
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-border-default dark:border-border-dark-default flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-fg-default dark:text-fg-dark-default">
              {mode === 'create' ? 'Nova Conta' : 'Editar Conta'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
            </button>
          </div>
          
          {/* Progress Indicator */}
          {mode === 'create' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-fg-muted dark:text-fg-dark-muted">
                  Etapa {currentStep} de {totalSteps}
                </span>
                <span className="text-xs text-fg-muted dark:text-fg-dark-muted">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-neutral-muted dark:bg-neutral-dark-muted rounded-full h-1.5">
                <div 
                  className="bg-accent-emphasis dark:bg-accent-dark-emphasis h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              
              <div className="flex justify-between">
                {steps.map((step) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step.id < currentStep 
                        ? 'bg-success-emphasis dark:bg-success-dark-emphasis text-white'
                        : step.id === currentStep
                        ? 'bg-accent-emphasis dark:bg-accent-dark-emphasis text-white'
                        : 'bg-neutral-muted dark:bg-neutral-dark-muted text-fg-muted dark:text-fg-dark-muted'
                    }`}>
                      {step.id < currentStep ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {currentStepData && (
                <div className="text-center">
                  <h3 className="font-medium text-fg-default dark:text-fg-dark-default text-sm">
                    {currentStepData.title}
                  </h3>
                  <p className="text-xs text-fg-muted dark:text-fg-dark-muted">
                    {currentStepData.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <form id="account-form" onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-3 sm:space-y-4 pb-0" noValidate>
            
            {/* Step 1: Informações Básicas */}
            {(currentStep === 1 || mode === 'edit') && (
              <>
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
                            : 'border-border-default dark:border-border-default hover:border-border-muted dark:hover:border-border-dark-muted'
                        }`}>
                          <span className="text-xl mr-3">{type.icon}</span>
                          <span className="font-medium text-fg-default dark:text-fg-dark-default">{type.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Instituição Financeira */}
            {(currentStep === 2 || mode === 'edit') && watchTipo !== 'dinheiro' && (
              <>
                {watchTipo === 'cartao_credito' ? (
                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Bandeira do Cartão *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {getLogosForAccountType(watchTipo).map((logo) => (
                        <label key={logo.id} className="relative">
                          <input
                            type="radio"
                            value={logo.id}
                            {...register('bandeira_cartao')}
                            className="sr-only"
                          />
                          <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                            watchBandeiraCartao === logo.id
                              ? 'border-accent-emphasis dark:border-accent-dark-emphasis bg-accent-subtle dark:bg-accent-dark-subtle'
                              : 'border-border-default dark:border-border-default hover:border-border-muted dark:hover:border-border-dark-muted'
                          }`}>
                            <div className="flex flex-col items-center space-y-2">
                              <img 
                                src={logo.image} 
                                alt={logo.name}
                                className="w-12 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  target.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                              <CreditCard className="w-8 h-8 text-fg-muted dark:text-fg-dark-muted hidden" />
                              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default text-center">
                                {logo.name}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.bandeira_cartao && (
                      <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                        Por favor, selecione a bandeira do cartão de crédito
                      </p>
                    )}
                    <p className="mt-2 text-sm text-fg-muted dark:text-fg-dark-muted">
                      Selecione a bandeira do seu cartão de crédito.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                      Instituição Financeira *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {getLogosForAccountType(watchTipo).map((logo) => (
                        <label key={logo.id} className="relative">
                          <input
                            type="radio"
                            value={logo.id}
                            {...register('banco')}
                            className="sr-only"
                          />
                          <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                            watchBanco === logo.id
                              ? 'border-accent-emphasis dark:border-accent-dark-emphasis bg-accent-subtle dark:bg-accent-dark-subtle'
                              : 'border-border-default dark:border-border-default hover:border-border-muted dark:hover:border-border-dark-muted'
                          }`}>
                            <div className="flex flex-col items-center space-y-2">
                              <img 
                                src={logo.image} 
                                alt={logo.name}
                                className="w-12 h-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  target.nextElementSibling?.classList.remove('hidden')
                                }}
                              />
                              <Building2 className="w-8 h-8 text-fg-muted dark:text-fg-dark-muted hidden" />
                              <span className="text-sm font-medium text-fg-default dark:text-fg-dark-default text-center">
                                {logo.name}
                              </span>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.banco && (
                      <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                        Por favor, selecione a instituição financeira
                      </p>
                    )}
                    <p className="mt-2 text-sm text-fg-muted dark:text-fg-dark-muted">
                      Selecione a instituição financeira da sua conta.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Configurações Financeiras */}
            {(currentStep === 3 || mode === 'edit') && (
              <div>
                <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                  Saldo Inicial
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
                  <input
                    type="text"
                    value={formattedBalance}
                    onChange={handleBalanceChange}
                    className="input pl-10"
                    placeholder="0,00"
                  />
                  {/* Campo oculto para o react-hook-form */}
                  <input
                    type="hidden"
                    {...register('saldo_inicial', { valueAsNumber: true })}
                  />
                </div>
                <p className="mt-1 text-sm text-fg-muted dark:text-fg-dark-muted">
                  Informe o valor atual da conta. Você pode deixar em branco se não souber.
                </p>
              </div>
            )}

            {/* Step 4: Personalização */}
            {(currentStep === 4 || mode === 'edit') && (
              <>
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
                            watchColor === color ? 'border-fg-default dark:border-fg-dark-default scale-110 ring-2 ring-accent-emphasis dark:ring-accent-dark-emphasis' : 'border-border-default dark:border-border-dark-default'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Selecionar cor ${color}`}
                        >
                          {watchColor === color && (
                            <Check className="h-4 w-4 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!watchColor && currentStep === 4 && (
                    <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">
                      Por favor, selecione uma cor para continuar
                    </p>
                  )}
                  <p className="mt-1 text-sm text-fg-muted dark:text-fg-dark-muted">
                    Escolha uma cor para identificar facilmente esta conta.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                    Descrição *
                  </label>
                  <textarea
                    {...register('descricao')}
                    rows={3}
                    className="input resize-none"
                    placeholder="Adicione uma descrição para a conta..."
                  />
                  {errors.descricao && (
                    <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.descricao.message}</p>
                  )}
                  <p className="mt-1 text-sm text-fg-muted dark:text-fg-dark-muted">
                    Adicione uma descrição para lembrar detalhes importantes sobre esta conta.
                  </p>
                </div>
              </>
            )}

          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-border-default dark:border-border-dark-default flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            
            {mode === 'create' && currentStep > 1 && (
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
          
          <div className="flex items-center space-x-4">
            {mode === 'create' && currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                form="account-form"
                disabled={isSubmitting || (mode === 'create' && (!isStepValid(currentStep) || currentStep < totalSteps))}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                title={!isStepValid(currentStep) ? 'Preencha todos os campos obrigatórios' : ''}
              >
                {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
                {mode === 'create' ? 'Criar Conta' : 'Atualizar Conta'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}