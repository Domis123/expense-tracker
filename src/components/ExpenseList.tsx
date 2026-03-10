'use client'

import { fmtDate, fmtTime } from '@/lib/dates'
import type { ExpenseWithShop } from '@/lib/types'

interface Props {
  expenses: ExpenseWithShop[]
  onDelete?: (id: string) => void
}

export default function ExpenseList({ expenses, onDelete }: Props) {
  const grouped: Record<string, ExpenseWithShop[]> = {}
  expenses.forEach(e => {
    const key = fmtDate(e.created_at)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(e)
  })

  if (Object.keys(grouped).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>○</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          No expenses yet.<br />Tap + to add one.
        </div>
      </div>
    )
  }

  return (
    <div>
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <div style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const,
            letterSpacing: 0.8, color: 'var(--text-tertiary)',
            padding: '8px 0 4px'
          }}>
            {date}
          </div>
          {items.map(e => (
            <div
              key={e.id}
              className="expense-row"
              style={{
                display: 'flex', alignItems: 'center',
                padding: '14px 16px', background: 'var(--bg-card)',
                border: '1px solid var(--border-light)', borderRadius: 6,
                marginBottom: 6, position: 'relative', cursor: 'default'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {e.shops?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                  {e.person}{e.note ? ` · ${e.note}` : ''}
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-serif)', fontSize: 18,
                fontWeight: 500, letterSpacing: -0.5
              }}>
                €{Number(e.amount).toFixed(2)}
              </span>
              <span style={{
                fontSize: 10, color: 'var(--text-tertiary)',
                marginLeft: 12, minWidth: 40, textAlign: 'right' as const
              }}>
                {fmtTime(e.created_at)}
              </span>
              {onDelete && (
                <button
                  onClick={() => onDelete(e.id)}
                  className="delete-btn"
                  style={{
                    position: 'absolute', right: -8, top: -8,
                    width: 22, height: 22, borderRadius: '50%',
                    border: '1px solid var(--border)', background: 'var(--bg-card)',
                    color: 'var(--red)', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)', lineHeight: 1,
                    opacity: 0, transition: 'opacity 0.15s'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
      <style>{`
        .expense-row:hover .delete-btn {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  )
}