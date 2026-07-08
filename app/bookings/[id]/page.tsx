'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function BookingConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/bookings/${id}`).then(r => r.json()).then(d => { setBooking(d); setLoading(false) })
  }, [id])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>
      Loading...
    </div>
  )

  if (!booking || booking.error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'var(--text-2)' }}>Booking not found.</p>
      <button className="btn-primary" onClick={() => router.push('/')}>Go Home</button>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Success glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)'
      }} />

      <div style={{ maxWidth: 440, width: '100%', animation: 'slideUp 0.4s ease' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginBottom: 6 }}>Booking Confirmed!</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>Your seat is reserved and waiting for you.</p>
        </div>

        {/* Details card */}
        <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'grid', gap: 14 }}>
            {[
              { icon: '🏛', label: 'Centre', value: booking.centre?.name },
              { icon: '💺', label: 'Seat', value: `${booking.seat?.label} (${booking.seat?.seatType})` },
              { icon: '📅', label: 'Date', value: new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
              { icon: '⏰', label: 'Shift', value: `${booking.shift?.name} · ${booking.shift?.startTime} – ${booking.shift?.endTime}` },
              { icon: '💳', label: 'Amount Paid', value: `₹${booking.amount}` },
              { icon: '🆔', label: 'Booking ID', value: booking.id.slice(0, 12).toUpperCase() },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-2)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {row.icon} {row.label}
                </span>
                <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', maxWidth: '55%' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QR code placeholder */}
        <div className="glass" style={{ padding: 24, textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12, fontWeight: 600, letterSpacing: 0.5 }}>SHOW THIS AT ENTRY</p>
          {/* QR visual placeholder */}
          <div style={{
            width: 160, height: 160, margin: '0 auto 12px',
            background: 'white', borderRadius: 12, padding: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '100%', height: '100%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='30' height='30' fill='%23000'/%3E%3Crect x='15' y='15' width='20' height='20' fill='%23fff'/%3E%3Crect x='20' y='20' width='10' height='10' fill='%23000'/%3E%3Crect x='60' y='10' width='30' height='30' fill='%23000'/%3E%3Crect x='65' y='15' width='20' height='20' fill='%23fff'/%3E%3Crect x='70' y='20' width='10' height='10' fill='%23000'/%3E%3Crect x='10' y='60' width='30' height='30' fill='%23000'/%3E%3Crect x='15' y='65' width='20' height='20' fill='%23fff'/%3E%3Crect x='20' y='70' width='10' height='10' fill='%23000'/%3E%3Crect x='45' y='10' width='5' height='5' fill='%23000'/%3E%3Crect x='55' y='10' width='5' height='5' fill='%23000'/%3E%3Crect x='45' y='20' width='10' height='5' fill='%23000'/%3E%3Crect x='50' y='45' width='10' height='10' fill='%23000'/%3E%3Crect x='65' y='45' width='10' height='5' fill='%23000'/%3E%3Crect x='45' y='60' width='5' height='10' fill='%23000'/%3E%3Crect x='55' y='55' width='10' height='5' fill='%23000'/%3E%3Crect x='60' y='65' width='10' height='10' fill='%23000'/%3E%3Crect x='75' y='55' width='10' height='10' fill='%23000'/%3E%3Crect x='45' y='75' width='10' height='10' fill='%23000'/%3E%3Crect x='60' y='80' width='5' height='5' fill='%23000'/%3E%3Crect x='75' y='75' width='10' height='10' fill='%23000'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover'
            }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Booking ref: <strong style={{ color: 'var(--text-2)' }}>{booking.qrCode}</strong></p>
        </div>

        {/* WhatsApp mock notice */}
        <div style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#4ade80' }}>
          📱 WhatsApp confirmation sent to your registered number
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={() => router.push('/my-bookings')}>My Bookings</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => router.push('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  )
}
