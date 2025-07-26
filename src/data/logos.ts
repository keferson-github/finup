// Configuração dos logotipos disponíveis para bancos e cartões de crédito

export interface LogoOption {
    id: string
    name: string
    image: string
    category: 'bank' | 'credit'
}

// Logos de bancos para conta corrente, poupança e investimento
export const bankLogos: LogoOption[] = [
    {
        id: 'banco-do-brasil',
        name: 'Banco do Brasil',
        image: '/logo-banks/logo-banco-do-brasil.png',
        category: 'bank'
    },
    {
        id: 'bradesco',
        name: 'Bradesco',
        image: '/logo-banks/logo-bradesco.png',
        category: 'bank'
    },
    {
        id: 'caixa-economica-federal',
        name: 'Caixa Econômica Federal',
        image: '/logo-banks/logo-caixa-economica-federal.png',
        category: 'bank'
    },
    {
        id: 'inter',
        name: 'Banco Inter',
        image: '/logo-banks/logo-inter.png',
        category: 'bank'
    },
    {
        id: 'itau',
        name: 'Itaú',
        image: '/logo-banks/logo-itau.png',
        category: 'bank'
    },
    {
        id: 'nubank',
        name: 'Nubank',
        image: '/logo-banks/logo-nubank.png',
        category: 'bank'
    },
    {
        id: 'santander',
        name: 'Santander',
        image: '/logo-banks/logo-santander.png',
        category: 'bank'
    }
]

// Logos de bandeiras de cartão de crédito
export const creditLogos: LogoOption[] = [
    {
        id: 'visa',
        name: 'Visa',
        image: '/logo-credits/logo-visa.png',
        category: 'credit'
    },
    {
        id: 'mastercard',
        name: 'Mastercard',
        image: '/logo-credits/logo-mastercard.png',
        category: 'credit'
    },
    {
        id: 'elo',
        name: 'Elo',
        image: '/logo-credits/logo-elo.png',
        category: 'credit'
    },
    {
        id: 'amex',
        name: 'American Express',
        image: '/logo-credits/logo-amex.png',
        category: 'credit'
    },
    {
        id: 'hipercard',
        name: 'Hipercard',
        image: '/logo-credits/logo-hipercard.png',
        category: 'credit'
    }
]

// Função para obter logo por ID
export const getLogoById = (id: string, category: 'bank' | 'credit'): LogoOption | undefined => {
    const logos = category === 'bank' ? bankLogos : creditLogos
    return logos.find(logo => logo.id === id)
}

// Função para obter logos por tipo de conta
export const getLogosForAccountType = (accountType: string): LogoOption[] => {
    switch (accountType) {
        case 'cartao_credito':
            return creditLogos
        case 'conta_corrente':
        case 'poupanca':
        case 'investimento':
            return bankLogos
        case 'dinheiro':
            return [] // Dinheiro não precisa de logo
        default:
            return []
    }
}