'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getMonday, getSunday, weekLabel, toISODate } from '@/lib/dates'
import type { ExpenseWithShop } from '@/lib/types'
import BudgetCard from '@/components/BudgetCard'
import ExpenseList from '@/components/ExpenseList'
import AddExpenseModal from '@/components/AddExpenseModal'

export default function Home() {
  const [expenses, setExpenses] = useState<ExpenseWithShop[]>([])
  const [category, setCategory] = useState<'food' | 'other'>('food')
  const [budget, setBudget] = useState(0)
  const [showAdd, setShowAdd] = useState(false)

  const monday = getMonday()
  const sunday = getSunday(monday)

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*, shops(name)')
      .gte('created_at', monday.toISOString())
      .lte('created_at', sunday.toISOString())
      .order('created_at', { ascending: false })

    if (data) setExpenses(data as ExpenseWithShop[])
  }, [])

  const fetchBudget = useCallback(async () => {
    const { data } = await supabase
      .from('budgets')
      .select('amount')
      .eq('category', category)
      .eq('week_start', toISODate(monday))
      .single()

    if (data) {
      setBudget(Number(data.amount))
    } else {
      const { data: prev } = await supabase
        .from('budgets')
        .select('amount')
        .eq('category', category)
        .order('week_start', { ascending: false })
        .limit(1)
        .single()

      setBudget(prev ? Number(prev.amount) : 0)
    }
  }, [category])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])
  useEffect(() => { fetchBudget() }, [fetchBudget])

  useEffect(() => {
    const channel = supabase
      .channel('expenses-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        fetchExpenses()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchExpenses])

  const catExpenses = expenses.filter(e => e.category === category)
  const spent = catExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  const handleDelete = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id)
    fetchExpenses()
  }

  return (
    <>
      {/* Header */}
      <div style={{
        paddingTop: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px))',
        padding: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px)) 20px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: -0.5 }}>
          Expenses
        </h1>
        <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>
          {weekLabel(monday)}
        </span>
      </div>

      <div style={{ padding: '0 20px 140px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Category toggle */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['food', 'other'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '10px 20px',
                border: `1.5px solid ${category === cat ? 'var(--text)' : 'var(--border)'}`,
                borderRadius: 6,
                background: category === cat ? 'var(--text)' : 'var(--bg-card)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 600,
                color: category === cat ? 'var(--bg-card)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
                minHeight: 44,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Budget card */}
        <BudgetCard spent={spent} budget={budget} category={category} transactionCount={catExpenses.length} />

        {/* Divider label */}
        {expenses.length > 0 && (
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 0.8, color: 'var(--text-tertiary)', paddingTop: 4,
          }}>
            This week
          </div>
        )}

        {/* Expense list */}
        <ExpenseList expenses={expenses} onDelete={handleDelete} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          width: 56, height: 56, borderRadius: 6,
          background: 'var(--text)', color: 'var(--bg)',
          border: 'none', fontSize: 28, cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99,
        }}
      >
        +
      </button>

      <AddExpenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={fetchExpenses}
      />
    </>
  )
}