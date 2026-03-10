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
      padding: 20,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{
          fontSize: 12, fontWeight: 600, textTransform: 'uppercase' as const,
          letterSpacing: 0.8, color: 'var(--text-secondary)'
        }}>
          Remaining
        </span>
        <div>
          <span style={{
            fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400,
            letterSpacing: -1, color: remaining < 0 ? 'var(--red)' : 'var(--text)'
          }}>
            €{remaining.toFixed(2)}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)', marginLeft: 6 }}>
            / €{budget.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{
        width: '100%', height: 6, background: 'var(--bg-warm)',
        borderRadius: 3, overflow: 'hidden', marginBottom: 10
      }}>
        <div style={{
          height: '100%', borderRadius: 3, width: `${pct}%`,
          background: barColor,
          transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s'
        }} />
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Spent <strong style={{ fontWeight: 600, color: 'var(--text)' }}>€{spent.toFixed(2)}</strong>
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Transactions <strong style={{ fontWeight: 600, color: 'var(--text)' }}>{transactionCount}</strong>
        </span>
      </div>
    </div>
  )
}