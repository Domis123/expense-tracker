'use client'

import { usePathname, useRouter } from 'next/navigation'

const tabs = [
  { key: '/', label: 'Home', icon: '⌂' },
  { key: '/history', label: 'Stats', icon: '◔' },
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
      padding: '6px 16px',
      paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
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
              gap: 2,
              padding: '8px 20px',
              border: 'none',
              background: active ? 'var(--bg-warm)' : 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: active ? 'var(--text)' : 'var(--text-tertiary)',
              fontSize: 10,
              fontFamily: 'var(--font-sans)',
              fontWeight: active ? 600 : 500,
              letterSpacing: 0.3,
              textTransform: 'uppercase' as const,
              transition: 'all 0.2s',
              minHeight: 44,
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1.2 }}>{tab.icon}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}