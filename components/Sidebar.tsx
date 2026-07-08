'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const STUDENT_NAV = [
  { href: '/',            label: 'Hub',             icon: 'school' },
  { href: '/book',        label: 'Book a Spot',     icon: 'calendar_today' },
  { href: '/my-bookings', label: 'My Bookings',     icon: 'event_available' },
  { href: '/admin',       label: 'Centre Insights', icon: 'leaderboard', adminOnly: true },
]

// Admin-specific nav shown below divider when role === centre_admin
const ADMIN_EXTRA = [
  { href: '/admin',       label: 'Centre Insights', icon: 'leaderboard' },
  { href: '/book',        label: 'Walk-in Booking', icon: 'add_circle' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sf_user')
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const visibleItems = STUDENT_NAV.filter(
    (item: { href: string; label: string; icon: string; adminOnly?: boolean }) =>
      !item.adminOnly || user?.role === 'centre_admin'
  )

  const isAdmin = user?.role === 'centre_admin'

  return (
    <aside className="sidebar">
      {/* ── Header ─────────────────────────── */}
      <div className="sidebar-header">
        {/* Logo + centre name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div className="sidebar-logo-box">
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--sf-blue-on-fixed)', fontVariationSettings: "'FILL' 1" }}>location_city</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--sf-blue)', lineHeight: 1.2 }}>StudyHub</div>
            <div style={{ fontSize: 12, color: 'var(--sf-text-2)', marginTop: 1 }}>Koramangala</div>
          </div>
        </div>

        {/* User card */}
        {user && (
          <div style={{
            marginTop: 12, padding: '9px 11px', borderRadius: 8,
            background: 'var(--sf-card)', border: '1px solid var(--sf-border)',
            display: 'flex', alignItems: 'center', gap: 9
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              background: isAdmin ? 'var(--sf-gold)' : 'var(--sf-blue)',
              color: isAdmin ? 'var(--sf-gold-on)' : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sf-text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--sf-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {isAdmin && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sf-gold)', display: 'inline-block' }} />}
                {isAdmin ? 'Centre Admin' : 'Student'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ─────────────────────── */}
      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <button
            key={item.href + item.label}
            className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            onClick={() => router.push(item.href)}
          >
            <span
              className="material-symbols-outlined nav-icon"
              style={{ fontVariationSettings: isActive(item.href) ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}

        {/* Admin-only divider + extra items */}
        {isAdmin && (
          <>
            <div style={{ margin: '10px 4px 6px', borderTop: '1px solid var(--sf-border)' }} />
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--sf-text-3)', letterSpacing: '0.08em', padding: '0 12px 4px', textTransform: 'uppercase' }}>Admin Tools</div>
            <button
              className="nav-item"
              onClick={() => router.push('/book')}
            >
              <span className="material-symbols-outlined nav-icon" style={{ color: 'var(--sf-gold-deep)' }}>add_circle</span>
              <span style={{ color: 'var(--sf-gold-deep)' }}>Walk-in Booking</span>
            </button>
          </>
        )}
      </nav>

      {/* ── Footer ─────────────────────────── */}
      <div className="sidebar-footer">
        <button className="nav-item" onClick={() => alert('Support coming soon!')}
        >
          <span className="material-symbols-outlined nav-icon">help</span>
          Student Support
        </button>
        {user ? (
          <button className="nav-item" onClick={handleLogout}>
            <span className="material-symbols-outlined nav-icon">logout</span>
            Sign Out
          </button>
        ) : (
          <button className="nav-item" onClick={() => router.push('/book')}>
            <span className="material-symbols-outlined nav-icon">login</span>
            Sign In
          </button>
        )}
      </div>
    </aside>
  )
}
