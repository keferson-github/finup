export enum TransactionType {
  RECEITA = 'receita',
  DESPESA = 'despesa',
}

export enum TransactionStatus {
  PAGO = 'pago',
  PENDENTE = 'pendente',
  VENCIDO = 'vencido',
}

export enum RecurrenceFrequency {
  DIARIO = 'diario',
  SEMANAL = 'semanal',
  MENSAL = 'mensal',
  ANUAL = 'anual',
}

export enum AccountType {
  CONTA_CORRENTE = 'conta_corrente',
  POUPANCA = 'poupanca',
  CARTAO_CREDITO = 'cartao_credito',
  DINHEIRO = 'dinheiro',
  INVESTIMENTO = 'investimento',
}