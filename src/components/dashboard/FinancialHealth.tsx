import React, { useMemo } from 'react';
import { DashboardSummary, EvolutionData, BudgetStatus } from '../../hooks/useDashboard';
import { Heart, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface FinancialHealthProps {
  summary: DashboardSummary | null;
  evolution: EvolutionData[];
  budgetStatus: BudgetStatus[];
  loading: boolean;
}

export const FinancialHealth: React.FC<FinancialHealthProps> = ({
  summary,
  evolution,
  budgetStatus,
  loading,
}) => {
  // Calcular o score de saúde financeira
  const { score, status, indicators } = useMemo(() => {
    if (!summary || evolution.length === 0) {
      return { score: 0, status: 'indisponível', indicators: [] };
    }

    let totalScore = 0;
    const indicators = [];

    // Indicador 1: Saldo positivo no mês atual (25 pontos)
    const hasSaldoPositivo = summary.saldoMesAtual > 0;
    const saldoScore = hasSaldoPositivo ? 25 : 0;
    totalScore += saldoScore;
    indicators.push({
      name: 'Saldo positivo',
      value: hasSaldoPositivo,
      score: saldoScore,
      icon: hasSaldoPositivo ? TrendingUp : TrendingDown,
      color: hasSaldoPositivo ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg',
    });

    // Indicador 2: Receitas > Despesas nos últimos 3 meses (25 pontos)
    const lastThreeMonths = evolution.slice(-3);
    const positiveMonths = lastThreeMonths.filter(month => month.receitas > month.despesas).length;
    const consistencyScore = Math.round((positiveMonths / 3) * 25);
    totalScore += consistencyScore;
    indicators.push({
      name: 'Consistência',
      value: `${positiveMonths}/3 meses`,
      score: consistencyScore,
      icon: positiveMonths >= 2 ? TrendingUp : TrendingDown,
      color: positiveMonths >= 2 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg',
    });

    // Indicador 3: Taxa de economia (Saldo / Receita) > 20% (25 pontos)
    const savingsRate = summary.totalReceitas > 0 ? (summary.saldoMesAtual / summary.totalReceitas) * 100 : 0;
    const savingsScore = savingsRate >= 20 ? 25 : Math.round((savingsRate / 20) * 25);
    totalScore += savingsScore;
    indicators.push({
      name: 'Taxa de economia',
      value: `${savingsRate.toFixed(1)}%`,
      score: savingsScore,
      icon: savingsRate >= 20 ? TrendingUp : TrendingDown,
      color: savingsRate >= 20 ? 'text-success-fg dark:text-success-dark-fg' : 'text-danger-fg dark:text-danger-dark-fg',
    });

    // Indicador 4: Orçamentos sob controle (25 pontos)
    const totalBudgets = budgetStatus.length;
    const controlledBudgets = budgetStatus.filter(budget => budget.status !== 'ultrapassado').length;
    const budgetScore = totalBudgets > 0 ? Math.round((controlledBudgets / totalBudgets) * 25) : 25;
    totalScore += budgetScore;
    indicators.push({
      name: 'Orçamentos',
      value: totalBudgets > 0 ? `${controlledBudgets}/${totalBudgets} controlados` : 'N/A',
      score: budgetScore,
      icon: controlledBudgets === totalBudgets ? TrendingUp : AlertTriangle,
      color: controlledBudgets === totalBudgets ? 'text-success-fg dark:text-success-dark-fg' : 'text-attention-fg dark:text-attention-dark-fg',
    });

    // Determinar status baseado no score total
    let status = 'Excelente';
    if (totalScore < 40) status = 'Crítico';
    else if (totalScore < 60) status = 'Atenção';
    else if (totalScore < 80) status = 'Bom';

    return { score: totalScore, status, indicators };
  }, [summary, evolution, budgetStatus]);

  // Determinar a cor do score
  const getScoreColor = () => {
    if (score >= 80) return 'text-success-fg dark:text-success-dark-fg';
    if (score >= 60) return 'text-attention-fg dark:text-attention-dark-fg';
    if (score >= 40) return 'text-warning-fg dark:text-warning-dark-fg';
    return 'text-danger-fg dark:text-danger-dark-fg';
  };

  // Determinar a cor de fundo do ícone
  const getScoreBackgroundColor = () => {
    if (score >= 80) return 'bg-success-subtle dark:bg-success-dark-subtle';
    if (score >= 60) return 'bg-attention-subtle dark:bg-attention-dark-subtle';
    if (score >= 40) return 'bg-warning-subtle dark:bg-warning-dark-subtle';
    return 'bg-danger-subtle dark:bg-danger-dark-subtle';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-neutral-muted dark:bg-neutral-dark-muted rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-fg-default dark:text-fg-dark-default">Saúde Financeira</h3>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-3xl font-bold mt-2 mb-1 flex items-center gap-2">
              <span className={getScoreColor()}>{score}</span>
              <span className="text-sm text-fg-muted dark:text-fg-dark-muted">/100</span>
            </p>
            <p className={`text-sm font-medium ${getScoreColor()}`}>{status}</p>
          </div>
          <div className={`w-12 h-12 ${getScoreBackgroundColor()} rounded-lg flex items-center justify-center`}>
            <Heart className={`h-6 w-6 ${getScoreColor()}`} />
          </div>
        </div>

        <div className="space-y-3">
          {indicators.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <indicator.icon className={`h-4 w-4 ${indicator.color}`} />
                <span className="text-sm text-fg-default dark:text-fg-dark-default">{indicator.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-fg-muted dark:text-fg-dark-muted">{indicator.value}</span>
                <span className={`text-xs font-medium ${indicator.color}`}>{indicator.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};