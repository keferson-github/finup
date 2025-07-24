import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export interface Budget {
  id: string
  user_id: string
  nome: string
  descricao: string | null
  valor_limite: number
  valor_gasto: number
  periodo: 'semanal' | 'mensal' | 'anual'
  data_inicio: string
  data_fim: string | null
  category_ids: string[] | null
  account_ids: string[] | null
  percentual_alerta: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface BudgetWithProgress extends Budget {
  progresso_percentual: number
  valor_restante: number
  esta_ultrapassado: boolean
  status: 'ok' | 'alerta' | 'ultrapassado'
  categoria_principal?: {
    nome: string
    cor: string
    icone: string
  }
}

export const useBudgets = () => {
  const { user } = useAuthContext()
  const [budgets, setBudgets] = useState<BudgetWithProgress[]>([])
  const [loading, setLoading] = useState(false)

  const loadBudgets = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })

      if (error) throw error

      // Calcular progresso para cada orçamento
      const budgetsWithProgress = await Promise.all(
        (data || []).map(async (budget) => {
          const gastoAtual = await calcularGastoOrcamento(budget)
          const progressoPercentual = budget.valor_limite > 0 
            ? Math.min((gastoAtual / budget.valor_limite) * 100, 100)
            : 0
          
          const valorRestante = Math.max(budget.valor_limite - gastoAtual, 0)
          const estaUltrapassado = gastoAtual > budget.valor_limite
          
          let status: 'ok' | 'alerta' | 'ultrapassado' = 'ok'
          if (estaUltrapassado) {
            status = 'ultrapassado'
          } else if (progressoPercentual >= budget.percentual_alerta) {
            status = 'alerta'
          }

          // Buscar categoria principal se houver
          let categoriaPrincipal = null
          if (budget.category_ids && budget.category_ids.length > 0) {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('nome, cor, icone')
              .eq('id', budget.category_ids[0])
              .single()
            
            if (categoryData) {
              categoriaPrincipal = categoryData
            }
          }

          return {
            ...budget,
            valor_gasto: gastoAtual,
            progresso_percentual: progressoPercentual,
            valor_restante: valorRestante,
            esta_ultrapassado: estaUltrapassado,
            status,
            categoria_principal: categoriaPrincipal
          }
        })
      )

      setBudgets(budgetsWithProgress)
    } catch (error: any) {
      console.error('Erro ao carregar orçamentos:', error)
      toast.error('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  const calcularGastoOrcamento = async (budget: Budget): Promise<number> => {
    if (!user) return 0

    try {
      let query = supabase
        .from('transactions')
        .select('valor')
        .eq('user_id', user.id)
        .eq('tipo', 'despesa')
        .eq('status', 'pago')
        .gte('data', budget.data_inicio)

      if (budget.data_fim) {
        query = query.lte('data', budget.data_fim)
      }

      if (budget.category_ids && budget.category_ids.length > 0) {
        query = query.in('category_id', budget.category_ids)
      }

      if (budget.account_ids && budget.account_ids.length > 0) {
        query = query.in('account_id', budget.account_ids)
      }

      const { data, error } = await query

      if (error) throw error

      return data?.reduce((total, transaction) => total + Number(transaction.valor), 0) || 0
    } catch (error) {
      console.error('Erro ao calcular gasto do orçamento:', error)
      return 0
    }
  }

  const createBudget = async (budget: {
    nome: string
    descricao?: string
    valor_limite: number
    periodo: 'semanal' | 'mensal' | 'anual'
    data_inicio: string
    data_fim?: string
    category_ids?: string[]
    account_ids?: string[]
    percentual_alerta?: number
  }) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: user.id,
          percentual_alerta: budget.percentual_alerta || 80
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Orçamento criado com sucesso!')
      await loadBudgets()
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao criar orçamento:', error)
      toast.error(error.message || 'Erro ao criar orçamento')
      return { success: false, error: error.message }
    }
  }

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      toast.success('Orçamento atualizado com sucesso!')
      await loadBudgets()
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao atualizar orçamento:', error)
      toast.error(error.message || 'Erro ao atualizar orçamento')
      return { success: false, error: error.message }
    }
  }

  const deleteBudget = async (id: string) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' }

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Orçamento excluído com sucesso!')
      await loadBudgets()
      return { success: true }
    } catch (error: any) {
      console.error('Erro ao excluir orçamento:', error)
      toast.error(error.message || 'Erro ao excluir orçamento')
      return { success: false, error: error.message }
    }
  }

  const getOrcamentosUltrapassados = () => {
    return budgets.filter(budget => budget.esta_ultrapassado)
  }

  const getOrcamentosEmAlerta = () => {
    return budgets.filter(budget => 
      !budget.esta_ultrapassado && 
      budget.progresso_percentual >= budget.percentual_alerta
    )
  }

  const getOrcamentosOk = () => {
    return budgets.filter(budget => budget.status === 'ok')
  }

  const getResumoGeral = () => {
    const totalOrcado = budgets.reduce((sum, budget) => sum + budget.valor_limite, 0)
    const totalGasto = budgets.reduce((sum, budget) => sum + budget.valor_gasto, 0)
    const totalRestante = budgets.reduce((sum, budget) => sum + budget.valor_restante, 0)
    
    return {
      totalOrcado,
      totalGasto,
      totalRestante,
      percentualGasto: totalOrcado > 0 ? (totalGasto / totalOrcado) * 100 : 0,
      quantidadeOrcamentos: budgets.length,
      orcamentosUltrapassados: getOrcamentosUltrapassados().length,
      orcamentosEmAlerta: getOrcamentosEmAlerta().length,
      orcamentosOk: getOrcamentosOk().length
    }
  }

  useEffect(() => {
    if (user) {
      loadBudgets()
    }
  }, [user])

  return {
    budgets,
    loading,
    loadBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    getOrcamentosUltrapassados,
    getOrcamentosEmAlerta,
    getOrcamentosOk,
    getResumoGeral
  }
}