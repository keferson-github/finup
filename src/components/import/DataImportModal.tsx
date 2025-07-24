import React, { useState } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'
import { useDataImport } from '../../hooks/useDataImport'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface DataImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose
}) => {
  const { importing, importResult, importFromCSV } = useDataImport()
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    importFromCSV(file)
  }

  const downloadTemplate = () => {
    const csvContent = `title,amount,date,type,category,description
Salary,5000,2024-01-01,income,Salary,Monthly salary
Groceries,150,2024-01-02,expense,Food,Weekly groceries
Gas,80,2024-01-03,expense,Transport,Car fuel
Freelance,800,2024-01-04,income,Freelance,Web development project`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaction_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Importar Transações</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {!importResult ? (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Instruções de Importação</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Faça upload de um arquivo CSV com seus dados de transação</li>
                  <li>• Colunas obrigatórias: title, amount, date</li>
                  <li>• Colunas opcionais: type, category, description</li>
                  <li>• Formato de data: YYYY-MM-DD ou DD/MM/YYYY</li>
                  <li>• Valores devem ser números positivos</li>
                </ul>
              </div>

              {/* Template Download */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Precisa de um modelo?</h4>
                  <p className="text-sm text-gray-600">Baixe um arquivo CSV de exemplo para começar</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Modelo
                </button>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {importing ? (
                  <div className="flex flex-col items-center">
                    <LoadingSpinner size="lg" className="mb-4" />
                    <p className="text-lg font-medium text-gray-900">Importando transações...</p>
                    <p className="text-sm text-gray-600">Isso pode levar alguns momentos</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Solte seu arquivo CSV aqui
                    </p>
                    <p className="text-sm text-gray-600 mb-4">ou</p>
                    <label className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                      Escolher Arquivo
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0])
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Import Results */
            <div className="space-y-6">
              <div className="text-center">
                {importResult.successful_rows > 0 ? (
                  <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Importação Concluída
                </h3>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {importResult.total_rows}
                  </div>
                  <div className="text-sm text-gray-600">Total de Linhas</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    {importResult.successful_rows}
                  </div>
                  <div className="text-sm text-emerald-700">Sucesso</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.failed_rows}
                  </div>
                  <div className="text-sm text-red-700">Falhou</div>
                </div>
              </div>

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Erros de Importação</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <p key={index} className="text-sm text-red-800 mb-1">
                        {error}
                      </p>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p className="text-sm text-red-600 font-medium">
                        ... e mais {importResult.errors.length - 10} erros
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}