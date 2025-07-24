import React from 'react'
import { ProfileSettings } from '../components/settings/ProfileSettings'

export const Settings: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">Gerencie suas informações da conta</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <ProfileSettings />
      </div>
    </div>
  )
}