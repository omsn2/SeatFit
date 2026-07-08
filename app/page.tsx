'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CENTRE_ID = 'centre-studyhub-01'

export default function LandingPage() {
  const router = useRouter()
  const [centre, setCentre] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (stored) setUser(JSON.parse(stored))
    fetch(`/api/centres/${CENTRE_ID}`).then(r => r.json()).then(setCentre)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('sf_user')
    setUser(null)
  }

  const amenities: string[] = centre ? centre.amenities : []

  const amenityIcons: Record<string, string> = {
    AC: '❄️', WiFi: '📶', Printing: '🖨️', Lockers: '🔒', 'Charging Points': '⚡'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(8,8,26,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64
      }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.5px' }}>
          Seat<span style={{ color: 'var(--primary)' }}>Fit</span>
        </span>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user ? (
            <>
              {user.role === 'centre_admin' && (
                <Link href="/admin" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: 14 }}>
                  Admin Panel
                </Link>
              )}
              <Link href="/my-bookings" style={{ color: 'var(--text-2)', textDecoration: 'none', fontSize: 14 }}>
                My Bookings
              </Link>
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{user.name}</span>
              <button className="btn-ghost" onClick={handleLogout} style={{ padding: '6px 14px', fontSize: 13 }}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 14 }}
              onClick={() => router.push('/book')}>
              Login
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 60px', textAlign: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 60%)'
      }}>
        {/* Glowing orb */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'inline-block', marginBottom: 16 }}>
          <span style={{
            background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
            color: '#a5b4fc', fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 999,
            letterSpacing: 0.5
          }}>
            📍 Koramangala, Bengaluru
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-2px', marginBottom: 16, color: 'var(--text-1)'
        }}>
          Book your seat,<br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>own your day.</span>
        </h1>

        <p style={{ fontSize: 18, color: 'var(--text-2)', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Reserve your preferred seat at StudyHub. Morning, Evening & Full Day shifts — book in under 60 seconds.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}
            onClick={() => router.push('/book')}>
            Book a Seat →
          </button>
          {user?.role === 'centre_admin' && (
            <button className="btn-ghost" onClick={() => router.push('/admin')}>
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Centre Info Card */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        {centre ? (
          <div className="glass" style={{ padding: 32, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{centre.name}</h2>
                <p style={{ color: 'var(--text-2)', fontSize: 14 }}>📍 {centre.address}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 4 }}>Open hours</div>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>
                  {centre.openTime} – {centre.closeTime}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Total Seats', value: centre.totalSeats, icon: '💺' },
                { label: 'Shifts Available', value: centre.shifts?.length ?? 2, icon: '⏰' },
                { label: 'Starting From', value: '₹60', icon: '💳' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(99,102,241,0.07)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 20px'
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)' }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {amenities.map((a: string) => (
                <span key={a} className="chip">{amenityIcons[a] ?? '✅'} {a}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass" style={{ padding: 32, textAlign: 'center', color: 'var(--text-3)' }}>
            Loading centre info...
          </div>
        )}

        {/* Shifts */}
        {centre?.shifts && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {centre.shifts.map((s: any) => (
              <div key={s.id} className="glass" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500, marginBottom: 8 }}>
                  {s.shiftType === 'morning' ? '🌅' : '🌆'} {s.name} Shift
                </div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{s.startTime} – {s.endTime}</div>
                <button className="btn-primary" style={{ marginTop: 16, width: '100%', padding: '10px' }}
                  onClick={() => router.push('/book')}>
                  Book →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pricing */}
        {centre?.pricingPlans && (
          <div className="glass" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Pricing</h3>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {centre.pricingPlans.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>₹{p.price}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>/ {p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '20px 24px',
        textAlign: 'center', color: 'var(--text-3)', fontSize: 13
      }}>
        © 2026 SeatFit · Study Centre Seat Booking
      </footer>
    </div>
  )
}
