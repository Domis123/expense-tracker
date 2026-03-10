'use client'

interface BudgetCardProps {
  spent: number
  budget: number
  category: string
  transactionCount: number
}

export default function BudgetCard({ spent, budget, category, transactionCount }: BudgetCardProps) {
  const remaining = budget - spent
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const barColor = pct < 60 ? 'var(--green)' : pct < 85 ? 'var(--yellow)' : 'var(--red)'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      padding: '20px 20px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Remaining amount */}
      <div style={{ marginBottom: 4 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: 0.8, color: 'var(--text-secondary)',
        }}>
          Remaining
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
        <span style={{
          fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400,
          letterSpacing: -1.5, lineHeight: 1,
          color: remaining < 0 ? 'var(--red)' : 'var(--text)',
        }}>
          €{Math.abs(remaining).toFixed(2)}
        </span>
        {remaining < 0 && (
          <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 500 }}>over</span>
        )}
        <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          / €{budget.toFixed(2)}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: 8, background: 'var(--bg-warm)',
        borderRadius: 4, overflow: 'hidden', marginBottom: 14,
      }}>
        <div style={{
          height: '100%', borderRadius: 4, width: `${pct}%`,
          background: barColor,
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s',
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Spent <strong style={{ fontWeight: 600, color: 'var(--text)' }}>€{spent.toFixed(2)}</strong>
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {transactionCount} {transactionCount === 1 ? 'purchase' : 'purchases'}
        </span>
      </div>
    </div>
  )
}