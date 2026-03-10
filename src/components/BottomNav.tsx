'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { key: '/', label: 'Home', icon: '◉' },
  { key: '/history', label: 'History', icon: '☰' },
  { key: '/settings', label: 'Settings', icon: '⚙' },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 16px',
      paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-light)',
      zIndex: 100,
    }}>
      {tabs.map(tab => {
        const active = pathname === tab.key
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: active ? 'var(--text)' : 'var(--text-tertiary)',
              fontSize: 10,
              fontFamily: 'var(--font-sans)',
              fontWeight: 500,
              letterSpacing: 0.5,
              textTransform: 'uppercase' as const,
              transition: 'color 0.2s',
              minHeight: 44,
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}