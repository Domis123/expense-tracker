'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getMonday, getSunday, weekLabel, fmtDate, fmtTime } from '@/lib/dates'
import type { ExpenseWithShop } from '@/lib/types'

export default function History() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [expenses, setExpenses] = useState<ExpenseWithShop[]>([])

  const monday = getMonday()
  monday.setDate(monday.getDate() + weekOffset * 7)
  const sunday = getSunday(monday)
  const isCurrentWeek = weekOffset === 0

  const fetchWeek = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*, shops(name)')
      .gte('created_at', monday.toISOString())
      .lte('created_at', sunday.toISOString())
      .order('created_at', { ascending: false })

    if (data) setExpenses(data as ExpenseWithShop[])
  }, [weekOffset])

  useEffect(() => { fetchWeek() }, [fetchWeek])

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
        {/* Week nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            style={{
              width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--bg-card)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--text-secondary)',
            }}
          >
            ←
          </button>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>
            {isCurrentWeek ? 'This week' : weekLabel(monday)}
          </span>
          <button
            disabled={isCurrentWeek}
            onClick={() => setWeekOffset(o => o + 1)}
            style={{
              width: 36, height: 36, border: '1px solid var(--border)', borderRadius: 6,
              background: 'var(--bg-card)', cursor: isCurrentWeek ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: 'var(--text-secondary)', opacity: isCurrentWeek ? 0.3 : 1,
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
            <div style={{ fontSize: 32, marginBottom: 12 }}>○</div>
            <div style={{ fontSize: 14 }}>No expenses this week.</div>
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
                  borderRadius: 6, marginBottom: 6,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{e.shops?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                      {e.person}{e.note ? ` · ${e.note}` : ''}
                    </div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, letterSpacing: -0.5 }}>
                    €{Number(e.amount).toFixed(2)}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 12, minWidth: 40, textAlign: 'right' as const }}>
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