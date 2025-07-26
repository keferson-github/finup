# 📊 FinUp - Sistema de Controle Financeiro Inteligente

## 🎯 Visão Geral

O **FinUp** é um sistema completo de controle financeiro desenvolvido com tecnologias modernas, oferecendo uma interface intuitiva e funcionalidades avançadas para gestão de finanças pessoais. O projeto é composto por um frontend em React/TypeScript e um backend em NestJS, utilizando Supabase como banco de dados.

## 🏗️ Arquitetura do Sistema

### Frontend (React + TypeScript)
- **Framework**: React 18 com TypeScript
- **Bundler**: Vite 6.3.5
- **Estilização**: Tailwind CSS com tema customizado
- **Roteamento**: React Router DOM
- **Estado Global**: Context API
- **Formulários**: React Hook Form + Zod
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Notificações**: React Hot Toast
- **Banco de Dados**: Supabase

### Backend (NestJS)
- **Framework**: NestJS
- **ORM**: TypeORM
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Documentação**: Swagger
- **Validação**: Class Validator
- **Autenticação**: JWT + Passport

## 📁 Estrutura do Projeto

```
finup/
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   │   ├── accounts/        # Gestão de contas
│   │   │   ├── auth/           # Autenticação
│   │   │   ├── budgets/        # Orçamentos
│   │   │   ├── calendar/       # Calendário financeiro
│   │   │   ├── categories/     # Categorias
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── import/         # Importação de dados
│   │   │   ├── layout/         # Layout da aplicação
│   │   │   ├── notifications/  # Notificações
│   │   │   ├── reports/        # Relatórios
│   │   │   ├── settings/       # Configurações
│   │   │   ├── transactions/   # Transações
│   │   │   └── ui/            # Componentes UI base
│   │   ├── contexts/          # Contextos React
│   │   ├── hooks/             # Hooks customizados
│   │   ├── lib/               # Configurações e utilitários
│   │   ├── pages/             # Páginas da aplicação
│   │   └── data/              # Dados estáticos
│   ├── public/                # Arquivos públicos
│   └── docs/                  # Documentação específica
├── backend/
│   ├── src/
│   │   ├── accounts/          # Módulo de contas
│   │   ├── auth/              # Módulo de autenticação
│   │   ├── categories/        # Módulo de categorias
│   │   ├── transactions/      # Módulo de transações
│   │   ├── users/             # Módulo de usuários
│   │   ├── common/            # Utilitários comuns
│   │   └── database/          # Configuração do banco
│   └── test/                  # Testes
└── supabase/
    └── migrations/            # Migrações do banco
```

## 🚀 Funcionalidades Implementadas

### ✅ 1. Dashboard Interativo
- **Visão Geral Financeira**: Cards de resumo com receitas, despesas e saldo
- **Gráficos Dinâmicos**: Evolução temporal e distribuição por categoria
- **Transações Recentes**: Lista das últimas movimentações
- **Próximas Transações**: Agenda de transações futuras
- **Status dos Orçamentos**: Monitoramento de limites de gastos
- **Saúde Financeira**: Indicadores de performance financeira
- **Filtros Sincronizados**: Expansão coordenada entre cards

### ✅ 2. Gestão Completa de Transações
- **CRUD Completo**: Criar, visualizar, editar e excluir transações
- **Formulário Multi-step**: Interface intuitiva para entrada de dados
- **Tipos**: Receitas e despesas com validações específicas
- **Status**: Pago, pendente e vencido com indicadores visuais
- **Parcelamento**: Divisão automática em múltiplas parcelas
- **Recorrência**: Templates para transações repetitivas
- **Filtros Avançados**: Por data, valor, tipo, status, conta e categoria
- **Busca Textual**: Localização rápida por título e descrição

### ✅ 3. Sistema de Contas
- **Múltiplos Tipos**: Conta corrente, poupança, cartão de crédito, dinheiro, investimento
- **Saldo Automático**: Atualização em tempo real baseada nas transações
- **Personalização**: Cores, ícones e descrições customizáveis
- **Integração Bancária**: Logos de bancos e bandeiras de cartão
- **Controle de Status**: Ativação/desativação de contas
- **Botão de Atualização**: Refresh manual com feedback visual

### ✅ 4. Categorização Inteligente
- **Categorias Personalizadas**: Criação de categorias específicas
- **Tipos Distintos**: Separação entre receitas e despesas
- **Cores e Ícones**: Identificação visual rápida
- **Estatísticas**: Análise de gastos por categoria
- **Sincronização**: Atualização automática em toda a aplicação

### ✅ 5. Calendário Financeiro
- **Visualização Mensal**: Layout de calendário tradicional
- **Transações por Dia**: Detalhamento diário das movimentações
- **Saldo Diário**: Cálculo automático do saldo por dia
- **Modal de Detalhes**: Informações completas de cada transação
- **Ações Rápidas**: Marcar como pago/pendente diretamente
- **Navegação Temporal**: Mudança fácil entre meses

### ✅ 6. Sistema de Orçamentos
- **Criação de Orçamentos**: Definição de limites por categoria
- **Monitoramento em Tempo Real**: Acompanhamento do progresso
- **Alertas Visuais**: Indicadores de status (ok, alerta, ultrapassado)
- **Estatísticas**: Progresso percentual e valores absolutos
- **Filtros**: Organização por status e ordenação

### ✅ 7. Relatórios e Análises
- **Gráficos Interativos**: Visualizações dinâmicas dos dados
- **Períodos Customizáveis**: Análise por diferentes intervalos
- **Comparativos**: Evolução temporal das finanças
- **Exportação**: Geração de relatórios em diferentes formatos

### ✅ 8. Sistema de Temas
- **Modo Claro/Escuro**: Alternância automática ou manual
- **Paleta GitHub**: Cores consistentes e profissionais
- **Persistência**: Salvamento da preferência do usuário
- **Responsividade**: Adaptação a diferentes dispositivos

### ✅ 9. Autenticação e Segurança
- **Supabase Auth**: Sistema robusto de autenticação
- **Proteção de Rotas**: Controle de acesso às páginas
- **Sessão Persistente**: Manutenção do login
- **Perfil de Usuário**: Gestão de dados pessoais

## 🔧 Tecnologias e Dependências

### Frontend
```json
{
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "vite": "^6.3.5",
  "tailwindcss": "^3.3.5",
  "@supabase/supabase-js": "^2.38.4",
  "react-router-dom": "^6.20.1",
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4",
  "recharts": "^2.8.0",
  "lucide-react": "^0.294.0",
  "react-hot-toast": "^2.4.1",
  "date-fns": "^2.30.0"
}
```

### Backend
```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/swagger": "^7.1.8",
  "typeorm": "^0.3.17",
  "pg": "^8.11.3",
  "passport": "^0.6.0",
  "class-validator": "^0.14.0"
}
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `profiles`
- Informações do usuário (nome, email, configurações)
- Moeda padrão e fuso horário
- Avatar e preferências

#### `accounts`
- Contas financeiras do usuário
- Tipos: conta corrente, poupança, cartão, dinheiro, investimento
- Saldo atual e inicial
- Personalização (cor, banco, bandeira)

#### `categories`
- Categorias de receitas e despesas
- Personalização visual (cor, ícone)
- Status ativo/inativo

#### `transactions`
- Transações financeiras completas
- Parcelamento e recorrência
- Status e datas de vencimento
- Relacionamentos com contas e categorias

#### `budgets`
- Orçamentos por categoria
- Limites e períodos
- Cálculo automático de progresso

## 🎨 Design System

### Paleta de Cores
- **Base**: Inspirada no GitHub (tons de cinza)
- **Acentos**: Azul, verde, vermelho, amarelo
- **Modo Escuro**: Suporte completo com cores adaptadas
- **Semântica**: Cores específicas para receitas, despesas, alertas

### Componentes UI
- **Botões**: Variações de tamanho e estilo
- **Formulários**: Inputs, selects, textareas validados
- **Modais**: Sobreposições para ações específicas
- **Cards**: Containers para informações agrupadas
- **Gráficos**: Visualizações interativas de dados
- **Loading**: Indicadores de carregamento
- **Toasts**: Notificações temporárias

## 🔄 Fluxo de Dados

### Arquitetura de Estado
1. **Context API**: Estado global da aplicação
2. **Custom Hooks**: Lógica de negócio encapsulada
3. **Supabase**: Sincronização em tempo real
4. **Local State**: Estado específico de componentes

### Sincronização
- **Real-time**: Atualizações automáticas via Supabase
- **Optimistic Updates**: Interface responsiva
- **Error Handling**: Tratamento robusto de erros
- **Retry Logic**: Tentativas automáticas em falhas

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Large Desktop**: > 1440px

### Adaptações
- **Layout**: Sidebar colapsível em mobile
- **Grids**: Reorganização automática de cards
- **Formulários**: Campos empilhados em telas pequenas
- **Gráficos**: Redimensionamento dinâmico

## 🚀 Performance

### Otimizações
- **Code Splitting**: Carregamento lazy de páginas
- **Chunk Splitting**: Separação de vendors
- **Memoização**: React.memo e useMemo
- **Debouncing**: Filtros e buscas otimizadas
- **Image Optimization**: SVGs para ícones

### Métricas
- **Bundle Size**: Chunks otimizados < 1MB
- **Loading Time**: < 3s em conexões 3G
- **Lighthouse Score**: > 90 em todas as métricas

## 🔒 Segurança

### Medidas Implementadas
- **Row Level Security**: Políticas no Supabase
- **Validação Dupla**: Frontend + Backend
- **Sanitização**: Prevenção de XSS
- **HTTPS**: Comunicação criptografada
- **Environment Variables**: Configurações sensíveis

## 🧪 Testes

### Estratégia
- **Unit Tests**: Hooks e utilitários
- **Integration Tests**: Fluxos completos
- **E2E Tests**: Cenários de usuário
- **Visual Tests**: Consistência de UI

## 📈 Melhorias Implementadas

### Sincronização Automática
- ✅ **Sistema de Categorias**: Logs detalhados e callbacks
- ✅ **Sistema de Contas**: Forçador de re-render
- ✅ **Dashboard**: Atualizações em tempo real
- ✅ **Filtros Sincronizados**: Expansão coordenada

### UX/UI
- ✅ **Botão de Refresh**: Feedback visual durante carregamento
- ✅ **Filtros Visuais**: Texto "Filtros" em todos os cards
- ✅ **Reposicionamento**: Filtros abaixo das estatísticas
- ✅ **Animações**: Transições suaves e responsivas

## 🔮 Roadmap Futuro

### Próximas Funcionalidades
1. **Metas Financeiras**: Sistema de objetivos
2. **Importação de Dados**: CSV, OFX, API bancária
3. **Notificações Push**: Alertas em tempo real
4. **Relatórios Avançados**: PDF, Excel, análises IA
5. **Mobile App**: React Native ou PWA
6. **Integração Bancária**: Open Banking
7. **Investimentos**: Acompanhamento de carteira
8. **Planejamento**: Simulações e projeções

### Melhorias Técnicas
1. **Testes Automatizados**: Cobertura completa
2. **CI/CD**: Pipeline de deploy
3. **Monitoramento**: Logs e métricas
4. **Internacionalização**: Múltiplos idiomas
5. **Acessibilidade**: WCAG 2.1 AA
6. **Performance**: Otimizações avançadas

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Configuração
1. Criar projeto no Supabase
2. Configurar variáveis de ambiente
3. Executar migrações
4. Iniciar aplicações

## 📞 Suporte

### Documentação
- **README.md**: Instruções básicas
- **docs/**: Documentação específica
- **MELHORIAS_IMPLEMENTADAS.md**: Histórico de melhorias

### Contato
- **Issues**: GitHub Issues
- **Discussões**: GitHub Discussions
- **Email**: Suporte técnico

---

**FinUp** - Controle Financeiro Inteligente 🎯

*Desenvolvido com ❤️ usando React, TypeScript, NestJS e Supabase*