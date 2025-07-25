import React, { useState } from 'react'
import { Modal } from './Modal'
import { LoadingSpinner } from './LoadingSpinner'

export const ModalExample: React.FC = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulando uma requisição
    setTimeout(() => {
      setIsSubmitting(false)
      setIsFormModalOpen(false)
      // Aqui você poderia mostrar uma notificação de sucesso
    }, 1500)
  }

  // Exemplo de footer para modal de confirmação
  const confirmFooter = (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => setIsConfirmModalOpen(false)}
        className="btn btn-secondary"
      >
        Cancelar
      </button>
      <button
        onClick={() => {
          // Lógica para confirmar ação
          setIsConfirmModalOpen(false)
        }}
        className="btn btn-danger"
      >
        Confirmar Exclusão
      </button>
    </div>
  )

  // Exemplo de footer para modal de formulário
  const formFooter = (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => setIsFormModalOpen(false)}
        className="btn btn-secondary"
      >
        Cancelar
      </button>
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
        Salvar
      </button>
    </div>
  )

  // Exemplo de footer para modal informativo
  const infoFooter = (
    <div className="flex items-center justify-center">
      <button
        onClick={() => setIsInfoModalOpen(false)}
        className="btn btn-primary"
      >
        Entendi
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Exemplos de Modal</h1>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="btn btn-danger"
        >
          Abrir Modal de Confirmação
        </button>
        
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="btn btn-primary"
        >
          Abrir Modal de Formulário
        </button>
        
        <button
          onClick={() => setIsInfoModalOpen(true)}
          className="btn btn-secondary"
        >
          Abrir Modal Informativo
        </button>
      </div>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirmar Exclusão"
        footer={confirmFooter}
        maxWidth="sm"
      >
        <div className="p-4">
          <p className="text-fg-default dark:text-fg-dark-default">
            Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
          </p>
        </div>
      </Modal>

      {/* Modal de Formulário */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Formulário de Exemplo"
        footer={formFooter}
      >
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full"
              placeholder="Digite seu nome"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input w-full"
              placeholder="Digite seu email"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Informativo */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Informação Importante"
        footer={infoFooter}
        maxWidth="md"
      >
        <div className="p-4">
          <p className="text-fg-default dark:text-fg-dark-default">
            Este é um exemplo de modal informativo que pode ser usado para exibir mensagens importantes para o usuário.
          </p>
          <p className="mt-4 text-fg-default dark:text-fg-dark-default">
            O componente Modal é flexível e pode ser adaptado para diferentes casos de uso, como confirmações, formulários, alertas e muito mais.
          </p>
        </div>
      </Modal>
    </div>
  )
}