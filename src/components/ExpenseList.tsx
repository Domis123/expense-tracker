'use client'

import { fmtDate, fmtTime } from '@/lib/dates'
import type { ExpenseWithShop } from '@/lib/types'
import { useState } from 'react'

interface Props {
  expenses: ExpenseWithShop[]
  onDelete?: (id: string) => void
}

export default function ExpenseList({ expenses, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const grouped: Record<string, ExpenseWithShop[]> = {}
  expenses.forEach(e => {
    const key = fmtDate(e.created_at)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  if (Object.keys(grouped).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.5 }}>○</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          No expenses yet.<br />Tap + to add one.
        </div>
      </div>
    )
  }

  const handleTapDelete = (id: string) => {
    if (confirmId === id) {
      onDelete?.(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  return (
    <div>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: 0.8, color: 'var(--text-tertiary)',
            padding: '6px 0 4px',
          }}>
            {date}
          </div>
          {items.map(e => (
            <div
              key={e.id}
              style={{
                display: 'flex', alignItems: 'center',
                padding: '14px 16px',
                background: confirmId === e.id ? 'var(--red-light)' : 'var(--bg-card)',
                border: `1px solid ${confirmId === e.id ? 'var(--red)' : 'var(--border-light)'}`,
                borderRadius: 6, marginBottom: 6,
                transition: 'all 0.2s',
                minHeight: 56,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>
                  {e.shops?.name || 'Unknown'}
                </div>
                <div style={{
                  fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {e.person}{e.note ? ` · ${e.note}` : ''}
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: 18,
                fontWeight: 500, letterSpacing: -0.5,
                marginLeft: 12, whiteSpace: 'nowrap',
              }}>
                €{Number(e.amount).toFixed(2)}
              </span>
              <span style={{
                fontSize: 10, color: 'var(--text-tertiary)',
                marginLeft: 10, minWidth: 36, textAlign: 'right' as const,
              }}>
                {fmtTime(e.created_at)}
              </span>
              {onDelete && (
                <button
                  onClick={() => handleTapDelete(e.id)}
                  style={{
                    marginLeft: 8, width: 32, height: 32,
                    borderRadius: 6, border: '1px solid var(--border)',
                    background: confirmId === e.id ? 'var(--red)' : 'var(--bg)',
                    color: confirmId === e.id ? 'white' : 'var(--text-tertiary)',
                    fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {confirmId === e.id ? '✓' : '×'}
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}