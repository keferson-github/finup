import React, { useState } from 'react'
import { Globe, Palette, DollarSign, Calendar, Settings as SettingsIcon, Save } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const PreferencesSettings: React.FC = () => {
  const { preferences, updatePreferences } = useSettings()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const handlePreferenceChange = (key: string, value: any) => {
    setLocalPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updatePreferences(localPreferences)
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasChanges = JSON.stringify(preferences) !== JSON.stringify(localPreferences)

  return (
    <div className="space-y-6">
      {/* Idioma e Localização */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Globe className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Idioma e Localização</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Idioma do Sistema
            </label>
            <select
              value={localPreferences.idioma}
              onChange={(e) => handlePreferenceChange('idioma', e.target.value)}
              className="input"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Moeda Padrão
            </label>
            <select
              value={localPreferences.moeda}
              onChange={(e) => handlePreferenceChange('moeda', e.target.value)}
              className="input"
            >
              <option value="BRL">Real Brasileiro (R$)</option>
              <option value="USD">Dólar Americano (US$)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">Libra Esterlina (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aparência */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Palette className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Aparência</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-3">
            Tema do Sistema
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'claro', label: 'Claro', icon: '☀️' },
              { value: 'escuro', label: 'Escuro', icon: '🌙' },
              { value: 'automatico', label: 'Automático', icon: '🔄' }
            ].map((tema) => (
              <label key={tema.value} className="relative">
                <input
                  type="radio"
                  value={tema.value}
                  checked={localPreferences.tema === tema.value}
                  onChange={(e) => handlePreferenceChange('tema', e.target.value)}
                  className="sr-only"
                />
                <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                  localPreferences.tema === tema.value
                    ? 'border-accent-emphasis dark:border-accent-dark-emphasis bg-accent-subtle dark:bg-accent-dark-subtle'
                    : 'border-border-default dark:border-border-dark-default hover:border-border-muted dark:hover:border-border-dark-muted'
                }`}>
                  <div className="text-2xl mb-2">{tema.icon}</div>
                  <div className="font-medium text-fg-default dark:text-fg-dark-default">{tema.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Formato e Exibição */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Calendar className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Formato e Exibição</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-fg-default dark:text-fg-dark-default mb-2">
              Formato de Data
            </label>
            <select
              value={localPreferences.formato_data}
              onChange={(e) => handlePreferenceChange('formato_data', e.target.value)}
              className="input"
            >
              <option value="DD/MM/YYYY">DD/MM/AAAA (31/12/2024)</option>
              <option value="MM/DD/YYYY">MM/DD/AAAA (12/31/2024)</option>
              <option value="YYYY-MM-DD">AAAA-MM-DD (2024-12-31)</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={localPreferences.arredondamento}
                onChange={(e) => handlePreferenceChange('arredondamento', e.target.checked)}
                className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
              />
              <div>
                <div className="font-medium text-fg-default dark:text-fg-dark-default">Arredondamento Automático</div>
                <div className="text-sm text-fg-muted dark:text-fg-dark-muted">Arredondar valores para o centavo mais próximo</div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div className="card">
        <div className="flex items-center mb-6">
          <SettingsIcon className="h-5 w-5 text-fg-muted dark:text-fg-dark-muted mr-2" />
          <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Notificações</h3>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localPreferences.notificacoes_email}
              onChange={(e) => handlePreferenceChange('notificacoes_email', e.target.checked)}
              className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
            />
            <div>
              <div className="font-medium text-fg-default dark:text-fg-dark-default">Notificações por E-mail</div>
              <div className="text-sm text-fg-muted dark:text-fg-dark-muted">Receber resumos e alertas importantes por e-mail</div>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={localPreferences.alertas_orcamento}
              onChange={(e) => handlePreferenceChange('alertas_orcamento', e.target.checked)}
              className="h-4 w-4 text-accent-emphasis dark:text-accent-dark-emphasis focus:ring-accent-emphasis dark:focus:ring-accent-dark-emphasis border-border-default dark:border-border-dark-default rounded"
            />
            <div>
              <div className="font-medium text-fg-default dark:text-fg-dark-default">Alertas de Orçamento</div>
              <div className="text-sm text-fg-muted dark:text-fg-dark-muted">Receber notificações quando orçamentos estiverem próximos do limite</div>
            </div>
          </label>
        </div>
      </div>

      {/* Botão de Salvar */}
      {hasChanges && (
        <div className="alert alert-info">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-accent-fg dark:text-accent-dark-fg">Você tem alterações não salvas</p>
              <p className="text-sm text-accent-fg dark:text-accent-dark-fg">Clique em "Salvar Preferências" para aplicar as mudanças</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <LoadingSpinner size="sm" className="mr-2" />}
              <Save className="h-4 w-4 mr-2" />
              Salvar Preferências
            </button>
          </div>
        </div>
      )}
    </div>
  )
}