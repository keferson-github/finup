# Stack Tecnológico - FinUp

## Frontend Framework
- **React 18** com TypeScript
- **Vite** como build tool e dev server
- **React Router DOM** para roteamento

## Styling & UI
- **Tailwind CSS** com configuração customizada baseada no GitHub Design System
- **Lucide React** para ícones
- **React Hot Toast** para notificações
- Suporte a **tema claro/escuro** via Context API

## Backend & Database
- **Supabase** para backend-as-a-service
- **PostgreSQL** como banco de dados
- Autenticação via Supabase Auth
- Real-time subscriptions

## Formulários & Validação
- **React Hook Form** para gerenciamento de formulários
- **Zod** para validação de schemas
- **@hookform/resolvers** para integração

## Gráficos & Visualização
- **Recharts** para gráficos e dashboards
- **date-fns** para manipulação de datas

## Utilitários
- **React Number Format** para formatação de valores monetários

## Comandos Principais

### Desenvolvimento
```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build de produção
npm run lint         # Executa ESLint
```

### Estrutura de Build
- **Code Splitting** automático por rotas
- **Manual Chunks** para otimização:
  - `react-vendor`: React core
  - `router-vendor`: React Router
  - `form-vendor`: Formulários e validação
  - `ui-vendor`: Componentes UI
  - `chart-vendor`: Recharts
  - `supabase-vendor`: Supabase client
  - `date-vendor`: date-fns

## Configurações
- **ESLint** com regras TypeScript e React
- **PostCSS** com Autoprefixer
- **TypeScript** strict mode habilitado
- **Vite** com otimizações para produção