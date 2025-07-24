import React from 'react'
import { Plus, Tag, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { CategoryForm } from '../components/categories/CategoryForm'
import { CategoryDeleteModal } from '../components/categories/CategoryDeleteModal'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const Categories: React.FC = () => {
  const { categories, loading } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [deletingCategory, setDeletingCategory] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'receita' | 'despesa'>('despesa')

  const incomeCategories = categories.filter(cat => cat.tipo === 'receita')
  const expenseCategories = categories.filter(cat => cat.tipo === 'despesa')

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = (category: any) => {
    setDeletingCategory(category)
    setShowDeleteModal(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDeletingCategory(null)
  }

  const handleNewCategory = (tipo?: 'receita' | 'despesa') => {
    setEditingCategory(tipo ? { tipo } : null)
    setShowForm(true)
  }

  const CategoryCard = ({ category }: { category: any }) => (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${category.cor}20` }}
          >
            {category.icone}
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-fg-default dark:text-fg-dark-default">{category.nome}</h4>
            {category.descricao && (
              <p className="text-sm text-fg-muted dark:text-fg-dark-muted">{category.descricao}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-accent-fg dark:hover:text-accent-dark-fg transition-colors"
            title="Editar categoria"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(category)}
            className="p-2 text-fg-muted dark:text-fg-dark-muted hover:text-danger-fg dark:hover:text-danger-dark-fg transition-colors"
            title="Excluir categoria"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-2">Organize suas transações por categoria</p>
        </div>
        <button 
          onClick={() => handleNewCategory()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="card p-0">
            <div className="flex border-b border-border-default dark:border-border-dark-default">
              <button
                onClick={() => setActiveTab('despesa')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'despesa'
                    ? 'text-danger-fg dark:text-danger-dark-fg border-b-2 border-danger-emphasis dark:border-danger-dark-emphasis bg-danger-subtle dark:bg-danger-dark-subtle'
                    : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
                }`}
              >
                <div className="flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Despesas ({expenseCategories.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('receita')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'receita'
                    ? 'text-success-fg dark:text-success-dark-fg border-b-2 border-success-emphasis dark:border-success-dark-emphasis bg-success-subtle dark:bg-success-dark-subtle'
                    : 'text-fg-muted dark:text-fg-dark-muted hover:text-fg-default dark:hover:text-fg-dark-default'
                }`}
              >
                <div className="flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Receitas ({incomeCategories.length})
                </div>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'receita' ? (
                /* Categorias de Receita */
                incomeCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-fg-default dark:text-fg-dark-default mb-2">Nenhuma categoria de receita</h3>
                    <p className="text-fg-muted dark:text-fg-dark-muted mb-6">Crie categorias para organizar suas fontes de renda.</p>
                    <button 
                      onClick={() => handleNewCategory('receita')}
                      className="btn btn-primary flex items-center mx-auto"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Categoria de Receita
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incomeCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                )
              ) : (
                /* Categorias de Despesa */
                expenseCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingDown className="h-16 w-16 text-fg-muted dark:text-fg-dark-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-fg-default dark:text-fg-dark-default mb-2">Nenhuma categoria de despesa</h3>
                    <p className="text-fg-muted dark:text-fg-dark-muted mb-6">Crie categorias para organizar seus gastos.</p>
                    <button 
                      onClick={() => handleNewCategory('despesa')}
                      className="btn btn-danger flex items-center mx-auto"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar Categoria de Despesa
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expenseCategories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-success-emphasis to-success-fg dark:from-success-dark-emphasis dark:to-success-dark-fg rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <TrendingUp className="h-8 w-8 mb-2" />
                  <h3 className="text-lg font-semibold">Categorias de Receita</h3>
                  <p className="text-success-subtle dark:text-success-dark-subtle">Organize suas fontes de renda</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{incomeCategories.length}</div>
                  <div className="text-success-subtle dark:text-success-dark-subtle text-sm">categorias</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-danger-emphasis to-danger-fg dark:from-danger-dark-emphasis dark:to-danger-dark-fg rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <TrendingDown className="h-8 w-8 mb-2" />
                  <h3 className="text-lg font-semibold">Categorias de Despesa</h3>
                  <p className="text-danger-subtle dark:text-danger-dark-subtle">Organize seus gastos</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{expenseCategories.length}</div>
                  <div className="text-danger-subtle dark:text-danger-dark-subtle text-sm">categorias</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CategoryForm
        isOpen={showForm}
        onClose={handleCloseForm}
        initialData={editingCategory}
        mode={editingCategory ? 'edit' : 'create'}
      />

      <CategoryDeleteModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        category={deletingCategory}
      />
    </div>
  )
}