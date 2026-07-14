'use client'
import { useState } from 'react'
import { BookingAPI, getStoredUser } from '@/lib/api'

type Phase = 'choose' | 'processing' | 'success' | 'error'

export default function PaymentModal({ seat, shift, date, plan, centreId, onSuccess, onClose }: {
  seat: any; shift: any; date: string; plan: any
  centreId: string
  onSuccess: (bookingId: string) => void
  onClose: () => void
}) {
  const [phase, setPhase] = useState<Phase>('choose')
  const [method, setMethod] = useState<'upi' | 'card'>('upi')
  const [error, setError] = useState('')

  const handlePay = async () => {
    setPhase('processing')
    // Simulate payment gateway delay
    await new Promise(r => setTimeout(r, 1800))

    try {
      const booking = await BookingAPI.create({
        seatId: seat.id,
        shiftId: shift.id,
        date,
        centreId,
        pricingPlanId: plan.id,
        walkIn: false,
      })
      setPhase('success')
      setTimeout(() => onSuccess((booking as any).id), 1200)
    } catch (e: any) {
      setError(e.message || 'Payment failed')
      setPhase('error')
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && phase === 'choose' && onClose()}>
      <div className="modal-box" style={{ maxWidth: 440 }}>

        {phase === 'choose' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700 }}>Complete Payment</h2>
                <p style={{ fontSize: 13, color: 'var(--sf-text-3)', marginTop: 2 }}>Booking will be confirmed instantly</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sf-text-3)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            {/* Order summary */}
            <div style={{ background: 'var(--sf-surface-low)', border: '1px solid var(--sf-border)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--sf-text-2)' }}>Seat {seat.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>₹{plan.price}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--sf-text-3)' }}>
                {shift.name} · {shift.startTime}–{shift.endTime} · {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
              <div style={{ borderTop: '1px solid var(--sf-border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                <span>Total</span><span style={{ color: 'var(--sf-blue)' }}>₹{plan.price}</span>
              </div>
            </div>

            {/* Payment method tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {(['upi', 'card'] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)} style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: 14,
                  background: method === m ? 'var(--sf-sidebar-active)' : 'var(--sf-bg)',
                  border: `2px solid ${method === m ? 'var(--sf-blue)' : 'var(--sf-border)'}`,
                  color: method === m ? "var(--sf-blue-dim)" : 'var(--sf-text-2)',
                }}>
                  {m === 'upi' ? '📱 UPI' : '💳 Card'}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: 'var(--sf-text-2)', marginBottom: 8 }}>UPI ID</p>
                <input className="sf-input" defaultValue="yourupi@okaxis" style={{ flex: 1 }} />
                <p style={{ fontSize: 11, color: 'var(--sf-text-3)', marginTop: 8 }}>🎭 Demo mode — no real charge</p>
              </div>
            )}

            {method === 'card' && (
              <div style={{ background: 'var(--sf-bg)', border: '1px solid var(--sf-border)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <input className="sf-input" placeholder="Card number" defaultValue="4111 1111 1111 1111" style={{ marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="sf-input" placeholder="MM/YY" defaultValue="12/28" />
                  <input className="sf-input" placeholder="CVV" defaultValue="123" />
                </div>
                <p style={{ fontSize: 11, color: 'var(--sf-text-3)', marginTop: 8 }}>🎭 Demo mode — no real charge</p>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 16 }} onClick={handlePay}>
              Pay ₹{plan.price} →
            </button>
          </>
        )}

        {phase === 'processing' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Processing Payment...</h3>
            <p style={{ color: 'var(--sf-text-3)', fontSize: 14 }}>Please wait, confirming your seat</p>
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {phase === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 60, marginBottom: 16, animation: 'bounceIn 0.5s ease' }}>✅</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>Payment Successful!</h3>
            <p style={{ color: 'var(--sf-text-2)', fontSize: 14 }}>Redirecting to your booking...</p>
            <style>{`@keyframes bounceIn { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }`}</style>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Payment Failed</h3>
            <p style={{ color: 'var(--sf-text-2)', fontSize: 13, marginBottom: 20 }}>{error}</p>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setPhase('choose')}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  )
}
