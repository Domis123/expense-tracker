// Get first day of current (or given) month
export function getMonthStart(d: Date = new Date()): Date {
  const dt = new Date(d)
  dt.setDate(1)
  dt.setHours(0, 0, 0, 0)
  return dt
}

// Get last day of the same month
export function getMonthEnd(monthStart: Date): Date {
  const dt = new Date(monthStart)
  dt.setMonth(dt.getMonth() + 1)
  dt.setDate(0)
  dt.setHours(23, 59, 59, 999)
  return dt
}

// Format: "Mon, 10 Mar"
export function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

// Format: "14:30"
export function fmtTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  })
}

// "March 2026"
export function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

// ISO date string for Supabase queries (YYYY-MM-DD)
export function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}