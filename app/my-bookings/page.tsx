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
      .then(r => r.json())
      .then(d => { setBookings(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending')
  const past     = bookings.filter(b => b.status === 'cancelled' || b.status === 'checked_in' || b.status === 'completed')

  const fmtDate = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      confirmed:  { cls: 'badge-confirmed',  label: 'Confirmed' },
      pending:    { cls: 'badge-pending',    label: 'Check-in Open' },
      cancelled:  { cls: 'badge-cancelled',  label: 'Cancelled' },
      checked_in: { cls: 'badge-checkin',    label: 'Checked In' },
      completed:  { cls: 'badge-confirmed',  label: 'Completed' },
    }
    return map[s] ?? { cls: 'badge-pending', label: s }
  }

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 className="text-headline-lg" style={{ color: 'var(--sf-text-1)', marginBottom: 4 }}>My Bookings</h1>
        <p style={{ fontSize: 15, color: 'var(--sf-text-2)' }}>
          Manage your upcoming study sessions and review past activity.
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sf-text-2)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.3 }}>calendar_today</span>
          Loading bookings...
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="card" style={{ padding: 56, textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--sf-border)', display: 'block', marginBottom: 16 }}>
            event_busy
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sf-text-1)', marginBottom: 8 }}>No bookings yet</h2>
          <p style={{ fontSize: 15, color: 'var(--sf-text-2)', marginBottom: 24 }}>
            Book your first study spot and get started!
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/book')}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            Book a Spot
          </button>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcoming.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="text-headline-sm" style={{ color: 'var(--sf-text-1)' }}>Upcoming Sessions</h2>
            <span style={{ background: 'var(--sf-blue)', color: 'var(--on-primary)', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>
              {upcoming.length} Active
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
            {upcoming.map(b => {
              const { cls, label } = statusBadge(b.status)
              const isCheckInOpen = b.status === 'pending'
              return (
                <div key={b.id} style={{
                  background: 'var(--sf-card)',
                  border: `1px solid ${isCheckInOpen ? 'var(--sf-gold)' : 'var(--sf-border)'}`,
                  borderRadius: 12, padding: 22,
                  display: 'flex', flexDirection: 'column', gap: 12,
                  boxShadow: isCheckInOpen ? '0 2px 12px rgba(254,166,25,0.15)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span className={`badge ${cls}`} style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isCheckInOpen && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--sf-gold)', display: 'inline-block' }} />}
                      {label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--sf-text-2)' }}>
                      {fmtDate(b.bookingDate)}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--sf-text-1)', letterSpacing: '-0.3px', marginBottom: 4 }}>
                      Spot {b.seat?.label}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--sf-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
                      StudyHub · {b.shift?.name}
                    </p>
                  </div>

                  {b.seat?.amenities?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {b.seat.amenities.slice(0, 3).map((a: string) => (
                        <span key={a} className="chip">{a}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, paddingTop: 4, borderTop: '1px solid var(--sf-border)' }}>
                    {isCheckInOpen ? (
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/bookings/${b.id}`)}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>how_to_reg</span>
                        Check-in to Spot
                      </button>
                    ) : (
                      <button
                        className="btn btn-dark"
                        style={{ flex: 1 }}
                        onClick={() => router.push(`/bookings/${b.id}`)}
                      >
                        View Details
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ flex: 0 }}
                      onClick={() => router.push(`/bookings/${b.id}`)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Past Sessions */}
      {past.length > 0 && (
        <section>
          <h2 className="text-headline-sm" style={{ color: 'var(--sf-text-1)', marginBottom: 16 }}>Past Sessions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {past.map(b => {
              const { cls, label } = statusBadge(b.status)
              return (
                <div key={b.id} className="booking-card"
                  style={{ display: 'flex', alignItems: 'center', gap: 16 }}
                  onClick={() => router.push(`/bookings/${b.id}`)}>

                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'var(--sf-surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--sf-text-2)' }}>history</span>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sf-text-1)', marginBottom: 2 }}>
                      Spot {b.seat?.label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--sf-text-2)' }}>
                      StudyHub · {fmtDate(b.bookingDate)} · {b.shift?.startTime} – {b.shift?.endTime}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span className={`badge ${cls}`}>{label}</span>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={e => { e.stopPropagation(); router.push('/book') }}
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* FAB - Book another */}
      {!loading && bookings.length > 0 && (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 30 }}>
          <button
            className="btn btn-primary"
            style={{ borderRadius: 999, padding: '14px 24px', boxShadow: '0 6px 24px rgba(254,166,25,0.4)' }}
            onClick={() => router.push('/book')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            Book a Spot
          </button>
        </div>
      )}
    </>
  )
}
