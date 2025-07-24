import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { useAccounts } from './useAccounts'
import { useCategories } from './useCategories'
import toast from 'react-hot-toast'

interface ImportResult {
  total_rows: number
  successful_rows: number
  failed_rows: number
  errors: string[]
}

export const useDataImport = () => {
  const { user } = useAuthContext()
  const { accounts } = useAccounts()
  const { categories } = useCategories()
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index]
        })
        rows.push(row)
      }
    }

    return rows
  }

  const mapRowToTransaction = (row: any) => {
    // Try to map common CSV formats
    const possibleTitleFields = ['title', 'description', 'memo', 'descricao', 'titulo']
    const possibleAmountFields = ['amount', 'value', 'valor', 'quantia']
    const possibleDateFields = ['date', 'data', 'transaction_date']
    const possibleTypeFields = ['type', 'tipo', 'transaction_type']

    const title = possibleTitleFields.find(field => row[field])
    const amount = possibleAmountFields.find(field => row[field])
    const date = possibleDateFields.find(field => row[field])
    const type = possibleTypeFields.find(field => row[field])

    if (!title || !amount || !date) {
      throw new Error('Required fields missing: title, amount, date')
    }

    // Parse amount (handle different formats)
    let parsedAmount = parseFloat(row[amount].replace(/[^\d.-]/g, ''))
    if (isNaN(parsedAmount)) {
      throw new Error('Invalid amount format')
    }

    // Parse date (handle different formats)
    let parsedDate: Date
    try {
      // Try different date formats
      const dateStr = row[date]
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          // Assume DD/MM/YYYY or MM/DD/YYYY
          parsedDate = new Date(parts[2], parts[1] - 1, parts[0])
          if (isNaN(parsedDate.getTime())) {
            parsedDate = new Date(parts[2], parts[0] - 1, parts[1])
          }
        } else {
          throw new Error('Invalid date format')
        }
      } else {
        parsedDate = new Date(dateStr)
      }
      
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date')
      }
    } catch {
      throw new Error('Invalid date format')
    }

    // Determine transaction type
    let transactionType: 'income' | 'expense' = 'expense'
    if (type && row[type]) {
      const typeValue = row[type].toLowerCase()
      if (typeValue.includes('income') || typeValue.includes('receita') || typeValue.includes('entrada')) {
        transactionType = 'income'
      }
    } else if (parsedAmount > 0) {
      transactionType = 'income'
    } else {
      parsedAmount = Math.abs(parsedAmount)
      transactionType = 'expense'
    }

    // Try to match category
    let categoryId = null
    const categoryField = row['category'] || row['categoria']
    if (categoryField) {
      const matchedCategory = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryField.toLowerCase()) &&
        cat.type === transactionType
      )
      if (matchedCategory) {
        categoryId = matchedCategory.id
      }
    }

    // Use first account if not specified
    const accountId = accounts[0]?.id
    if (!accountId) {
      throw new Error('No accounts available')
    }

    return {
      title: row[title],
      amount: parsedAmount,
      type: transactionType,
      date: parsedDate.toISOString().split('T')[0],
      account_id: accountId,
      category_id: categoryId,
      status: 'paid' as const,
      description: row['description'] || row['descricao'] || null
    }
  }

  const importFromCSV = async (file: File) => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    if (accounts.length === 0) {
      toast.error('Please create at least one account before importing')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      // Log import start
      const { data: importLog, error: logError } = await supabase
        .from('import_logs')
        .insert({
          user_id: user.id,
          filename: file.name,
          status: 'processing'
        })
        .select()
        .single()

      if (logError) throw logError

      // Read file
      const csvText = await file.text()
      const rows = parseCSV(csvText)

      if (rows.length === 0) {
        throw new Error('No data found in CSV file')
      }

      const result: ImportResult = {
        total_rows: rows.length,
        successful_rows: 0,
        failed_rows: 0,
        errors: []
      }

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        try {
          const transaction = mapRowToTransaction(rows[i])
          
          const { error } = await supabase
            .from('transactions')
            .insert({
              ...transaction,
              user_id: user.id
            })

          if (error) throw error
          
          result.successful_rows++
        } catch (error: any) {
          result.failed_rows++
          result.errors.push(`Row ${i + 1}: ${error.message}`)
        }
      }

      // Update import log
      await supabase
        .from('import_logs')
        .update({
          total_rows: result.total_rows,
          successful_rows: result.successful_rows,
          failed_rows: result.failed_rows,
          errors: result.errors,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', importLog.id)

      setImportResult(result)

      if (result.successful_rows > 0) {
        toast.success(`Successfully imported ${result.successful_rows} transactions`)
      }

      if (result.failed_rows > 0) {
        toast.error(`Failed to import ${result.failed_rows} transactions`)
      }

    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Failed to import data')
    } finally {
      setImporting(false)
    }
  }

  const getImportHistory = async () => {
    if (!user) return []

    try {
      const { data, error } = await supabase
        .from('import_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error loading import history:', error)
      return []
    }
  }

  return {
    importing,
    importResult,
    importFromCSV,
    getImportHistory
  }
}