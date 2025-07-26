import React from 'react'

// Componente para logotipos de bancos usando SVG
export const BankLogos = {
  itau: () => (
    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">
      ITAÚ
    </div>
  ),
  bradesco: () => (
    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
      BRAD
    </div>
  ),
  nubank: () => (
    <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
      NU
    </div>
  ),
  inter: () => (
    <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center text-white font-bold text-xs">
      INT
    </div>
  ),
  santander: () => (
    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
      SAN
    </div>
  ),
  bb: () => (
    <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-bold text-xs">
      BB
    </div>
  ),
  caixa: () => (
    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
      CEF
    </div>
  ),
  other: () => (
    <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">
      OUT
    </div>
  )
}

// Componente para bandeiras de cartão de crédito
export const CreditCardLogos = {
  visa: () => (
    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
      VISA
    </div>
  ),
  mastercard: () => (
    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
      MAST
    </div>
  ),
  elo: () => (
    <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-bold text-xs">
      ELO
    </div>
  ),
  amex: () => (
    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
      AMEX
    </div>
  ),
  hipercard: () => (
    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
      HIP
    </div>
  ),
  other: () => (
    <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">
      OUT
    </div>
  )
}

// Lista de bancos disponíveis
export const bankOptions = [
  { value: 'itau', label: 'Itaú', logo: BankLogos.itau },
  { value: 'bradesco', label: 'Bradesco', logo: BankLogos.bradesco },
  { value: 'nubank', label: 'Nubank', logo: BankLogos.nubank },
  { value: 'inter', label: 'Inter', logo: BankLogos.inter },
  { value: 'santander', label: 'Santander', logo: BankLogos.santander },
  { value: 'bb', label: 'Banco do Brasil', logo: BankLogos.bb },
  { value: 'caixa', label: 'Caixa Econômica Federal', logo: BankLogos.caixa },
  { value: 'other', label: 'Outro Banco', logo: BankLogos.other }
]

// Lista de bandeiras de cartão disponíveis
export const creditCardOptions = [
  { value: 'visa', label: 'Visa', logo: CreditCardLogos.visa },
  { value: 'mastercard', label: 'Mastercard', logo: CreditCardLogos.mastercard },
  { value: 'elo', label: 'Elo', logo: CreditCardLogos.elo },
  { value: 'amex', label: 'American Express', logo: CreditCardLogos.amex },
  { value: 'hipercard', label: 'Hipercard', logo: CreditCardLogos.hipercard },
  { value: 'other', label: 'Outra Bandeira', logo: CreditCardLogos.other }
]