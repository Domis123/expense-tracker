'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import type { ExpenseWithShop } from '@/lib/types'

interface Props {
  expenses: ExpenseWithShop[]
  budget: { food: number; other: number }
}

export default function SpendingChart({ expenses, budget }: Props) {
  // Daily spending for bar chart
  const dailyData = useMemo(() => {
    const map: Record<string, { food: number; other: number }> = {}

    expenses.forEach(e => {
      const day = new Date(e.created_at).getDate().toString()
      if (!map[day]) map[day] = { food: 0, other: 0 }
      map[day][e.category] += Number(e.amount)
    })

    // Fill all days of the month
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const result = []
    for (let i = 1; i <= daysInMonth; i++) {
      const d = i.toString()
      result.push({
        day: d,
        food: map[d]?.food || 0,
        other: map[d]?.other || 0,
        total: (map[d]?.food || 0) + (map[d]?.other || 0),
      })
    }
    return result
  }, [expenses])

  // Per-shop breakdown for pie chart
  const shopData = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
      const name = e.shops?.name || 'Unknown'
      map[name] = (map[name] || 0) + Number(e.amount)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  // Per-person breakdown
  const personData = useMemo(() => {
    const map: Record<string, number> = {}
    expenses.forEach(e => {
      map[e.person] = (map[e.person] || 0) + Number(e.amount)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
  }, [expenses])

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const foodSpent = expenses.filter(e => e.category === 'food').reduce((s, e) => s + Number(e.amount), 0)
  const otherSpent = expenses.filter(e => e.category === 'other').reduce((s, e) => s + Number(e.amount), 0)
  const totalBudget = budget.food + budget.other

  const COLORS = ['#D4A574', '#7BA886', '#A8C5D6', '#B8A9C9', '#D4B96A', '#C47A6C', '#8C857C', '#E8E2DA']

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '8px 12px', boxShadow: 'var(--shadow-md)',
        fontSize: 12, fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Day {label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ color: p.fill, marginTop: 2 }}>
            {p.dataKey}: €{p.value.toFixed(2)}
          </div>
        ))}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
        <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.5 }}>○</div>
        <div style={{ fontSize: 14 }}>No data to show yet.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Overview cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{
          padding: 14, background: 'var(--bg-card)',
          border: '1px solid var(--border-light)', borderRadius: 6,
          gridColumn: '1 / -1',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            Total spent
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 32, letterSpacing: -1 }}>
              €{totalSpent.toFixed(2)}
            </span>
            {totalBudget > 0 && (
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                / €{totalBudget.toFixed(2)}
              </span>
            )}
          </div>
          {totalBudget > 0 && (
            <div style={{
              width: '100%', height: 6, background: 'var(--bg-warm)',
              borderRadius: 3, overflow: 'hidden', marginTop: 10,
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                background: totalSpent / totalBudget < 0.85 ? 'var(--green)' : 'var(--red)',
                transition: 'width 0.6s',
              }} />
            </div>
          )}
        </div>
        <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-tertiary)', marginBottom: 4 }}>Food</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: -0.5 }}>€{foodSpent.toFixed(2)}</div>
          {budget.food > 0 && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>of €{budget.food.toFixed(2)}</div>}
        </div>
        <div style={{ padding: 14, background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-tertiary)', marginBottom: 4 }}>Other</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: -0.5 }}>€{otherSpent.toFixed(2)}</div>
          {budget.other > 0 && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>of €{budget.other.toFixed(2)}</div>}
        </div>
      </div>

      {/* Daily bar chart */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '16px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 12, paddingLeft: 4 }}>
          Daily spending
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="day" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
              tickLine={false} axisLine={false}
              interval={4}
            />
            <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="food" stackId="a" fill="var(--green)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="other" stackId="a" fill="var(--accent)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }} /> Food
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }} /> Other
          </div>
        </div>
      </div>

      {/* Shop breakdown */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 6, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 12 }}>
          By shop
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 120, height: 120, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shopData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={30} outerRadius={55}
                  paddingAngle={2} strokeWidth={0}
                >
                  {shopData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {shopData.slice(0, 5).map((s, i) => (
              <div key={s.name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '4px 0', fontSize: 13,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 500, marginLeft: 8 }}>€{s.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Person breakdown */}
      {personData.length > 1 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)', marginBottom: 12 }}>
            By person
          </div>
          {personData.map((p, i) => {
            const pct = totalSpent > 0 ? (p.value / totalSpent) * 100 : 0
            return (
              <div key={p.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-serif)' }}>€{p.value.toFixed(2)} ({pct.toFixed(0)}%)</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--bg-warm)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${pct}%`,
                    background: i === 0 ? 'var(--accent)' : 'var(--pastel-blue, #A8C5D6)',
                    transition: 'width 0.6s',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}