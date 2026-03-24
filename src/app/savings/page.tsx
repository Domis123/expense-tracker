'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { SavingsGoal, SavingsTransaction, SavingsGoalWithTotal } from '@/lib/types'

const GOAL_COLORS = ['#D4A574', '#7BA886', '#A8C5D6', '#B8A9C9', '#D4B96A', '#C47A6C']

export default function Savings() {
  const [goals, setGoals] = useState<SavingsGoalWithTotal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoalWithTotal | null>(null)
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showAddTx, setShowAddTx] = useState(false)
  const [loading, setLoading] = useState(true)

  // Add goal form
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalColor, setGoalColor] = useState(GOAL_COLORS[0])

  // Add transaction form
  const [txAmount, setTxAmount] = useState('')
  const [txNote, setTxNote] = useState('')
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>('deposit')
  const [submitting, setSubmitting] = useState(false)

  const fetchGoals = useCallback(async () => {
    const { data: goalsData } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at')

    if (goalsData) {
      const withTotals = await Promise.all(goalsData.map(async (g) => {
        const { data: txs } = await supabase
          .from('savings_transactions')
          .select('amount')
          .eq('goal_id', g.id)

        const total = txs?.reduce((s, t) => s + Number(t.amount), 0) || 0
        return { ...g, total_saved: total }
      }))
      setGoals(withTotals)
    }
    setLoading(false)
  }, [])

  const fetchTransactions = useCallback(async (goalId: string) => {
    const { data } = await supabase
      .from('savings_transactions')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false })

    if (data) setTransactions(data)
  }, [])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  useEffect(() => {
    if (selectedGoal) fetchTransactions(selectedGoal.id)
  }, [selectedGoal, fetchTransactions])

  const handleAddGoal = async () => {
    if (!goalName.trim() || !goalTarget || Number(goalTarget) <= 0) return
    setSubmitting(true)
    await supabase.from('savings_goals').insert({
      name: goalName.trim(),
      target_amount: parseFloat(goalTarget),
      color: goalColor,
    })
    setSubmitting(false)
    setGoalName('')
    setGoalTarget('')
    setGoalColor(GOAL_COLORS[(goals.length + 1) % GOAL_COLORS.length])
    setShowAddGoal(false)
    fetchGoals()
  }

  const handleAddTx = async () => {
    if (!selectedGoal || !txAmount || Number(txAmount) <= 0) return
    setSubmitting(true)
    const amount = txType === 'withdraw' ? -parseFloat(txAmount) : parseFloat(txAmount)
    await supabase.from('savings_transactions').insert({
      goal_id: selectedGoal.id,
      amount,
      note: txNote || null,
      date: new Date().toISOString().split('T')[0],
    })
    setSubmitting(false)
    setTxAmount('')
    setTxNote('')
    setTxType('deposit')
    setShowAddTx(false)
    fetchGoals()
    fetchTransactions(selectedGoal.id)
  }

  const handleDeleteGoal = async (id: string) => {
    await supabase.from('savings_goals').delete().eq('id', id)
    setSelectedGoal(null)
    fetchGoals()
  }

  const handleDeleteTx = async (id: string) => {
    await supabase.from('savings_transactions').delete().eq('id', id)
    if (selectedGoal) fetchTransactions(selectedGoal.id)
    fetchGoals()
  }

  const totalSaved = goals.reduce((s, g) => s + g.total_saved, 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)

  const toggleBtn = (active: boolean) => ({
    padding: '10px 16px',
    border: `1.5px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    borderRadius: 6,
    background: active ? 'var(--text)' : 'var(--bg-card)',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500 as const,
    cursor: 'pointer' as const, transition: 'all 0.15s',
    color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
    minHeight: 44,
  })

  // ─── Goal detail view ───
  if (selectedGoal) {
    const pct = Number(selectedGoal.target_amount) > 0
      ? Math.min((selectedGoal.total_saved / Number(selectedGoal.target_amount)) * 100, 100)
      : 0

    return (
      <>
        <div style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px))', padding: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px)) 20px 12px' }}>
          <button
            onClick={() => setSelectedGoal(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8,
              fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ← Back
          </button>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400 }}>
            {selectedGoal.name}
          </h1>
        </div>

        <div style={{ padding: '0 20px 140px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Progress card */}
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, padding: 20, boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1 }}>
                €{selectedGoal.total_saved.toFixed(2)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                / €{Number(selectedGoal.target_amount).toFixed(2)}
              </span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'var(--bg-warm)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 4, width: `${pct}%`,
                background: selectedGoal.color,
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{pct.toFixed(0)}% of goal</span>
          </div>

          {/* Add transaction button */}
          <button
            onClick={() => setShowAddTx(true)}
            style={{
              width: '100%', padding: 14, border: '1.5px dashed var(--border)',
              borderRadius: 6, background: 'var(--bg-card)',
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.15s', minHeight: 48,
            }}
          >
            + Add deposit or withdrawal
          </button>

          {/* Add transaction form */}
          {showAddTx && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button style={toggleBtn(txType === 'deposit')} onClick={() => setTxType('deposit')}>Deposit</button>
                <button style={toggleBtn(txType === 'withdraw')} onClick={() => setTxType('withdraw')}>Withdraw</button>
              </div>
              <input
                type="number" step="0.01" min="0" inputMode="decimal"
                placeholder="0.00" value={txAmount}
                onChange={e => setTxAmount(e.target.value)}
                style={{
                  width: '100%', padding: 14, border: '1.5px solid var(--border)',
                  borderRadius: 6, fontFamily: 'var(--font-serif)', fontSize: 24,
                  textAlign: 'center' as const, outline: 'none',
                  color: 'var(--text)', background: 'var(--bg)', marginBottom: 10,
                }}
              />
              <input
                placeholder="Note (optional)" value={txNote}
                onChange={e => setTxNote(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)',
                  borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 14,
                  outline: 'none', color: 'var(--text)', background: 'var(--bg)', marginBottom: 10,
                }}
              />
              <button
                onClick={handleAddTx}
                disabled={!txAmount || Number(txAmount) <= 0 || submitting}
                style={{
                  width: '100%', padding: 14, border: 'none', borderRadius: 6,
                  background: 'var(--text)', color: 'var(--bg-card)',
                  fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', opacity: txAmount && Number(txAmount) > 0 ? 1 : 0.4,
                  minHeight: 48,
                }}
              >
                {submitting ? 'Saving...' : txType === 'deposit' ? 'Add deposit' : 'Withdraw'}
              </button>
            </div>
          )}

          {/* Transaction history */}
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-tertiary)', paddingTop: 4 }}>
            History
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-tertiary)', fontSize: 14 }}>
              No transactions yet.
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} style={{
                display: 'flex', alignItems: 'center', padding: '14px 16px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 6, marginBottom: 6, minHeight: 56,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: Number(tx.amount) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {Number(tx.amount) >= 0 ? 'Deposit' : 'Withdrawal'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {tx.date}{tx.note ? ` · ${tx.note}` : ''}
                  </div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
                  color: Number(tx.amount) >= 0 ? 'var(--green)' : 'var(--red)',
                  marginLeft: 12,
                }}>
                  {Number(tx.amount) >= 0 ? '+' : ''}€{Math.abs(Number(tx.amount)).toFixed(2)}
                </span>
                <button
                  onClick={() => handleDeleteTx(tx.id)}
                  style={{
                    marginLeft: 8, width: 32, height: 32, borderRadius: 6,
                    border: '1px solid var(--border)', background: 'var(--bg)',
                    color: 'var(--text-tertiary)', fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}

          {/* Delete goal */}
          <button
            onClick={() => { if (confirm('Delete this goal and all its transactions?')) handleDeleteGoal(selectedGoal.id) }}
            style={{
              width: '100%', padding: 12, border: '1px solid var(--red)',
              borderRadius: 6, background: 'none',
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
              color: 'var(--red)', cursor: 'pointer', marginTop: 10,
            }}
          >
            Delete goal
          </button>
        </div>
      </>
    )
  }

  // ─── Goals list view ───
  return (
    <>
      <div style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px))', padding: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px)) 20px 12px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400 }}>
          Savings
        </h1>
      </div>

      <div style={{ padding: '0 20px 140px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Total overview */}
        {goals.length > 0 && (
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, padding: 20, boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Total saved
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: -1 }}>
                €{totalSaved.toFixed(2)}
              </span>
              {totalTarget > 0 && (
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  across {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Goals */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)', fontSize: 14 }}>
            Loading...
          </div>
        ) : goals.length === 0 && !showAddGoal ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.5 }}>○</div>
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              No savings goals yet.<br />Create one to start tracking.
            </div>
          </div>
        ) : (
          goals.map(g => {
            const pct = Number(g.target_amount) > 0
              ? Math.min((g.total_saved / Number(g.target_amount)) * 100, 100)
              : 0
            return (
              <div
                key={g.id}
                onClick={() => setSelectedGoal(g)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                  borderRadius: 6, padding: 16, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: g.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 500, fontSize: 15 }}>{g.name}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500 }}>
                    €{g.total_saved.toFixed(2)}
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg-warm)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${pct}%`,
                    background: g.color,
                    transition: 'width 0.6s',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>{pct.toFixed(0)}%</span>
                  <span>€{Number(g.target_amount).toFixed(2)} goal</span>
                </div>
              </div>
            )
          })
        )}

        {/* Add goal form */}
        {showAddGoal ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 10 }}>
              New goal
            </div>
            <input
              placeholder="Goal name (e.g. Vacation)" value={goalName}
              onChange={e => setGoalName(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)',
                borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 14,
                outline: 'none', color: 'var(--text)', background: 'var(--bg)', marginBottom: 10,
              }}
            />
            <input
              type="number" step="0.01" min="0" inputMode="decimal"
              placeholder="Target amount (€)" value={goalTarget}
              onChange={e => setGoalTarget(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)',
                borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 14,
                outline: 'none', color: 'var(--text)', background: 'var(--bg)', marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {GOAL_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setGoalColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 6, background: c,
                    border: goalColor === c ? '2px solid var(--text)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowAddGoal(false)}
                style={{
                  flex: 1, padding: 12, border: '1px solid var(--border)',
                  borderRadius: 6, background: 'var(--bg-card)',
                  fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-secondary)',
                  cursor: 'pointer', minHeight: 48,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!goalName.trim() || !goalTarget || Number(goalTarget) <= 0 || submitting}
                style={{
                  flex: 1, padding: 12, border: 'none', borderRadius: 6,
                  background: 'var(--text)', color: 'var(--bg-card)',
                  fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', minHeight: 48,
                  opacity: goalName.trim() && goalTarget && Number(goalTarget) > 0 ? 1 : 0.4,
                }}
              >
                {submitting ? 'Creating...' : 'Create goal'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setShowAddGoal(true); setGoalColor(GOAL_COLORS[goals.length % GOAL_COLORS.length]) }}
            style={{
              width: '100%', padding: 14, border: '1.5px dashed var(--border)',
              borderRadius: 6, background: 'var(--bg-card)',
              fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'all 0.15s', minHeight: 48,
            }}
          >
            + New savings goal
          </button>
        )}
      </div>
    </>
  )
}