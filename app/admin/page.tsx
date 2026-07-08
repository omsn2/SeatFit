'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (!stored) { router.push('/book'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'centre_admin') { router.push('/'); return }
    setUser(u)
    fetch('/api/admin/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  const statusColor = (s: string) => ({
    confirmed: 'badge-confirmed', pending: 'badge-pending', cancelled: 'badge-cancelled'
  }[s] ?? 'badge-pending')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        background: 'rgba(8,8,26,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, zIndex: 40
      }}>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Seat<span style={{ color: 'var(--primary)' }}>Fit</span> <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, background: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 999 }}>Admin</span></span>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13 }}>← Public View</button>
          <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => { localStorage.removeItem('sf_user'); router.push('/') }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>📅 {today} · StudyHub Koramangala</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Loading dashboard...</div>
        ) : (
          <>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              {/* Revenue */}
              <div className="glass" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>💰 REVENUE TODAY</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>₹{data?.revenueToday ?? 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>From confirmed bookings</div>
              </div>

              {/* Occupancy per shift */}
              {data?.occupancy?.map((o: any) => (
                <div key={o.shiftId} className="glass" style={{ padding: 24 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>
                    {o.shiftName === 'Morning' ? '🌅' : '🌆'} {o.shiftName.toUpperCase()} SHIFT
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800 }}>{o.booked}<span style={{ fontSize: 16, color: 'var(--text-3)', fontWeight: 400 }}>/{o.total}</span></div>
                  <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ height: 4, borderRadius: 2, width: `${Math.min(100, (o.booked / o.total) * 100)}%`, background: o.booked / o.total > 0.8 ? 'var(--danger)' : 'var(--primary)', transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{o.total - o.booked} seats available</div>
                </div>
              ))}

              {/* Total bookings */}
              <div className="glass" style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>📋 TOTAL BOOKINGS</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{data?.recentBookings?.length ?? 0}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>All time</div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }} onClick={() => router.push('/book')}>
                + Walk-in Booking
              </button>
              <button className="btn-ghost" onClick={() => { setLoading(true); fetch('/api/admin/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) }) }}>
                🔄 Refresh
              </button>
            </div>

            {/* Recent Bookings Table */}
            <div className="glass" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>All Bookings</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Student', 'Phone', 'Seat', 'Shift', 'Date', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, letterSpacing: 0.5 }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recentBookings?.map((b: any) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', cursor: 'pointer' }}
                        onClick={() => router.push(`/bookings/${b.id}`)}>
                        <td style={{ padding: '12px 12px', fontWeight: 600 }}>{b.user?.name ?? '—'}</td>
                        <td style={{ padding: '12px 12px', color: 'var(--text-2)' }}>{b.user?.phone ?? '—'}</td>
                        <td style={{ padding: '12px 12px', color: '#a5b4fc', fontWeight: 600 }}>{b.seat?.label}</td>
                        <td style={{ padding: '12px 12px', color: 'var(--text-2)' }}>{b.shift?.name}</td>
                        <td style={{ padding: '12px 12px', color: 'var(--text-2)' }}>
                          {new Date(b.bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '12px 12px', fontWeight: 600 }}>₹{b.amount}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <span className={`badge ${statusColor(b.status)}`}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data?.recentBookings?.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)' }}>No bookings yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
