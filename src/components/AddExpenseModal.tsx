'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Shop, ExpenseWithShop } from '@/lib/types'

const PERSONS = ['Dominykas', 'Mylimoji']

interface Props {
  open: boolean
  onClose: () => void
  onAdded: () => void
  editExpense?: ExpenseWithShop | null
}

export default function AddExpenseModal({ open, onClose, onAdded, editExpense }: Props) {
  const [shops, setShops] = useState<Shop[]>([])
  const [person, setPerson] = useState('')
  const [shopId, setShopId] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<'food' | 'other'>('food')
  const [note, setNote] = useState('')
  const [newShopName, setNewShopName] = useState('')
  const [showNewShop, setShowNewShop] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  const isEdit = !!editExpense

  useEffect(() => {
    if (open) {
      supabase.from('shops').select('*').order('name').then(({ data }) => {
        if (data) setShops(data)
      })
      document.body.style.overflow = 'hidden'

      if (editExpense) {
        setPerson(editExpense.person)
        setShopId(editExpense.shop_id || '')
        setAmount(editExpense.amount.toString())
        setCategory(editExpense.category)
        setNote(editExpense.note || '')
      } else {
        setPerson('')
        setShopId('')
        setAmount('')
        setCategory('food')
        setNote('')
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, editExpense])

  const canSubmit = person && shopId && amount && Number(amount) > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)

    if (isEdit) {
      await supabase.from('expenses').update({
        shop_id: shopId,
        amount: parseFloat(amount),
        category,
        person,
        note: note || null,
      }).eq('id', editExpense.id)
    } else {
      await supabase.from('expenses').insert({
        shop_id: shopId,
        amount: parseFloat(amount),
        category,
        person,
        note: note || null,
      })
    }

    setSubmitting(false)
    setPerson('')
    setShopId('')
    setAmount('')
    setCategory('food')
    setNote('')
    onAdded()
    onClose()
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

  const labelStyle = {
    fontSize: 11, fontWeight: 600 as const, textTransform: 'uppercase' as const,
    letterSpacing: 0.8, color: 'var(--text-secondary)',
    display: 'block', marginBottom: 10,
  }

  const toggleBtn = (active: boolean) => ({
    padding: '12px 16px',
    border: `1.5px solid ${active ? 'var(--text)' : 'var(--border)'}`,
    borderRadius: 6,
    background: active ? 'var(--text)' : 'var(--bg-card)',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500 as const,
    cursor: 'pointer' as const, transition: 'all 0.15s',
    color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
    minHeight: 48,
  })

  const chipStyle = (active: boolean) => ({
    padding: '10px 16px',
    border: `1.5px solid ${active ? 'var(--accent-dark)' : 'var(--border)'}`,
    borderRadius: 6,
    background: active ? 'var(--accent-light)' : 'var(--bg-card)',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500 as const,
    cursor: 'pointer' as const, transition: 'all 0.15s',
    color: active ? 'var(--accent-dark)' : 'var(--text-secondary)',
    minHeight: 44,
  })

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(45, 43, 40, 0.35)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', width: '100%', maxWidth: 480,
          borderRadius: '14px 14px 0 0',
          padding: '20px 20px calc(20px + env(safe-area-inset-bottom, 0px))',
          maxHeight: '92vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)', margin: '0 auto 18px' }} />

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 400, marginBottom: 22 }}>
          {isEdit ? 'Edit expense' : 'Add expense'}
        </h2>

        {/* Person */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Who</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PERSONS.map(p => (
              <button key={p} style={toggleBtn(person === p)} onClick={() => { setPerson(p); setTimeout(() => amountRef.current?.focus(), 100) }}>{p}</button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Amount (€)</label>
          <input
            ref={amountRef}
            type="number" step="0.01" min="0" inputMode="decimal"
            placeholder="0.00" value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%', padding: '16px',
              border: '1.5px solid var(--border)', borderRadius: 6,
              fontFamily: 'var(--font-serif)', fontSize: 32,
              textAlign: 'center' as const,
              outline: 'none', color: 'var(--text)', background: 'var(--bg)',
            }}
          />
        </div>

        {/* Shop */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Shop</label>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
            {shops.map(s => (
              <button key={s.id} style={chipStyle(shopId === s.id)} onClick={() => setShopId(s.id)}>{s.name}</button>
            ))}
            <button
              style={{ ...chipStyle(false), borderStyle: 'dashed', color: 'var(--text-tertiary)' }}
              onClick={() => setShowNewShop(!showNewShop)}
            >
              + New
            </button>
          </div>
          {showNewShop && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                style={{
                  flex: 1, padding: '10px 14px', border: '1.5px solid var(--border)',
                  borderRadius: 6, fontFamily: 'var(--font-sans)', fontSize: 14,
                  outline: 'none', color: 'var(--text)', background: 'var(--bg)',
                }}
                placeholder="Shop name" value={newShopName}
                onChange={e => setNewShopName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddShop()}
                autoFocus
              />
              <button
                onClick={handleAddShop}
                style={{
                  padding: '10px 16px', border: 'none', borderRadius: 6,
                  background: 'var(--accent)', color: 'white',
                  fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', minHeight: 44,
                }}
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={toggleBtn(category === 'food')} onClick={() => setCategory('food')}>Food</button>
            <button style={toggleBtn(category === 'other')} onClick={() => setCategory('other')}>Other</button>
          </div>
        </div>

        {/* Note */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Note (optional)</label>
          <input
            placeholder="What was it for?" value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1.5px solid var(--border)', borderRadius: 6,
              fontFamily: 'var(--font-sans)', fontSize: 14,
              outline: 'none', color: 'var(--text)', background: 'var(--bg)',
              minHeight: 48,
            }}
          />
        </div>

        {/* Submit */}
        <button
          disabled={!canSubmit} onClick={handleSubmit}
          style={{
            width: '100%', padding: 16, border: 'none', borderRadius: 6,
            background: 'var(--text)', color: 'var(--bg-card)',
            fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            opacity: canSubmit ? 1 : 0.4, letterSpacing: 0.3,
            transition: 'opacity 0.15s', minHeight: 52,
          }}
        >
          {submitting ? (isEdit ? 'Saving...' : 'Adding...') : (isEdit ? 'Save changes' : 'Add expense')}
        </button>
      </div>
    </div>
  )
}