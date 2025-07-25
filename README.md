# FinUp Frontend - React App

Sistema de controle financeiro inteligente desenvolvido com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades Implementadas

### ✅ **1. Gestão Completa de Transações**
- **CRUD completo** para transações (receitas e despesas)
- **Formulário multi-step** para melhor experiência do usuário
- **Filtros avançados** por data, valor, tipo, status, conta e categoria
- **Parcelamento** e **recorrência** de transações

### ✅ **2. Dashboard Interativo**
- **Visão geral** da situação financeira
- **Gráficos** de evolução e distribuição por categoria
- **Cards de resumo** com saldos e estatísticas
- **Transações recentes** e próximas transações

### ✅ **3. Calendário Financeiro**
- **Visualização mensal** de transações
- **Detalhes por dia** com saldo diário
- **Modal de detalhes** para cada transação
- **Ações rápidas** para marcar como pago/pendente

### ✅ **4. Componentes Reutilizáveis**
- **Sistema de temas** (claro/escuro)
- **Componentes UI** personalizados
- **Modais** reutilizáveis
- **Formulários** com validação

## 🏗️ Arquitetura

```
src/
├── components/
│   ├── accounts/       # Componentes de contas
│   ├── auth/           # Componentes de autenticação
│   ├── budgets/        # Componentes de orçamentos
│   ├── calendar/       # Componentes do calendário
│   ├── categories/     # Componentes de categorias
│   ├── dashboard/      # Componentes do dashboard
│   ├── import/         # Componentes de importação
│   ├── layout/         # Componentes de layout
│   ├── notifications/  # Componentes de notificações
│   ├── reports/        # Componentes de relatórios
│   ├── settings/       # Componentes de configurações
│   ├── transactions/   # Componentes de transações
│   └── ui/             # Componentes de UI reutilizáveis
├── contexts/           # Contextos React
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
└── App.tsx             # Componente principal
```

## 🛠️ Instalação e Configuração

### 1. **Instalar dependências**
```bash
npm install
```

### 2. **Configurar variáveis de ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações do Supabase
```

### 3. **Executar em desenvolvimento**
```bash
npm run dev
```

### 4. **Build para produção**
```bash
npm run build
npm run preview
```

## 🧩 Componentes Reutilizáveis

### Modal

O componente `Modal` é uma solução reutilizável para exibir conteúdo em uma janela sobreposta à interface principal. Ele oferece uma experiência consistente em toda a aplicação.

#### Características

- **Centralizado** na tela com overlay escuro
- **Header fixo** com título e botão de fechar
- **Conteúdo scrollável** para acomodar diferentes tamanhos
- **Footer opcional** para ações
- **Tamanho personalizável** através da prop `maxWidth`

#### Props

| Prop | Tipo | Descrição |
|------|------|------------|
| `isOpen` | boolean | Controla a visibilidade do modal |
| `onClose` | function | Função chamada ao fechar o modal |
| `title` | string | Título exibido no header do modal |
| `children` | ReactNode | Conteúdo do modal |
| `footer` | ReactNode | Conteúdo opcional do footer |
| `maxWidth` | string | Largura máxima do modal (default: 'max-w-md') |

#### Exemplo de Uso

```tsx
import { useState } from 'react'
import { Modal } from '../components/ui/Modal'

const ExampleComponent = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Título do Modal"
        footer={
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsOpen(false)}>
              Cancelar
            </button>
            <button onClick={() => {
              // Ação de confirmação
              setIsOpen(false)
            }}>
              Confirmar
            </button>
          </div>
        }
      >
        <div className="p-4">
          Conteúdo do modal aqui...
        </div>
      </Modal>
    </>
  )
}
```

## 🔧 Boas Práticas

### Modais

- Use o componente `Modal` para manter consistência na UI
- Gerencie o estado de abertura no componente pai
- Utilize o padrão de composição para conteúdos complexos
- Implemente validações em formulários dentro de modais
- Forneça feedback visual durante operações assíncronas

## 🧪 Testes

```bash
# Executar testes
npm run test

# Cobertura de testes
npm run test:coverage
```

## 🚀 Próximos Passos

1. **Melhorias de Acessibilidade** - Implementar ARIA e navegação por teclado
2. **Testes Automatizados** - Aumentar cobertura de testes
3. **Otimização de Performance** - Implementar memoização e lazy loading
4. **Internacionalização** - Suporte a múltiplos idiomas
5. **PWA** - Transformar em Progressive Web App

---

**FinUp Frontend React** - Interface moderna, responsiva e intuitiva para controle financeiro inteligente! 🎯