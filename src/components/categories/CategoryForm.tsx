import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Tag, TrendingDown, TrendingUp } from 'lucide-react'
import { useCategories } from '../../hooks/useCategories'
import { LoadingSpinner } from '../ui/LoadingSpinner'

const categorySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['receita', 'despesa']),
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
      ...initialData
    }
  })
  
  // Adicionar efeito de foco no campo de nome
  useEffect(() => {
    // Pequeno atraso para garantir que o modal foi aberto
    const timer = setTimeout(() => {
      const nomeInput = document.querySelector('input[name="nome"]');
      if (nomeInput) {
        (nomeInput as HTMLInputElement).focus();
      }
    }, 400);
    
    return () => clearTimeout(timer);
  }, [])

  const watchTipo = watch('tipo')

  // Verificar se todos os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    const nome = watch('nome');
    
    return nome && nome.trim() !== '';
  }

  const onSubmit = async (data: CategoryFormData) => {
    // Verificar se o formulário é válido antes de enviar
    if (!isFormValid()) {
      return;
    }
    
    setIsSubmitting(true)
    
    try {
      if (mode === 'create') {
        const result = await createCategory(data);
        if (result.success) {
          reset();
          onClose();
        }
      } else if (mode === 'edit' && initialData?.id) {
        // Para edição, atualizamos a categoria e mantemos o modal aberto até a conclusão
        const result = await updateCategory(initialData.id, data);
        if (result.success) {
          // Atualizar os dados iniciais para refletir as mudanças
          // Isso permite que o usuário veja as alterações imediatamente
          // Fechar o modal apenas após a conclusão bem-sucedida
          reset(data);
          onClose();
        }
      } else {
        console.error('Modo inválido ou ID não fornecido para edição');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[6vh] p-4 z-50">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl w-full max-w-lg max-h-[70vh] border border-border-default dark:border-border-dark-default flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default dark:border-border-dark-default flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-fg-default dark:text-fg-dark-default">
              {mode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto form-content transition-opacity duration-300">
          <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 pb-0">
            <div className="space-y-4" style={{ minHeight: '280px' }}>
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
                  Descrição
                </label>
                <textarea
                  {...register('descricao')}
                  rows={3}
                  className="input resize-none"
                  placeholder="Descrição opcional da categoria..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex items-center justify-end p-6 border-t border-border-default dark:border-border-dark-default flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              form="category-form"
              disabled={isSubmitting || !isFormValid()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              {mode === 'create' ? 'Criar Categoria' : 'Atualizar Categoria'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}