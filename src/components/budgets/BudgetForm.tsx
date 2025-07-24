import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Target, DollarSign, Calendar, AlertTriangle, FileText } from 'lucide-react'
import { useBudgets } from '../../hooks/useBudgets'
import { useCategories } from '../../hooks/useCategories'
import { useAccounts } from '../../hooks/useAccounts'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const budgetSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  valor_limite: z.number().min(0.01, 'Valor deve ser maior que 0'),
  periodo: z.enum(['semanal', 'mensal', 'anual']),
  data_inicio: z.string().min(1, 'Data de início é obrigatória'),
  data_fim: z.string().optional(),
  category_ids: z.array(z.string()).optional(),
  account_ids: z.array(z.string()).optional(),
  percentual_alerta: z.number().min(1).max(100).default(80)
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<BudgetFormData>
  mode?: 'create' | 'edit'
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createBudget, updateBudget } = useBudgets()
  const { categories } = useCategories()
  const { accounts } = useAccounts()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      periodo: 'mensal',
      percentual_alerta: 80,
      data_inicio: new Date().toISOString().split('T')[0],
      category_ids: [],
      account_ids: [],
      ...initialData
    }
  })

  const watchCategoryIds = watch('category_ids') || []
  const watchAccountIds = watch('account_ids') || []
  const watchPeriodo = watch('periodo')

  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(cat => cat.tipo === 'despesa')

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    
    try {
      const result = mode === 'create' 
        ? await createBudget(data)
        : await updateBudget(initialData?.id as string, data)
      
      if (result.success) {
        reset()
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const current = watchCategoryIds
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId]
    setValue('category_ids', updated)
  }

  const toggleAccount = (accountId: string) => {
    const current = watchAccountIds
    const updated = current.includes(accountId)
      ? current.filter(id => id !== accountId)
      : [...current, accountId]
    setValue('account_ids', updated)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  // Calcular data fim sugerida baseada no período
  const calcularDataFimSugerida = (dataInicio: string, periodo: string) => {
    if (!dataInicio) return ''
    
    const inicio = new Date(dataInicio)
    let fim = new Date(inicio)
    
    switch (periodo) {
      case 'semanal':
        fim.setDate(fim.getDate() + 6)
        break
      case 'mensal':
        fim.setMonth(fim.getMonth() + 1)
        fim.setDate(fim.getDate() - 1)
        break
      case 'anual':
        fim.setFullYear(fim.getFullYear() + 1)
        fim.setDate(fim.getDate() - 1)
        break
    }
    
    return fim.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl w-full max-w-3xl max-h-[85vh] border border-border-default dark:border-border-dark-default flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default dark:border-border-dark-default flex-shrink-0">
          <h2 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">
            {mode === 'create' ? 'Novo Orçamento' : 'Editar Orçamento'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form id="budget-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 pb-0">
          {/* Nome e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Nome do Orçamento *
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
                <input
                  type="text"
                  {...register('nome')}
                  className="input pl-10"
                  placeholder="Ex: Orçamento Alimentação"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Valor Limite *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
                <input
                  type="number"
                  step="0.01"
                  {...register('valor_limite', { valueAsNumber: true })}
                  className="input pl-10"
                  placeholder="0,00"
                />
              </div>
              {errors.valor_limite && (
                <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.valor_limite.message}</p>
              )}
            </div>
          </div>

          {/* Período e Datas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Período
              </label>
              <select
                {...register('periodo')}
                className="input"
              >
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Data de Início *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
                <input
                  type="date"
                  {...register('data_inicio')}
                  className="input pl-10"
                />
              </div>
              {errors.data_inicio && (
                <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.data_inicio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                Data de Fim
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
                <input
                  type="date"
                  {...register('data_fim')}
                  placeholder={calcularDataFimSugerida(watch('data_inicio'), watchPeriodo)}
                  className="input pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-fg-muted dark:text-fg-dark-muted">
                Deixe vazio para orçamento contínuo
              </p>
            </div>
          </div>

          {/* Alerta */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Alerta em (%)
            </label>
            <div className="relative">
              <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <input
                type="number"
                min="1"
                max="100"
                {...register('percentual_alerta', { valueAsNumber: true })}
                className="input pl-10"
                placeholder="80"
              />
            </div>
            <p className="mt-1 text-xs text-fg-muted dark:text-fg-dark-muted">
              Receba alertas quando atingir esta porcentagem do limite
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <textarea
                {...register('descricao')}
                rows={3}
                className="input pl-10 resize-none"
                placeholder="Descrição opcional do orçamento..."
              />
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-3">
              Categorias de Despesa (opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-border-default dark:border-border-dark-default rounded-lg p-3 bg-canvas-subtle dark:bg-canvas-dark-subtle">
              {expenseCategories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2 p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchCategoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
                  />
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{category.icone}</span>
                    <span className="text-sm text-fg-default dark:text-fg-dark-default">{category.nome}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-fg-muted dark:text-fg-dark-muted">
              Deixe vazio para incluir todas as categorias de despesa
            </p>
          </div>

          {/* Contas */}
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-3">
              Contas (opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-border-default dark:border-border-dark-default rounded-lg p-3 bg-canvas-subtle dark:bg-canvas-dark-subtle">
              {accounts.map((account) => (
                <label key={account.id} className="flex items-center space-x-2 p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watchAccountIds.includes(account.id)}
                    onChange={() => toggleAccount(account.id)}
                    className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
                  />
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: account.cor }}
                    />
                    <span className="text-sm text-fg-default dark:text-fg-dark-default">{account.nome}</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-fg-muted dark:text-fg-dark-muted">
              Deixe vazio para incluir todas as contas
            </p>
          </div>

          {/* Botões */}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-border-default dark:border-border-dark-default flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="budget-form"
            disabled={isSubmitting}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
            {mode === 'create' ? 'Criar Orçamento' : 'Atualizar Orçamento'}
          </button>
        </div>
      </div>
    </div>
  )
}