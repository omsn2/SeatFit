'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MyBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (!stored) { router.push('/book'); return }
    const u = JSON.parse(stored); setUser(u)
    fetch('/api/bookings', { headers: { 'x-user-id': u.id } })
      .then(r => r.json()).then(d => { setBookings(d); setLoading(false) })
  }, [])

  const statusColor = (s: string) => s === 'confirmed' ? '#10b981' : s === 'cancelled' ? '#ef4444' : '#f59e0b'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <nav style={{
        background: 'rgba(8,8,26,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60
      }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14 }}>← Home</button>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Seat<span style={{ color: 'var(--primary)' }}>Fit</span></span>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{user?.name}</span>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>My Bookings</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 28 }}>Your upcoming and past reservations</p>

        {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)' }}>Loading...</div>}

        {!loading && bookings.length === 0 && (
          <div className="glass" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>No bookings yet.</p>
            <button className="btn-primary" onClick={() => router.push('/book')}>Book a Seat →</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {bookings.map(b => (
            <div key={b.id} className="glass" style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => router.push(`/bookings/${b.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                    Seat {b.seat?.label} · {b.shift?.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                    📅 {new Date(b.bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                    {b.shift?.startTime} – {b.shift?.endTime} · ₹{b.amount}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
