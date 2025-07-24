import React from 'react'
import { useState } from 'react'
import { User, Palette, Shield } from 'lucide-react'
import { ProfileSettings } from '../components/settings/ProfileSettings'
import { PreferencesSettings } from '../components/settings/PreferencesSettings'
import { SecuritySettings } from '../components/settings/SecuritySettings'

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile')

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferências', icon: Palette },
    { id: 'security', label: 'Segurança', icon: Shield }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie sua conta e preferências</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar de Navegação */}
        <div className="lg:w-64">
          <div className="card p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`sidebar-item ${
                      activeTab === tab.id
                        ? 'sidebar-item-active'
                        : 'sidebar-item-inactive'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSettings />}
          {activeTab === 'preferences' && <PreferencesSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  )
}