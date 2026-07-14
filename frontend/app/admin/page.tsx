'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminAPI, getStoredUser } from '@/lib/api'

/* ─── Static data for visuals ─── */
const ZONE_HEATMAP = [
  { name: 'Quiet A',      pct: 60, col: '1 / 2', row: '1 / 2' },
  { name: 'Quiet B',      pct: 55, col: '2 / 3', row: '1 / 2' },
  { name: 'Tech Hub',     pct: 92, col: '3 / 5', row: '1 / 3', highlight: true },
  { name: 'Collab 1',     pct: 40, col: '1 / 2', row: '2 / 3' },
  { name: 'Collab 2',     pct: 48, col: '2 / 3', row: '2 / 3' },
  { name: 'Reading Room', pct: 70, col: '1 / 3', row: '3 / 4' },
  { name: 'Café',         pct: 25, col: '3 / 5', row: '3 / 4' },
]

const WEEK_BARS = [18, 32, 58, 85, 92, 72, 42]
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function zoneColor(pct: number, highlight?: boolean) {
  if (highlight) return 'var(--sf-gold)'            // Tech Hub → gold
  if (pct > 75)  return '#93b4e8'                   // Dark blue
  if (pct > 50)  return '#b8c4ff'                   // Medium blue
  return '#cdd5f0'                                   // Light blue
}
function zoneTextColor(highlight?: boolean) {
  return highlight ? 'var(--sf-gold-on)' : 'var(--sf-blue)'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData]     = useState<any>(null)
  const [user, setUser]     = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (!stored) { router.push('/book'); return }
    const u = JSON.parse(stored)
    // Java returns 'CENTRE_ADMIN' (uppercase), accept both
    if (!u.role || !['centre_admin','CENTRE_ADMIN'].includes(u.role)) { router.push('/'); return }
    setUser(u)
    AdminAPI.dashboard()
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  /* ─── Computed values ─── */
  const totalBooked = data?.occupancy?.reduce((s: number, o: any) => s + o.booked, 0) ?? 0
  const totalSeats  = data?.occupancy?.reduce((s: number, o: any) => s + o.total, 0) ?? 0
  const occupancyPct = totalSeats ? Math.round((totalBooked / totalSeats) * 100) : 85

  const statusBadge = (s: string) =>
    ({ confirmed: 'badge-confirmed', pending: 'badge-checkin', cancelled: 'badge-cancelled' }[s] ?? 'badge-pending')

  const todayIdx = new Date().getDay() // 0=Sun
  // Bar index 0=Mon → maps to getDay() 1..7→0 via: dayOfWeek = (i + 1) % 7
  const isBarToday = (i: number) => (i + 1) % 7 === todayIdx % 7

  const refresh = () => {
    setLoading(true)
    AdminAPI.dashboard().then(d => { setData(d); setLoading(false) })
  }

  return (
    <>
      {/* ─── Page Header ────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="text-headline-lg" style={{ color: 'var(--sf-text-1)', marginBottom: 4 }}>
            Centre Insights — StudyHub
          </h1>
          <p style={{ fontSize: 15, color: 'var(--sf-text-2)' }}>
            Overview of administrative metrics and facility usage.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={refresh}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
            Refresh
          </button>
          <button className="btn btn-dark" onClick={() => router.push('/book')}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>settings</span>
            Manage Centre
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--sf-text-2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 52, display: 'block', marginBottom: 14, opacity: 0.25 }}>analytics</span>
          Loading insights…
        </div>
      ) : (
        <>
          {/* ─── KPI Cards ──────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>

            {/* Occupancy */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sf-text-2)', fontWeight: 500 }}>Current Occupancy</span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--sf-text-3)' }}>group</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--sf-blue)' }}>{occupancyPct}%</span>
                <span style={{
                  background: occupancyPct > 80 ? 'rgba(254,166,25,0.15)' : 'rgba(22,163,74,0.1)',
                  color: occupancyPct > 80 ? 'var(--sf-amber)' : 'var(--sf-green)',
                  fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)'
                }}>
                  {occupancyPct > 80 ? 'High' : occupancyPct > 50 ? 'Moderate' : 'Low'}
                </span>
              </div>
            </div>

            {/* Most popular zone */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sf-text-2)', fontWeight: 500 }}>Most Popular Zone</span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--sf-text-3)' }}>local_fire_department</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--sf-text-1)' }}>Tech Hub</span>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--sf-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--sf-blue)' }}>laptop</span>
                </div>
              </div>
            </div>

            {/* Total study hours */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sf-text-2)', fontWeight: 500 }}>Total Study Hours</span>
                <span style={{ background: 'var(--sf-surface-container)', color: 'var(--sf-text-2)', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)' }}>This Month</span>
              </div>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--sf-text-1)' }}>
                {12450 + (data?.recentBookings?.length ?? 0) * 3}
              </span>
            </div>

            {/* Revenue */}
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sf-text-2)', fontWeight: 500 }}>Revenue Today</span>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--sf-text-3)' }}>payments</span>
              </div>
              <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--sf-green)' }}>
                ₹{data?.revenueToday ?? 0}
              </span>
            </div>
          </div>

          {/* ─── Shift occupancy bars ────────────── */}
          {data?.occupancy?.length > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {data.occupancy.map((o: any) => {
                const pct = totalSeats ? Math.round((o.booked / o.total) * 100) : 0
                const barColor = pct > 80 ? '#dc2626' : pct > 50 ? 'var(--sf-blue)' : 'var(--sf-green)'
                return (
                  <div key={o.shiftId} className="stat-card" style={{ flex: '1 1 160px' }}>
                    <div style={{ fontSize: 13, color: 'var(--sf-text-2)', fontWeight: 500, marginBottom: 6 }}>
                      {o.shiftName === 'Morning' ? '🌅' : '🌇'} {o.shiftName} Shift
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--sf-text-1)', marginBottom: 8 }}>
                      {o.booked}<span style={{ fontSize: 14, color: 'var(--sf-text-3)', fontWeight: 400 }}>/{o.total}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--sf-text-3)', marginTop: 6 }}>{o.total - o.booked} seats available</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ─── Charts row ─────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

            {/* Weekly bar chart */}
            <div className="card card-p">
              <h2 className="text-headline-sm" style={{ marginBottom: 24, color: 'var(--sf-text-1)' }}>Weekly Usage Trends</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                {WEEK_BARS.map((h, i) => {
                  const active = isBarToday(i)
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{
                        width: '100%',
                        height: `${h}%`,
                        borderRadius: '4px 4px 0 0',
                        background: active ? 'var(--sf-blue)' : 'var(--sf-blue-dim)',
                        transition: 'height 0.6s ease',
                        minHeight: 4,
                      }} />
                      <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--sf-blue)' : 'var(--sf-text-2)' }}>
                        {WEEK_DAYS[i]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Zone heatmap */}
            <div className="card card-p">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="text-headline-sm" style={{ color: 'var(--sf-text-1)' }}>Zone Heatmap</h2>
                <button className="btn btn-outline btn-sm" onClick={() => router.push('/book')}>View Map</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gridTemplateRows: 'repeat(3,1fr)', gap: 8, height: 200 }}>
                {ZONE_HEATMAP.map(zone => (
                  <div key={zone.name} style={{
                    gridColumn: zone.col,
                    gridRow: zone.row,
                    background: zoneColor(zone.pct, zone.highlight),
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: zone.highlight ? 15 : 13,
                    fontWeight: zone.highlight ? 700 : 600,
                    color: zoneTextColor(zone.highlight),
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    textAlign: 'center',
                    padding: 8,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {zone.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Quick Actions ───────────────────── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => router.push('/book')}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
              Walk-in Booking
            </button>
            <button className="btn btn-outline" onClick={refresh}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
              Refresh Data
            </button>
          </div>

          {/* ─── Recent Activity Table ────────────── */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--sf-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="text-headline-sm" style={{ color: 'var(--sf-text-1)' }}>Recent Activity</h2>
              <span className="material-symbols-outlined" style={{ color: 'var(--sf-text-2)', cursor: 'pointer' }}>filter_list</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--sf-border)', background: 'var(--sf-surface-low)' }}>
                    {['Student ID', 'Zone', 'Action', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 20px', color: 'var(--sf-text-2)', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.recentBookings?.slice(0, 10).map((b: any, i: number) => (
                    <tr
                      key={b.id}
                      style={{ borderBottom: '1px solid var(--sf-border)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--sf-surface-low)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => router.push(`/bookings/${b.id}`)}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--sf-blue)' }}>
                        #{b.user?.id?.slice(-6).toUpperCase() ?? `STU-${1000 + i}`}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--sf-text-1)' }}>
                        {b.shift?.name ?? 'Quiet Zone'} · Spot {b.seat?.label}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span className={`badge ${statusBadge(b.status)}`}>
                          {b.status === 'pending' ? 'Check-in' : b.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--sf-text-2)', fontSize: 13 }}>
                        {new Date(b.bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                  {(!data?.recentBookings || data.recentBookings.length === 0) && (
                    <tr>
                      <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--sf-text-2)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 10, opacity: 0.3 }}>inbox</span>
                        No recent activity yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  )
}
