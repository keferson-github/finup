# Estrutura do Projeto - FinUp

## Organização de Diretórios

```
src/
├── components/          # Componentes React organizados por feature
│   ├── accounts/        # Componentes de gestão de contas
│   ├── auth/           # Componentes de autenticação
│   ├── budgets/        # Componentes de orçamentos
│   ├── calendar/       # Componentes do calendário financeiro
│   ├── categories/     # Componentes de categorias
│   ├── dashboard/      # Componentes do dashboard
│   ├── import/         # Componentes de importação de dados
│   ├── layout/         # Componentes de layout (header, sidebar, etc.)
│   ├── notifications/  # Componentes de notificações
│   ├── reports/        # Componentes de relatórios
│   ├── settings/       # Componentes de configurações
│   ├── transactions/   # Componentes de transações
│   └── ui/             # Componentes UI reutilizáveis (Modal, Button, etc.)
├── contexts/           # Contextos React para estado global
├── hooks/              # Custom hooks organizados por feature
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação (rotas principais)
└── data/               # Dados estáticos e mocks
```

## Convenções de Nomenclatura

### Arquivos e Componentes
- **Componentes**: PascalCase (`TransactionForm.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useTransactions.ts`)
- **Páginas**: PascalCase (`Dashboard.tsx`)
- **Utilitários**: camelCase (`formatCurrency.ts`)
- **Contextos**: PascalCase com sufixo `Context` (`AuthContext.tsx`)

### Estrutura de Componentes
- Um componente por arquivo
- Export nomeado para componentes principais
- Props interface definida antes do componente
- Componentes funcionais com TypeScript

## Padrões de Organização

### Componentes por Feature
Cada feature tem sua própria pasta em `components/` com:
- Componentes específicos da feature
- Sub-componentes relacionados
- Formulários e modais específicos

### Hooks Customizados
- Um hook por arquivo em `hooks/`
- Nomeação consistente: `use[Feature].ts`
- Encapsulam lógica de negócio e chamadas à API

### Contextos
- Estado global gerenciado via Context API
- Contextos específicos por domínio (Auth, Theme, Dashboard)
- Providers organizados hierarquicamente

### Páginas
- Componentes de página em `pages/`
- Lazy loading implementado para otimização
- Roteamento centralizado em `App.tsx`

## Arquivos de Configuração

### Raiz do Projeto
- `package.json` - Dependências e scripts
- `vite.config.ts` - Configuração do Vite
- `tailwind.config.js` - Configuração do Tailwind CSS
- `tsconfig.json` - Configuração TypeScript
- `eslint.config.js` - Regras de linting

### Supabase
- `supabase/migrations/` - Migrações do banco de dados
- `src/lib/supabase.ts` - Cliente e tipos do Supabase

## Boas Práticas

### Importações
- Importações relativas para arquivos na mesma feature
- Importações absolutas a partir de `src/`
- Agrupamento: bibliotecas externas → internas → relativas

### Componentes UI
- Componentes reutilizáveis em `src/components/ui/`
- Props bem tipadas com interfaces
- Suporte a temas claro/escuro
- Acessibilidade considerada

### Estado
- Estado local para componentes específicos
- Context API para estado compartilhado
- Custom hooks para lógica complexa