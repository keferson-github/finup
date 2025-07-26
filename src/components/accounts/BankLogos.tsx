// Componente para logotipos de bancos usando imagens reais
export const BankLogos = {
  itau: () => (
    <img 
      src="/logo-banks/logo-itau.png" 
      alt="Itaú" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  bradesco: () => (
    <img 
      src="/logo-banks/logo-bradesco.png" 
      alt="Bradesco" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  nubank: () => (
    <img 
      src="/logo-banks/logo-nubank.png" 
      alt="Nubank" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  inter: () => (
    <img 
      src="/logo-banks/logo-inter.png" 
      alt="Inter" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  santander: () => (
    <img 
      src="/logo-banks/logo-santander.png" 
      alt="Santander" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  bb: () => (
    <img 
      src="/logo-banks/logo-banco-do-brasil.png" 
      alt="Banco do Brasil" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  caixa: () => (
    <img 
      src="/logo-banks/logo-caixa-economica-federal.png" 
      alt="Caixa Econômica Federal" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  other: () => (
    <div className="w-8 h-8 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">
      OUT
    </div>
  )
}

// Componente para bandeiras de cartão de crédito usando imagens reais
export const CreditCardLogos = {
  visa: () => (
    <img 
      src="/logo-credits/logo-visa.png" 
      alt="Visa" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  mastercard: () => (
    <img 
      src="/logo-credits/logo-mastercard.png" 
      alt="Mastercard" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  elo: () => (
    <img 
      src="/logo-credits/logo-elo.png" 
      alt="Elo" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  amex: () => (
    <img 
      src="/logo-credits/logo-amex.png" 
      alt="American Express" 
      className="w-8 h-8 object-contain rounded"
    />
  ),
  hipercard: () => (
    <img 
      src="/logo-credits/logo-hipercard.png" 
      alt="Hipercard" 
      className="w-8 h-8 object-contain rounded"
    />
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