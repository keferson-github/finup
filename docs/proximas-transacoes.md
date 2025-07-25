# Próximas Transações - Documentação Técnica

## Visão Geral

O card **"Próximas Transações"** é um componente estratégico do dashboard do FinUp que permite aos usuários visualizar e gerenciar suas movimentações financeiras futuras agendadas. Este componente oferece uma visão antecipada dos compromissos financeiros, facilitando o planejamento e controle do fluxo de caixa.

## Funcionalidades Principais

### 1. Exibição de Transações Futuras em Tempo Real
- **Fonte de Dados**: Tabela `transactions` do Supabase
- **Filtro de Status**: Apenas transações com status "pendente"
- **Período**: Próximos 30 dias (configurável via filtros)
- **Limite**: Até 50 transações futuras
- **Ordenação**: Por data de vencimento (mais próximas primeiro)
- **Atualização**: Automática ao carregar o dashboard

### 2. Informações Detalhadas por Transação
Cada transação futura exibe:
- **Título**: Nome/descrição da transação
- **Valor**: Formatado em moeda brasileira (R$)
- **Tipo**: Receita (+) ou Despesa (-) com cores distintas
- **Status**: Badge "Pendente" com indicador visual
- **Data**: Formato dd/MM/yyyy com indicação de proximidade
- **Categoria**: Nome da categoria associada com ícone
- **Conta**: Conta bancária/financeira relacionada
- **Indicador Visual**: Ícone da categoria ou cor da conta

### 3. Estatísticas Rápidas
O componente exibe um resumo estatístico das transações futuras filtradas:
- **Total de Transações**: Quantidade total de transações agendadas
- **Total de Receitas**: Soma de todas as receitas futuras
- **Total de Despesas**: Soma de todas as despesas futuras
- **Saldo Projetado**: Diferença entre receitas e despesas futuras

### 4. Filtros Avançados
#### Filtro por Tipo
- **Todos**: Exibe receitas e despesas
- **Receitas**: Apenas transações de entrada
- **Despesas**: Apenas transações de saída

#### Filtro por Período
- **Próximos 7 dias**: Transações da próxima semana
- **Próximos 15 dias**: Transações das próximas duas semanas
- **Próximos 30 dias**: Transações do próximo mês

### 5. Funcionalidade "Mostrar Mais"
- **Exibição Inicial**: 10 transações
- **Incremento**: +10 transações por clique
- **Controle Dinâmico**: Botão aparece apenas quando há mais dados
- **Scroll Automático**: Área rolável para grandes volumes

## Estrutura de Dados

### Interface UpcomingTransaction
```typescript
export interface UpcomingTransaction {
  id: string
  titulo: string
  valor: number
  tipo: 'receita' | 'despesa'
  data: string
  category: {
    nome: string
    cor: string
    icone: string
  } | null
  account: {
    nome: string
    cor: string
  } | null
}
```

### Consulta SQL do Supabase
```sql
SELECT 
  id,
  titulo,
  valor,
  tipo,
  data,
  criado_em,
  categories(nome, cor, icone),
  accounts(nome, cor)
FROM transactions
WHERE 
  user_id = $1 AND
  status = 'pendente' AND
  data >= CURRENT_DATE AND
  data <= (CURRENT_DATE + INTERVAL '30 days')
ORDER BY data ASC
LIMIT 50;
```

## Fluxo Operacional

### 1. Carregamento Inicial
1. **Autenticação**: Verifica se o usuário está logado
2. **Consulta**: Busca transações pendentes dos próximos 30 dias
3. **Formatação**: Processa dados para interface
4. **Exibição**: Renderiza primeiras 10 transações
5. **Estatísticas**: Calcula resumos financeiros

### 2. Aplicação de Filtros
1. **Seleção**: Usuário escolhe filtros de tipo e período
2. **Processamento**: Filtra dados localmente
3. **Recálculo**: Atualiza estatísticas
4. **Re-renderização**: Atualiza lista e contadores

### 3. Expansão de Dados
1. **Solicitação**: Usuário clica em "Mostrar mais"
2. **Incremento**: Aumenta limite de exibição em 10 transações
3. **Atualização**: Re-renderiza lista com mais itens
4. **Controle**: Gerencia visibilidade do botão baseado em dados restantes

## Integração com o Sistema

### Páginas de Origem dos Dados
As transações futuras exibidas no card são coletadas de:

1. **Página de Transações** (`/transactions`)
   - Criação de transações agendadas
   - Transações recorrentes
   - Agendamento de pagamentos futuros

2. **Página de Orçamentos** (`/budgets`)
   - Transações vinculadas a metas orçamentárias
   - Planejamento de gastos futuros
   - Alertas de vencimento

3. **Página de Contas** (`/accounts`)
   - Transferências programadas
   - Débitos automáticos agendados
   - Investimentos com data futura

4. **Integrações Externas**
   - APIs bancárias (débitos automáticos)
   - Sistemas de cobrança
   - Webhooks de agendamento

### Relacionamentos de Dados

#### Tabela `transactions`
- **user_id**: Vincula transação ao usuário
- **category_id**: Relaciona com tabela `categories`
- **account_id**: Relaciona com tabela `accounts`
- **status**: Filtro para "pendente"
- **data**: Data futura de vencimento
- **tipo**: receita ou despesa

#### Tabela `categories`
- **nome**: Nome da categoria
- **cor**: Cor para identificação visual
- **icone**: Emoji ou ícone representativo
- **tipo**: receita ou despesa

#### Tabela `accounts`
- **nome**: Nome da conta (ex: "Conta Corrente")
- **cor**: Cor para identificação visual
- **tipo**: Tipo da conta (corrente, poupança, etc.)

## Tratamento de Erros

### Cenários de Erro
1. **Falha na Conexão**: Exibe toast de erro e lista vazia
2. **Dados Inválidos**: Filtra registros inconsistentes
3. **Timeout**: Retry automático com fallback
4. **Permissões**: Verifica autenticação do usuário

### Estratégias de Recuperação
- **Fallback Graceful**: Exibe estado vazio em caso de erro
- **Logs Detalhados**: Console.error para debugging
- **Feedback Visual**: Toast notifications para o usuário
- **Estado Consistente**: Limpa dados em caso de falha

## Otimizações de Performance

### Técnicas Implementadas
1. **useMemo**: Cache de cálculos de filtros e estatísticas
2. **Lazy Loading**: Carregamento incremental de transações
3. **Debounce**: Evita re-renderizações desnecessárias
4. **Limit/Offset**: Paginação eficiente no banco
5. **Index Optimization**: Consultas otimizadas por data e status

### Métricas de Performance
- **Tempo de Carregamento**: < 500ms para 50 transações
- **Uso de Memória**: Otimizado para grandes volumes
- **Re-renderizações**: Minimizadas via memoização
- **Queries SQL**: Indexadas por user_id, status e data

## Estados da Interface

### Estado de Carregamento
- **Skeleton Loader**: 5 placeholders animados
- **Indicadores**: Shimmer effect nos cards
- **Feedback**: Loading spinner no header

### Estado Vazio
- **Ícone**: Clock (relógio) centralizado
- **Mensagem**: "Nenhuma transação agendada"
- **Contexto**: Período selecionado nos filtros
- **Call-to-Action**: Sugestão para criar transações

### Estado com Dados
- **Lista Scrollável**: Máximo 96px de altura
- **Hover Effects**: Transições suaves
- **Status Badges**: Indicadores visuais coloridos
- **Botão Expansão**: "Mostrar mais" quando aplicável

## Benefícios para o Usuário

### Planejamento Financeiro
1. **Visão Antecipada**: Conhecimento prévio de compromissos
2. **Controle de Fluxo**: Gestão proativa do caixa
3. **Prevenção**: Evita surpresas financeiras
4. **Organização**: Planejamento baseado em dados reais

### Experiência do Usuário
1. **Interface Intuitiva**: Design limpo e responsivo
2. **Filtros Flexíveis**: Personalização da visualização
3. **Feedback Imediato**: Atualizações em tempo real
4. **Acessibilidade**: Cores e ícones para diferentes tipos

### Tomada de Decisão
1. **Dados Precisos**: Informações sempre atualizadas
2. **Contexto Completo**: Categoria, conta e valor
3. **Tendências**: Padrões de receitas e despesas futuras
4. **Alertas Visuais**: Status e proximidade de vencimento

## Configurações e Personalização

### Opções Disponíveis
- **Período de Visualização**: 7, 15 ou 30 dias
- **Tipos de Transação**: Filtros por receita/despesa
- **Quantidade Exibida**: Expansão incremental
- **Ordenação**: Por data de vencimento

### Futuras Melhorias
- **Notificações Push**: Alertas de vencimento
- **Categorização Automática**: IA para sugestões
- **Integração Bancária**: Sincronização automática
- **Relatórios Personalizados**: Exportação de dados

Este card é fundamental para o controle financeiro proativo, permitindo que os usuários se preparem adequadamente para seus compromissos futuros e mantenham um fluxo de caixa saudável.