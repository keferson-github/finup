import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, ArrowRight } from 'lucide-react'
import { useCategories, Category } from '../../hooks/useCategories'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface CategoryDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  isOpen,
  onClose,
  category
}) => {
  const { deleteCategory, checkCategoryUsage, getCategoriesByType } = useCategories()
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasTransactions, setHasTransactions] = useState(false)
  const [transactionCount, setTransactionCount] = useState(0)
  const [replacementCategoryId, setReplacementCategoryId] = useState('')
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])

  useEffect(() => {
    if (isOpen && category) {
      checkUsage()
      loadAvailableCategories()
    }
  }, [isOpen, category])

  const checkUsage = async () => {
    if (!category) return

    const usage = await checkCategoryUsage(category.id)
    setHasTransactions(usage.hasTransactions)
    setTransactionCount(usage.count)
  }

  const loadAvailableCategories = () => {
    if (!category) return

    const categories = getCategoriesByType(category.tipo)
    const filtered = categories.filter(cat => cat.id !== category.id)
    setAvailableCategories(filtered)
  }

  const handleDelete = async () => {
    if (!category) return

    setIsDeleting(true)
    try {
      const result = await deleteCategory(
        category.id, 
        hasTransactions && replacementCategoryId ? replacementCategoryId : undefined
      )
      
      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setReplacementCategoryId('')
    onClose()
  }

  if (!isOpen || !category) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-canvas-default dark:bg-canvas-dark-default rounded-2xl w-full max-w-lg max-h-[85vh] border border-border-default dark:border-border-dark-default flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-default dark:border-border-dark-default flex-shrink-0">
          <h2 className="text-xl font-bold text-fg-default dark:text-fg-dark-default">Excluir Categoria</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-muted dark:hover:bg-neutral-dark-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center text-xl mr-4"
              style={{ backgroundColor: `${category.cor || '#6B7280'}20` }}
            >
              {category.icone || '📁'}
            </div>
            <div>
              <h3 className="font-semibold text-fg-default dark:text-fg-dark-default">{category.nome || 'Categoria sem nome'}</h3>
              <p className="text-sm text-fg-muted dark:text-fg-dark-muted capitalize">{category.tipo || 'tipo não definido'}</p>
            </div>
          </div>

          {hasTransactions ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Esta categoria possui {transactionCount} transação{transactionCount > 1 ? 'ões' : ''} vinculada{transactionCount > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Escolha uma categoria para transferir as transações ou arquive esta categoria
                    </p>
                  </div>
                </div>
              </div>

              {availableCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
                    Transferir transações para:
                  </label>
                  <select
                    value={replacementCategoryId}
                    onChange={(e) => setReplacementCategoryId(e.target.value)}
                    className="input"
                  >
                    <option value="">Selecione uma categoria</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icone || '📁'} {cat.nome || 'Categoria sem nome'}
                      </option>
                    ))}
                  </select>
                  
                  {replacementCategoryId && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center text-sm text-blue-800">
                        <span className="mr-2">{category.icone || '📁'} {category.nome || 'Categoria sem nome'}</span>
                        <ArrowRight className="h-4 w-4 mx-2" />
                        <span>
                          {availableCategories.find(cat => cat.id === replacementCategoryId)?.icone || '📁'}{' '}
                          {availableCategories.find(cat => cat.id === replacementCategoryId)?.nome || 'Categoria não encontrada'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-sm text-fg-muted dark:text-fg-dark-muted">
                <p className="font-medium mb-1 text-fg-default dark:text-fg-dark-default">Opções disponíveis:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {availableCategories.length > 0 && (
                    <li>Transferir para outra categoria (recomendado)</li>
                  )}
                  <li>Arquivar categoria (mantém histórico, mas oculta da lista)</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Tem certeza que deseja excluir esta categoria?
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-border-default dark:border-border-dark-default flex-shrink-0">
          <button
            onClick={handleClose}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || (hasTransactions && availableCategories.length > 0 && !replacementCategoryId)}
            className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDeleting && <LoadingSpinner size="sm" className="mr-2" />}
            {hasTransactions 
              ? (replacementCategoryId ? 'Transferir e Excluir' : 'Arquivar Categoria')
              : 'Excluir Categoria'
            }
          </button>
        </div>
      </div>
    </div>
  )
}