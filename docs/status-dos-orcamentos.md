# Status dos Orçamentos - Documentação Técnica

## Visão Geral

O card **"Status dos Orçamentos"** é um componente essencial do dashboard do FinUp que permite aos usuários monitorar em tempo real o desempenho de seus orçamentos cadastrados. Este card oferece uma visão consolidada do progresso de gastos em relação aos limites estabelecidos, facilitando o controle financeiro proativo.

## Funcionalidades Principais

### 1. **Exibição em Tempo Real**
- Mostra todos os orçamentos ativos do usuário
- Calcula automaticamente o progresso baseado nas transações registradas
- Atualiza dados dinamicamente conforme novas transações são adicionadas

### 2. **Informações Detalhadas de Cada Orçamento**
- **Nome do orçamento** e categoria principal associada
- **Progresso percentual** com barra visual
- **Valores**: gasto atual vs. limite estabelecido
- **Status visual**: ícones e cores indicativas
- **Badges de status**: "No Limite", "Em Alerta", "Ultrapassado"

### 3. **Estatísticas Rápidas**
- **Total de orçamentos** ativos
- **Quantidade por status** (No Limite, Em Alerta/Ultrapassado)
- **Progresso médio** de todos os orçamentos
- **Resumo financeiro**: Total orçado vs. Total gasto

### 4. **Filtros Avançados**
- **Por Status**: Todos, No Limite, Em Alerta, Ultrapassado
- **Ordenação**: Nome, Progresso (%), Valor Gasto, Valor Limite
- Interface expansível para melhor usabilidade

### 5. **Funcionalidade "Mostrar Mais"**
- Exibição inicial de 5 orçamentos
- Expansão incremental (+5 por clique)
- Controle inteligente do botão baseado na quantidade de dados

## Estrutura de Dados

### Interface `BudgetStatus`
```typescript
interface BudgetStatus {
  id: string
  nome: string
  valor_limite: number
  valor_gasto: number
  progresso_percentual: number
  status: 'ok' | 'alerta' | 'ultrapassado'
  categoria_principal?: {
    nome: string
    cor: string
    icone: string
  }
}
```

### Consulta SQL (Supabase)
```sql
-- Buscar orçamentos ativos
SELECT * FROM budgets 
WHERE user_id = ? 
AND ativo = true 
ORDER BY criado_em DESC 
LIMIT 20;

-- Calcular gastos por orçamento
SELECT valor FROM transactions 
WHERE user_id = ? 
AND tipo = 'despesa' 
AND status IN ('pago', 'pendente')
AND data BETWEEN ? AND ?
AND (category_id IN (?) OR account_id IN (?));
```

## Fluxo Operacional

### 1. **Carregamento Inicial**
- Busca orçamentos ativos do usuário no Supabase
- Para cada orçamento, calcula período baseado no tipo (semanal/mensal/anual)
- Consulta transações relacionadas no período determinado
- Calcula progresso e determina status

### 2. **Aplicação de Filtros**
- Filtragem local por status selecionado
- Ordenação conforme critério escolhido
- Recálculo de estatísticas baseado nos dados filtrados

### 3. **Expansão de Dados**
- Controle de exibição através do estado `displayCount`
- Incremento de 5 em 5 orçamentos
- Gerenciamento inteligente do botão "Mostrar Mais"

### 4. **Atualização Automática**
- Integração com `DashboardContext` para atualizações
- Recálculo automático quando há mudanças nas transações
- Sincronização em tempo real com outros componentes

## Integração no Sistema

### Fontes de Dados
- **Tabela `budgets`**: Informações dos orçamentos
- **Tabela `transactions`**: Transações para cálculo de gastos
- **Tabela `categories`**: Dados das categorias associadas
- **Tabela `accounts`**: Informações das contas (quando aplicável)

### Páginas de Coleta
- **Página Orçamentos**: Criação e gestão de orçamentos
- **Página Transações**: Registro de receitas e despesas
- **Página Contas**: Gestão de contas bancárias
- **Integrações Externas**: Importação automática de dados

### Relacionamentos
- Orçamentos podem estar associados a múltiplas categorias
- Orçamentos podem estar associados a múltiplas contas
- Transações são filtradas por categoria e/ou conta conforme configuração

## Tratamento de Erros

### Cenários Contemplados
- **Erro na consulta de orçamentos**: Log + toast + array vazio
- **Erro na consulta de transações**: Log + continua para próximo orçamento
- **Dados inconsistentes**: Valores padrão e validações
- **Orçamentos sem categorias**: Tratamento gracioso

### Logs e Monitoramento
```typescript
console.log(`Carregados ${budgetStatusData.length} status de orçamentos`)
console.error('Erro do Supabase ao carregar orçamentos:', budgetsError)
```

## Otimizações de Performance

### Estratégias Implementadas
- **Limit de 20 orçamentos** para evitar sobrecarga
- **Consultas otimizadas** com filtros específicos
- **Cálculos locais** para filtros e ordenação
- **Renderização condicional** baseada no estado de loading
- **Memoização** com `useMemo` para dados filtrados

### Estados de Interface
- **Loading**: Skeleton com 3 placeholders animados
- **Vazio**: Mensagem motivacional para criar orçamentos
- **Filtrado vazio**: Orientação para ajustar filtros
- **Com dados**: Interface completa com todas as funcionalidades

## Benefícios para o Usuário

### Controle Financeiro
- **Monitoramento proativo** dos gastos
- **Alertas visuais** para orçamentos em risco
- **Visão consolidada** de todos os orçamentos

### Tomada de Decisão
- **Dados em tempo real** para decisões informadas
- **Comparação visual** entre orçamentos
- **Identificação rápida** de problemas financeiros

### Gestão Eficiente
- **Filtros personalizáveis** para análises específicas
- **Estatísticas resumidas** para visão geral
- **Interface intuitiva** com feedback visual claro

## Melhorias Futuras

### Funcionalidades Planejadas
- **Gráficos de tendência** por orçamento
- **Alertas personalizáveis** via notificações
- **Exportação de relatórios** em PDF/Excel
- **Comparação histórica** mês a mês
- **Metas de economia** por categoria
- **Integração com metas financeiras** do usuário

### Otimizações Técnicas
- **Cache inteligente** para consultas frequentes
- **Paginação server-side** para grandes volumes
- **WebSockets** para atualizações em tempo real
- **Compressão de dados** para melhor performance

---

**Nota**: Este componente é fundamental para o controle financeiro eficiente, proporcionando aos usuários uma ferramenta poderosa para monitorar e gerenciar seus orçamentos de forma proativa e intuitiva.