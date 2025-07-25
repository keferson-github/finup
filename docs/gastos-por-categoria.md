# Sistema de Gastos por Categoria - FinUp

## 📊 Visão Geral

O card **"Gastos por Categoria"** é um componente fundamental do dashboard do FinUp que proporciona aos usuários uma **visão clara e segmentada de onde está gastando seu dinheiro**, permitindo identificar áreas com maiores despesas e tomar decisões mais conscientes sobre o orçamento mensal.

## 🔄 Como Funciona

### 1. **Coleta de Dados**
O sistema coleta dados de transações do usuário através de:
- **Fonte Principal**: Transações reais do banco de dados Supabase
- **Fonte Secundária**: Dados de exemplo para demonstração (quando não há dados reais)

### 2. **Processamento dos Dados**
O hook `useDashboard.ts` processa as informações através da função `loadCategorySummary()`:

```typescript
// Busca transações do mês atual
const { data: transactions } = await supabase
  .from('transactions')
  .select(`
    valor,
    tipo,
    categories(nome, cor, icone)
  `)
  .eq('user_id', user.id)
  .eq('status', 'pago')
  .gte('data', monthStart)
  .lte('data', monthEnd)
  .not('category_id', 'is', null)
```

### 3. **Agregação por Categoria**
Os dados são agrupados por categoria, calculando:
- **Total gasto** por categoria
- **Porcentagem** de cada categoria em relação ao total
- **Informações visuais** (cor e ícone) de cada categoria

### 4. **Exibição Visual**
O componente `CategoryChart.tsx` renderiza:
- **Gráfico de Pizza**: Mostra a distribuição visual dos gastos
- **Lista Lateral**: Detalha cada categoria com valores e porcentagens
- **Tooltips Interativos**: Informações detalhadas ao passar o mouse

## 📁 Estrutura de Arquivos

### Componentes Principais
```
src/
├── components/dashboard/
│   └── CategoryChart.tsx          # Componente visual do gráfico
├── hooks/
│   └── useDashboard.ts           # Lógica de coleta e processamento
└── contexts/
    └── DashboardContext.tsx      # Contexto global do dashboard
```

### Fluxo de Dados
```
Supabase Database → useDashboard Hook → DashboardContext → CategoryChart Component
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Coleta automática de transações do mês atual
- [x] Agrupamento por categoria
- [x] Cálculo de porcentagens
- [x] Gráfico de pizza interativo
- [x] Lista detalhada de categorias
- [x] Tratamento de estados vazios
- [x] Tratamento de erros com mensagens apropriadas
- [x] Responsividade mobile
- [x] Tema claro/escuro

### 🔄 Dados em Tempo Real
O sistema atualiza automaticamente quando:
- Novas transações são adicionadas
- Transações existentes são editadas
- Status de transações é alterado
- Categorias são modificadas

## 📊 Tipos de Dados

### Interface CategorySummary
```typescript
export interface CategorySummary {
  categoria: string      // Nome da categoria
  cor: string           // Cor hexadecimal para visualização
  icone: string         // Emoji representativo
  total: number         // Valor total gasto na categoria
  porcentagem: number   // Porcentagem em relação ao total
  tipo: 'receita' | 'despesa'  // Tipo da categoria
}
```

## Tipos de Dados

O sistema trabalha com as seguintes estruturas:

### CategorySummary
```typescript
interface CategorySummary {
  categoria: string      // Nome da categoria
  cor: string           // Cor hexadecimal
  icone: string         // Emoji do ícone
  total: number         // Valor total gasto
  porcentagem: number   // Percentual do total
  tipo: 'receita' | 'despesa'
}
```

### Fonte dos Dados
- **Transações**: Tabela `transactions` no Supabase
- **Categorias**: Tabela `categories` no Supabase
- **Período**: Mês atual (início ao fim do mês)
- **Status**: Apenas transações com status 'pago'

## 🔧 Configuração e Personalização

### Adicionando Novas Categorias
1. Acesse a página de Categorias
2. Clique em "Nova Categoria"
3. Defina nome, tipo, cor e ícone
4. A categoria aparecerá automaticamente no gráfico

### Modificando Cores e Ícones
As cores e ícones podem ser personalizados:
- **Cores**: Formato hexadecimal (#FF6B6B)
- **Ícones**: Emojis Unicode (🍽️, 🚗, 🏠)

## 📱 Responsividade

O componente é totalmente responsivo:
- **Desktop**: Gráfico e lista lado a lado
- **Mobile**: Gráfico acima, lista abaixo
- **Tablet**: Layout adaptativo

## 🎯 Benefícios para o Usuário

### 📈 Análise Financeira
- **Identificação de padrões** de gastos
- **Controle de orçamento** por categoria
- **Tomada de decisões** baseada em dados

### 🎨 Experiência Visual
- **Interface intuitiva** e colorida
- **Gráficos interativos** com tooltips
- **Informações claras** e organizadas

### ⚡ Performance
- **Carregamento rápido** com dados otimizados
- **Atualização em tempo real**
- **Fallback automático** para dados de exemplo

## 🔮 Futuras Melhorias

### Planejadas
- [ ] Filtros por período (semana, trimestre, ano)
- [ ] Comparação entre meses
- [ ] Metas de gastos por categoria
- [ ] Alertas de orçamento
- [ ] Exportação de relatórios
- [ ] Subcategorias
- [ ] Análise de tendências

## 🛠️ Manutenção

### Monitoramento
- Logs automáticos em caso de erro
- Fallback para dados de exemplo
- Validação de dados de entrada

### Atualizações
- Dados atualizados automaticamente
- Cache inteligente para performance
- Sincronização com banco de dados

---

**Nota**: Este sistema é fundamental para o projeto FinUp, proporcionando aos usuários uma visão clara e segmentada de seus gastos, permitindo melhor controle financeiro e tomada de decisões conscientes.