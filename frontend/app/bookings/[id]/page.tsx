'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookingAPI } from '@/lib/api'

export default function BookingConfirmPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    BookingAPI.getById(id)
      .then(d => { setBooking(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--sf-text-2)' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: 12, opacity: 0.25 }}>hourglass_top</span>
      Loading booking…
    </div>
  )

  if (!booking || booking.error) return (
    <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 440, margin: '0 auto' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 16, color: 'var(--sf-border)' }}>error_outline</span>
      <p style={{ color: 'var(--sf-text-2)', marginBottom: 24, fontSize: 16 }}>Booking not found.</p>
      <button className="btn btn-dark" onClick={() => router.push('/')}>Go Home</button>
    </div>
  )

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 0 48px' }}>
      {/* ── Confirmation header ── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sf-green)', marginBottom: 6 }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--sf-text-2)', fontSize: 15 }}>Your seat is reserved and waiting for you.</p>
      </div>

      {/* ── Booking detail card ── */}
      <div className="card card-p" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 14 }}>
          {[
            { icon: '🏛', label: 'Centre',      value: booking.centre?.name },
            { icon: '💺', label: 'Seat',         value: `${booking.seat?.label} (${booking.seat?.seatType})` },
            { icon: '📅', label: 'Date',         value: new Date(booking.bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
            { icon: '⏰', label: 'Shift',        value: `${booking.shift?.name} · ${booking.shift?.startTime} – ${booking.shift?.endTime}` },
            { icon: '💳', label: 'Amount Paid',  value: `₹${booking.amount}` },
            { icon: '🆔', label: 'Booking ID',   value: booking.id.slice(0, 12).toUpperCase() },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--sf-border)' }}>
              <span style={{ color: 'var(--sf-text-2)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.icon} {row.label}
              </span>
              <span style={{ fontWeight: 600, fontSize: 14, textAlign: 'right', maxWidth: '55%', color: 'var(--sf-text-1)' }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── QR code ── */}
      <div className="card card-p" style={{ textAlign: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: 'var(--sf-text-3)', marginBottom: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Show this at entry
        </p>
        <div style={{ width: 160, height: 160, margin: '0 auto 12px', background: 'white', borderRadius: 12, padding: 12, border: '1px solid var(--sf-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '100%', height: '100%',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='30' height='30' fill='%23000'/%3E%3Crect x='15' y='15' width='20' height='20' fill='%23fff'/%3E%3Crect x='20' y='20' width='10' height='10' fill='%23000'/%3E%3Crect x='60' y='10' width='30' height='30' fill='%23000'/%3E%3Crect x='65' y='15' width='20' height='20' fill='%23fff'/%3E%3Crect x='70' y='20' width='10' height='10' fill='%23000'/%3E%3Crect x='10' y='60' width='30' height='30' fill='%23000'/%3E%3Crect x='15' y='65' width='20' height='20' fill='%23fff'/%3E%3Crect x='20' y='70' width='10' height='10' fill='%23000'/%3E%3Crect x='45' y='45' width='10' height='10' fill='%23000'/%3E%3Crect x='60' y='60' width='10' height='10' fill='%23000'/%3E%3Crect x='75' y='45' width='10' height='10' fill='%23000'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
          }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--sf-text-3)' }}>
          Ref: <strong style={{ color: 'var(--sf-text-2)' }}>{booking.qrCode}</strong>
        </p>
      </div>

      {/* ── WhatsApp notice ── */}
      <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.22)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d' }}>
        📱 WhatsApp confirmation sent to your registered number
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => router.push('/my-bookings')}>My Bookings</button>
        <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => router.push('/')}>Back to Home</button>
      </div>
    </div>
  )
}
