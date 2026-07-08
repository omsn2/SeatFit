'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const CENTRE_ID = 'centre-studyhub-01'

const STUDY_SPOTS = [
  {
    id: 1,
    name: 'Desk Q12 — Quiet Zone',
    location: 'StudyHub, Level 1',
    tags: ['Power', 'Silent'],
    status: 'Available',
    statusColor: '#16a34a',
    gradient: 'linear-gradient(135deg,#e5eeff 0%,#dde1ff 100%)',
    icon: '🪑',
  },
  {
    id: 2,
    name: 'Pod G04 — Group Hub',
    location: 'StudyHub, Level 1',
    tags: ['Screen Share', 'Seats 4'],
    status: 'Available at 3:00 PM',
    statusColor: '#b45309',
    gradient: 'linear-gradient(135deg,#fdf3e0 0%,#ffddb8 100%)',
    icon: '🛋️',
  },
  {
    id: 3,
    name: 'Station T11 — Tech Row',
    location: 'StudyHub, Level 1',
    tags: ['Dual Monitors', 'High-speed LAN'],
    status: 'Available',
    statusColor: '#16a34a',
    gradient: 'linear-gradient(135deg,#e5eeff 0%,#d3e4fe 100%)',
    icon: '🖥️',
  },
]

const ZONES = [
  { name: 'Quiet Zone',  pct: 82, label: 'Very Busy',       color: 'var(--sf-blue)' },
  { name: 'Group Hub',   pct: 45, label: 'Moderate',         color: 'var(--sf-gold)' },
  { name: 'Tech Row',    pct: 15, label: 'Plenty of spots',  color: 'var(--sf-blue-dim)' },
]

export default function HubPage() {
  const router = useRouter()
  const [centre, setCentre] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (stored) setUser(JSON.parse(stored))
    fetch(`/api/centres/${CENTRE_ID}`).then(r => r.json()).then(setCentre).catch(() => {})
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning,'
    if (h < 17) return 'Good afternoon,'
    return 'Good evening,'
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  return (
    <>
      {/* Page Header */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: 'var(--sf-blue)', fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
              {greeting()}
            </p>
            <h1 className="text-display-lg" style={{ color: 'var(--sf-text-1)', lineHeight: 1.15 }}>
              Ready to hit the books,<br />
              <span style={{ color: 'var(--sf-blue)' }}>{firstName}?</span>
            </h1>
          </div>

          {/* Search */}
          <div className="search-bar" style={{ width: 340, maxWidth: '100%' }}>
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Find a Study Spot..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>
      </section>

      {/* Bento grid: Availability + Upcoming Bookings */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 40, alignItems: 'stretch' }}>

        {/* Centre Availability */}
        <div className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 className="text-headline-sm" style={{ color: 'var(--sf-text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--sf-blue)', fontSize: 22 }}>data_usage</span>
                Centre Availability
              </h2>
              <p style={{ fontSize: 14, color: 'var(--sf-text-2)', marginTop: 2 }}>StudyHub live occupancy</p>
            </div>
            <span style={{
              background: 'var(--sf-surface-high)', color: 'var(--sf-blue)',
              fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <span className="live-dot" />
              Live
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {ZONES.map(z => (
              <div key={z.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 500 }}>
                  <span style={{ color: 'var(--sf-text-1)' }}>{z.name}</span>
                  <span style={{ color: 'var(--sf-text-2)' }}>{z.pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${z.pct}%`, background: z.color }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--sf-text-2)', fontWeight: 500 }}>{z.label}</p>
              </div>
            ))}
          </div>

          {/* Quick stats from centre data */}
          {centre && (
            <div style={{ display: 'flex', gap: 16, paddingTop: 8, borderTop: '1px solid var(--sf-border)', flexWrap: 'wrap' }}>
              {[
                { icon: '💺', label: 'Total Seats', value: centre.totalSeats },
                { icon: '⏰', label: 'Shifts', value: centre.shifts?.length ?? 2 },
                { icon: '💳', label: 'From', value: `₹${centre.pricingPlans?.[0]?.price ?? 60}` },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sf-text-1)' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--sf-text-2)', fontWeight: 500 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings panel */}
        <div className="card-blue" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(255,255,255,0.12) 0%, transparent 55%)', borderRadius: 'inherit', pointerEvents: 'none' }} />
          <h2 className="text-headline-sm" style={{ position: 'relative' }}>Upcoming Bookings</h2>

          {user ? (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                borderRadius: 10, padding: '14px 16px',
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer', transition: 'background 0.2s'
              }}
                onClick={() => router.push('/my-bookings')}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sf-blue-dim)', marginBottom: 4 }}>Today · Check your bookings</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>My Bookings →</div>
                <div style={{ fontSize: 13, color: 'var(--sf-blue-dim)', marginTop: 2 }}>View all upcoming sessions</div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              <p style={{ fontSize: 14, color: 'var(--sf-blue-dim)', lineHeight: 1.5 }}>
                Sign in to see and manage your upcoming study sessions.
              </p>
            </div>
          )}

          <button
            className="btn"
            style={{
              width: '100%', padding: '12px', borderRadius: 8, position: 'relative',
              border: '1.5px dashed var(--sf-blue-dim)', color: 'var(--sf-blue-dim)',
              background: 'transparent', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}
            onClick={() => router.push('/book')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Book a spot
          </button>
        </div>
      </section>

      {/* Suggested Study Spots */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="text-headline-sm" style={{ color: 'var(--sf-text-1)' }}>Suggested Study Spots</h2>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => router.push('/book')}
          >
            View map →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
          {STUDY_SPOTS.filter(s =>
            !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(spot => (
            <div
              key={spot.id}
              className="card"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Spot illustration */}
              <div style={{
                height: 140, background: spot.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', flexShrink: 0
              }}>
                <span style={{ fontSize: 52 }}>{spot.icon}</span>
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 12, fontWeight: 600, color: spot.statusColor,
                  border: '1px solid rgba(0,0,0,0.08)'
                }}>
                  {spot.status}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--sf-text-1)', marginBottom: 3 }}>{spot.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--sf-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                    {spot.location}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {spot.tags.map(t => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
                <button
                  className="btn btn-primary btn-full"
                  style={{ marginTop: 'auto' }}
                  onClick={() => router.push('/book')}
                >
                  Book Spot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
