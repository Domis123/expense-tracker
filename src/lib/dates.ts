export function getMonday(d: Date = new Date()): Date {
    const dt = new Date(d)
    const day = dt.getDay()
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1)
    dt.setHours(0, 0, 0, 0)
    dt.setDate(diff)
    return dt
  }
  
  export function getSunday(monday: Date): Date {
    const sun = new Date(monday)
    sun.setDate(sun.getDate() + 6)
    sun.setHours(23, 59, 59, 999)
    return sun
  }
  
  export function fmtDate(d: string | Date): string {
    return new Date(d).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short'
    })
  }
  
  export function fmtTime(d: string | Date): string {
    return new Date(d).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    })
  }
  
  export function weekLabel(monday: Date): string {
    const sun = new Date(monday)
    sun.setDate(sun.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return `${fmt(monday)} – ${fmt(sun)}`
  }
  
  export function toISODate(d: Date): string {
    return d.toISOString().split('T')[0]
  }