'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getMonthStart, toISODate } from '@/lib/dates'
import type { Shop } from '@/lib/types'

export default function Settings() {
  const [shops, setShops] = useState<Shop[]>([])
  const [foodBudget, setFoodBudget] = useState('')
  const [otherBudget, setOtherBudget] = useState('')
  const [newShop, setNewShop] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('shops').select('*').order('name').then(({ data }) => {
      if (data) setShops(data)
    })

    const fetchBudget = async (cat: string, setter: (v: string) => void) => {
      const { data } = await supabase
        .from('budgets')
        .select('amount')
        .eq('category', cat)
        .order('week_start', { ascending: false })
        .limit(1)
        .single()
      if (data) setter(data.amount.toString())
    }
    fetchBudget('food', setFoodBudget)
    fetchBudget('other', setOtherBudget)
  }, [])

  const saveBudget = async (cat: 'food' | 'other', val: string) => {
    const amount = parseFloat(val)
    if (isNaN(amount) || amount < 0) return
    const week_start = toISODate(getMonthStart())

    await supabase
      .from('budgets')
      .upsert({ category: cat, amount, week_start }, { onConflict: 'week_start,category' })

    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const addShop = async () => {
    if (!newShop.trim()) return
    const { data } = await supabase.from('shops').insert({ name: newShop.trim() }).select().single()
    if (data) {
      setShops(prev => [...prev, data])
      setNewShop('')
    }
  }

  const removeShop = async (id: string) => {
    await supabase.from('shops').delete().eq('id', id)
    setShops(prev => prev.filter(s => s.id !== id))
  }

  return (
    <>
      <div style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px))', padding: 'max(52px, calc(env(safe-area-inset-top, 0px) + 16px)) 20px 12px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400 }}>
          Settings
        </h1>
      </div>

      <div style={{ padding: '0 20px 120px', display: 'flex', flexDirection: 'column' as const, gap: 24 }}>
        {/* Budgets */}
        <div>
        <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block' }}>
              Monthly budgets
            </label>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Tap outside input to save</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border-light)', borderRadius: 6, marginBottom: 6,
          }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Food</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>€</span>
              <input
                type="number"
                value={foodBudget}
                onChange={e => setFoodBudget(e.target.value)}
                onBlur={() => saveBudget('food', foodBudget)}
                style={{
                  width: 80, padding: '6px 10px', border: '1px solid var(--border)',
                  borderRadius: 6, fontFamily: 'var(--font-serif)', fontSize: 16,
                  textAlign: 'right' as const, outline: 'none',
                  color: 'var(--text)', background: 'var(--bg)',
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', background: 'var(--bg-card)',
            border: '1px solid var(--border-light)', borderRadius: 6, marginBottom: 6,
          }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Other</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>€</span>
              <input
                type="number"
                value={otherBudget}
                onChange={e => setOtherBudget(e.target.value)}
                onBlur={() => saveBudget('other', otherBudget)}
                style={{
                  width: 80, padding: '6px 10px', border: '1px solid var(--border)',
                  borderRadius: 6, fontFamily: 'var(--font-serif)', fontSize: 16,
                  textAlign: 'right' as const, outline: 'none',
                  color: 'var(--text)', background: 'var(--bg)',
                }}
              />
            </div>
          </div>
          {saved && (
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 4 }}>
              ✓ Saved
            </div>
          )}
        </div>

        {/* Shops */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Shops
          </label>
          {shops.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: 'var(--bg-card)',
              border: '1px solid var(--border-light)', borderRadius: 6, marginBottom: 4,
            }}>
              <span style={{ fontSize: 14 }}>{s.name}</span>
              <button
                onClick={() => removeShop(s.id)}
                style={{
                  width: 24, height: 24, border: '1px solid var(--border)',
                  borderRadius: 6, background: 'none', color: 'var(--red)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input
              placeholder="Add new shop"
              value={newShop}
              onChange={e => setNewShop(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addShop()}
              style={{
                flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
                borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 13,
                outline: 'none', color: 'var(--text)', background: 'var(--bg)',
              }}
            />
            <button
              onClick={addShop}
              style={{
                padding: '8px 14px', border: 'none', borderRadius: 6,
                background: 'var(--accent)', color: 'white',
                fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  )
}