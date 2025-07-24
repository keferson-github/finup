/*
  # Tradução do Sistema Financeiro para Português (pt-BR)

  1. Novas Tabelas
    - Todas as tabelas com comentários em português
    - Campos e relacionamentos traduzidos
    - Tipos customizados em português
    - Triggers e funções com nomes em português

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de segurança traduzidas
    - Validações em português

  3. Dados Padrão
    - Categorias padrão em português
    - Tipos de conta em português
    - Mensagens do sistema traduzidas
*/

-- Remover tabelas existentes se houver
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS import_logs CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS recurring_templates CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Remover tipos customizados
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS account_type CASCADE;

-- Criar tipos customizados em português
CREATE TYPE transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE account_type AS ENUM ('conta_corrente', 'poupanca', 'cartao_credito', 'dinheiro', 'investimento');

-- Tabela de perfis de usuário
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nome_completo text,
  avatar_url text,
  moeda text DEFAULT 'BRL',
  fuso_horario text DEFAULT 'America/Sao_Paulo',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de contas financeiras
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  tipo account_type DEFAULT 'conta_corrente',
  saldo decimal(15,2) DEFAULT 0,
  saldo_inicial decimal(15,2) DEFAULT 0,
  cor text DEFAULT '#3B82F6',
  descricao text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  tipo transaction_type NOT NULL,
  cor text DEFAULT '#3B82F6',
  icone text DEFAULT '📁',
  descricao text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de transações
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  valor decimal(15,2) NOT NULL,
  tipo transaction_type NOT NULL,
  status text DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'vencido')),
  data date NOT NULL,
  data_vencimento date,
  eh_parcelamento boolean DEFAULT false,
  numero_parcela integer DEFAULT 1,
  total_parcelas integer DEFAULT 1,
  transacao_pai_id uuid REFERENCES transactions(id) ON DELETE CASCADE,
  eh_recorrente boolean DEFAULT false,
  frequencia_recorrencia text CHECK (frequencia_recorrencia IN ('diario', 'semanal', 'mensal', 'anual')),
  data_fim_recorrencia date,
  template_recorrencia_id uuid,
  tags text[],
  observacoes text,
  url_anexo text,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de orçamentos
CREATE TABLE budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  descricao text,
  valor_limite decimal(15,2) NOT NULL,
  valor_gasto decimal(15,2) DEFAULT 0,
  periodo text DEFAULT 'mensal' CHECK (periodo IN ('semanal', 'mensal', 'anual')),
  data_inicio date NOT NULL,
  data_fim date,
  category_ids uuid[],
  account_ids uuid[],
  percentual_alerta integer DEFAULT 80 CHECK (percentual_alerta BETWEEN 1 AND 100),
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de templates de transações recorrentes
CREATE TABLE recurring_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descricao text,
  valor decimal(15,2) NOT NULL,
  tipo transaction_type NOT NULL,
  frequencia text NOT NULL CHECK (frequencia IN ('diario', 'semanal', 'mensal', 'anual')),
  data_inicio date NOT NULL,
  data_fim date,
  proxima_execucao date NOT NULL,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  titulo text NOT NULL,
  mensagem text NOT NULL,
  tipo text DEFAULT 'info',
  lida boolean DEFAULT false,
  url_acao text,
  transacao_relacionada_id uuid REFERENCES transactions(id) ON DELETE SET NULL,
  orcamento_relacionado_id uuid REFERENCES budgets(id) ON DELETE SET NULL,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de metas financeiras
CREATE TABLE financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  descricao text,
  valor_meta decimal(15,2) NOT NULL,
  valor_atual decimal(15,2) DEFAULT 0,
  data_meta date,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  conquistada boolean DEFAULT false,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Tabela de logs de importação
CREATE TABLE import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nome_arquivo text NOT NULL,
  total_linhas integer DEFAULT 0,
  linhas_sucesso integer DEFAULT 0,
  linhas_erro integer DEFAULT 0,
  erros text[],
  status text DEFAULT 'processando' CHECK (status IN ('processando', 'concluido', 'erro')),
  criado_em timestamptz DEFAULT now(),
  concluido_em timestamptz
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir apenas seu próprio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para accounts
CREATE POLICY "Usuários podem ver apenas suas próprias contas"
  ON accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias contas"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias contas"
  ON accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias contas"
  ON accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para categories
CREATE POLICY "Usuários podem ver apenas suas próprias categorias"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias categorias"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias categorias"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias categorias"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Usuários podem ver apenas suas próprias transações"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias transações"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias transações"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias transações"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para budgets
CREATE POLICY "Usuários podem ver apenas seus próprios orçamentos"
  ON budgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seus próprios orçamentos"
  ON budgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios orçamentos"
  ON budgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios orçamentos"
  ON budgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para recurring_templates
CREATE POLICY "Usuários podem ver apenas seus próprios templates"
  ON recurring_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seus próprios templates"
  ON recurring_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios templates"
  ON recurring_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas seus próprios templates"
  ON recurring_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para notifications
CREATE POLICY "Usuários podem ver apenas suas próprias notificações"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias notificações"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias notificações"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias notificações"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para financial_goals
CREATE POLICY "Usuários podem ver apenas suas próprias metas"
  ON financial_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas suas próprias metas"
  ON financial_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas suas próprias metas"
  ON financial_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir apenas suas próprias metas"
  ON financial_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas RLS para import_logs
CREATE POLICY "Usuários podem ver apenas seus próprios logs"
  ON import_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir apenas seus próprios logs"
  ON import_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar apenas seus próprios logs"
  ON import_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_data ON transactions(data);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_lida ON notifications(lida);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, nome_completo)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS trigger AS $$
BEGIN
  -- Categorias de receita
  INSERT INTO categories (user_id, nome, tipo, cor, icone) VALUES
    (new.id, 'Salário', 'receita', '#10B981', '💰'),
    (new.id, 'Freelance', 'receita', '#059669', '💻'),
    (new.id, 'Investimentos', 'receita', '#047857', '📈'),
    (new.id, 'Vendas', 'receita', '#065F46', '🛒'),
    (new.id, 'Outros', 'receita', '#064E3B', '💵');

  -- Categorias de despesa
  INSERT INTO categories (user_id, nome, tipo, cor, icone) VALUES
    (new.id, 'Alimentação', 'despesa', '#EF4444', '🍔'),
    (new.id, 'Transporte', 'despesa', '#DC2626', '🚗'),
    (new.id, 'Moradia', 'despesa', '#B91C1C', '🏠'),
    (new.id, 'Saúde', 'despesa', '#991B1B', '💊'),
    (new.id, 'Educação', 'despesa', '#7F1D1D', '🎓'),
    (new.id, 'Lazer', 'despesa', '#F59E0B', '🎮'),
    (new.id, 'Compras', 'despesa', '#D97706', '🛍️'),
    (new.id, 'Contas', 'despesa', '#B45309', '📄'),
    (new.id, 'Outros', 'despesa', '#92400E', '📦');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar categorias padrão
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  new.atualizado_em = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_templates_updated_at
  BEFORE UPDATE ON recurring_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();