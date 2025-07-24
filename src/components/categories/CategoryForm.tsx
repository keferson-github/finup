import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Tag, Palette, TrendingDown, TrendingUp } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const categorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['receita', 'despesa']),
  cor: z.string().min(1, 'Cor é obrigatória'),
  icone: z.string().min(1, 'Ícone é obrigatório'),
  descricao: z.string().optional()
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<CategoryFormData & { id: string }>
  mode?: 'create' | 'edit'
}



export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createCategory, updateCategory } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      tipo: 'despesa',
      cor: '',
      icone: '',
      ...initialData
    }
  })

  const watchTipo = watch('tipo')
  const watchColor = watch('cor')

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    
    try {
      const result = mode === 'create' 
        ? await createCategory(data)
        : await updateCategory(initialData?.id as string, data)
      
      if (result.success) {
        reset()
        onClose()
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border-default dark:border-border-dark-default">
        <div className="flex items-center justify-between p-6 border-b border-border-default dark:border-border-dark-default">
          <h2 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">
            {mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-3">
              Tipo de Categoria *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <input
                  type="radio" 
                  value="receita"
                  {...register('tipo')}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watchTipo === 'receita'
                    ? 'border-success-emphasis dark:border-success-dark-emphasis bg-success-subtle dark:bg-success-dark-subtle text-success-fg dark:text-success-dark-fg'
                    : 'border-border-default dark:border-border-dark-default hover:border-border-muted dark:hover:border-border-dark-muted'
                }`}>
                  <div className="flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <span className="font-medium">Receita</span>
                  </div>
                </div>
              </label>
              <label className="relative">
                <input
                  type="radio"
                  value="despesa"
                  {...register('tipo')}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  watchTipo === 'despesa'
                    ? 'border-danger-emphasis dark:border-danger-dark-emphasis bg-danger-subtle dark:bg-danger-dark-subtle text-danger-fg dark:text-danger-dark-fg'
                    : 'border-border-default dark:border-border-dark-default hover:border-border-muted dark:hover:border-border-dark-muted'
                }`}>
                  <div className="flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 mr-2" />
                    <span className="font-medium">Despesa</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Nome da Categoria *
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <input
                type="text"
                {...register('nome')}
                className="input pl-10"
                placeholder="Nome da categoria"
              />
            </div>
            {errors.nome && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.nome.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Ícone *
            </label>
            <input
              type="text"
              {...register('icone')}
              className="input"
              placeholder="Digite um emoji (ex: 🍔, 💰, 🏠)"
              maxLength={2}
            />
            {errors.icone && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.icone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Cor *
            </label>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  {...register('cor')}
                  className="input flex-1"
                  placeholder="Digite um código de cor (ex: #3B82F6, #10B981)"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                {watchColor && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-border-default dark:border-border-dark-default"
                    style={{ backgroundColor: watchColor }}
                  />
                )}
              </div>
            </div>
            {errors.cor && (
              <p className="mt-1 text-sm text-danger-fg dark:text-danger-dark-fg">{errors.cor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Descrição
            </label>
            <textarea
              {...register('descricao')}
              rows={3}
              className="input resize-none"
              placeholder="Descrição opcional da categoria..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border-default dark:border-border-dark-default">
            <button
              type="button"
              onClick={handleClose}
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
              {mode === 'create' ? 'Criar Categoria' : 'Atualizar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}