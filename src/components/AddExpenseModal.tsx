'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Shop } from '@/lib/types'

const PERSONS = ['Dominykas', 'Julita']

interface Props {
  open: boolean
  onClose: () => void
  onAdded: () => void
}

export default function AddExpenseModal({ open, onClose, onAdded }: Props) {
  const [shops, setShops] = useState<Shop[]>([])
  const [person, setPerson] = useState('')
  const [shopId, setShopId] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<'food' | 'other'>('food')
  const [note, setNote] = useState('')
  const [newShopName, setNewShopName] = useState('')
  const [showNewShop, setShowNewShop] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      supabase.from('shops').select('*').order('name').then(({ data }) => {
        if (data) setShops(data)
      })
    }
  }, [open])

  const canSubmit = person && shopId && amount && Number(amount) > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    const { error } = await supabase.from('expenses').insert({
      shop_id: shopId,
      amount: parseFloat(amount),
      category,
      person,
      note: note || null,
    })
    setSubmitting(false)
    if (!error) {
      setPerson('')
      setShopId('')
      setAmount('')
      setCategory('food')
      setNote('')
      onAdded()
      onClose()
    }
  }

  const handleAddShop = async () => {
    if (!newShopName.trim()) return
    const { data } = await supabase
      .from('shops')
      .insert({ name: newShopName.trim() })
      .select()
      .single()
    if (data) {
      setShops(prev => [...prev, data])
      setShopId(data.id)
      setNewShopName('')
      setShowNewShop(false)
    }
  }

  if (!open) return null

  const btnStyle = (active: boolean) => ({
    padding: '12px',
    border: `1px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    borderRadius: 6,
    background: active ? 'var(--text)' : 'var(--bg-card)',
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    fontWeight: 500 as const,
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
    color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
  })

  const chipStyle = (active: boolean) => ({
    padding: '8px 14px',
    border: `1px solid ${active ? 'var(--accent-dark)' : 'var(--border)'}`,
    borderRadius: 6,
    background: active ? 'var(--accent-light)' : 'var(--bg-card)',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    cursor: 'pointer' as const,
    transition: 'all 0.15s',
    color: active ? 'var(--accent-dark)' : 'var(--text-secondary)',
  })

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(45, 43, 40, 0.3)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--bg-card)', width: '100%', maxWidth: 480,
        borderRadius: '12px 12px 0 0', padding: '24px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
        maxHeight: '90vh', overflowY: 'auto' as const,
      }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, marginBottom: 20 }}>
          Add expense
        </h2>

        {/* Person */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Who
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PERSONS.map(p => (
              <button key={p} style={btnStyle(person === p)} onClick={() => setPerson(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Shop
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
            {shops.map(s => (
              <button key={s.id} style={chipStyle(shopId === s.id)} onClick={() => setShopId(s.id)}>
                {s.name}
              </button>
            ))}
            <button
              style={{ ...chipStyle(false), borderStyle: 'dashed', color: 'var(--text-tertiary)' }}
              onClick={() => setShowNewShop(!showNewShop)}
            >
              + New
            </button>
          </div>
          {showNewShop && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input
                style={{
                  flex: 1, padding: '8px 12px', border: '1px solid var(--border)',
                  borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 13,
                  outline: 'none', color: 'var(--text)', background: 'var(--bg)',
                }}
                placeholder="Shop name"
                value={newShopName}
                onChange={e => setNewShopName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddShop()}
                autoFocus
              />
              <button
                onClick={handleAddShop}
                style={{
                  padding: '8px 14px', border: 'none', borderRadius: 6,
                  background: 'var(--accent)', color: 'white',
                  fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Amount (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px',
              border: '1px solid var(--border)', borderRadius: 6,
              fontFamily: 'var(--font-serif)', fontSize: 28, textAlign: 'center' as const,
              outline: 'none', color: 'var(--text)', background: 'var(--bg)',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Category
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={btnStyle(category === 'food')} onClick={() => setCategory('food')}>Food</button>
            <button style={btnStyle(category === 'other')} onClick={() => setCategory('other')}>Other</button>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.8, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Note (optional)
          </label>
          <input
            placeholder="What was it for?"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid var(--border)', borderRadius: 6,
              fontFamily: 'var(--font-sans)', fontSize: 13,
              outline: 'none', color: 'var(--text)', background: 'var(--bg)',
            }}
          />
        </div>

        {/* Submit */}
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{
            width: '100%', padding: 14, border: 'none', borderRadius: 6,
            background: 'var(--text)', color: 'var(--bg-card)',
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.4, letterSpacing: 0.3,
            transition: 'opacity 0.15s', marginTop: 6
          }}
        >
          {submitting ? 'Adding...' : 'Add expense'}
        </button>
      </div>
    </div>
  )
}