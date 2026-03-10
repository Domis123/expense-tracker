'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getMonthStart, getMonthEnd, monthLabel, fmtDate, fmtTime } from '@/lib/dates'
import type { ExpenseWithShop } from '@/lib/types'

export default function History() {
  const [monthOffset, setMonthOffset] = useState(0)
  const [expenses, setExpenses] = useState<ExpenseWithShop[]>([])

  const monthStart = getMonthStart()
  monthStart.setMonth(monthStart.getMonth() + monthOffset)
  const monthEnd = getMonthEnd(monthStart)
  const isCurrentMonth = monthOffset === 0

  const fetchMonth = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*, shops(name)')
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString())
      .order('created_at', { ascending: false })

    if (data) setExpenses(data as ExpenseWithShop[])
  }, [monthOffset])

  useEffect(() => { fetchMonth() }, [fetchMonth])

  const foodSpent = expenses.filter(e => e.category === 'food').reduce((s, e) => s + Number(e.amount), 0)
  const otherSpent = expenses.filter(e => e.category === 'other').reduce((s, e) => s + Number(e.amount), 0)
  const totalSpent = foodSpent + otherSpent

  const grouped: Record<string, ExpenseWithShop[]> = {}
  expenses.forEach(e => {
    const key = fmtDate(e.created_at)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  return (
    <>
      <div style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px))', padding: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px)) 20px 12px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400 }}>
          History
        </h1>
      </div>

      <div style={{ padding: '0 20px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            style={{
              width: 44, height: 44, border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-secondary)',
            }}
          >
            ←
          </button>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500 }}>
            {isCurrentMonth ? 'This month' : monthLabel(monthStart)}
          </span>
          <button
            disabled={isCurrentMonth}
            onClick={() => setMonthOffset(o => o + 1)}
            style={{
              width: 44, height: 44, border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--bg-card)', cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--text-secondary)', opacity: isCurrentMonth ? 0.3 : 1,
            }}
          >
            →
          </button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Total', value: `€${totalSpent.toFixed(2)}` },
            { label: 'Food', value: `€${foodSpent.toFixed(2)}` },
            { label: 'Other', value: `€${otherSpent.toFixed(2)}` },
            { label: 'Entries', value: expenses.length.toString() },
          ].map(box => (
            <div key={box.label} style={{
              padding: 14, border: '1px solid var(--border-light)',
              borderRadius: 6, background: 'var(--bg-card)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.6, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                {box.label}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: -0.5 }}>
                {box.value}
              </div>
            </div>
          ))}
        </div>

        {/* Expenses */}
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.5 }}>○</div>
            <div style={{ fontSize: 14 }}>No expenses this month.</div>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-tertiary)', padding: '8px 0 4px' }}>
                {date}
              </div>
              {items.map(e => (
                <div key={e.id} style={{
                  display: 'flex', alignItems: 'center', padding: '14px 16px',
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                  borderRadius: 6, marginBottom: 6, minHeight: 56,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{e.shops?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {e.person}{e.note ? ` · ${e.note}` : ''}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, letterSpacing: -0.5, marginLeft: 12 }}>
                    €{Number(e.amount).toFixed(2)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 10, minWidth: 36, textAlign: 'right' as const }}>
                    {fmtTime(e.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  )
}