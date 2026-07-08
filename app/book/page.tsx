'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import OTPModal from '@/components/OTPModal'
import PaymentModal from '@/components/PaymentModal'

const CENTRE_ID = 'centre-studyhub-01'

type Step = 'datetime' | 'seats' | 'summary'
type SeatStatus = 'available' | 'booked' | 'locked' | 'blocked' | 'selected'

interface SeatData { id: string; label: string; seatType: string; rowNumber: number; colNumber: number; availability: SeatStatus }
interface ShiftData { id: string; name: string; startTime: string; endTime: string; shiftType: string }
interface PlanData  { id: string; name: string; planType: string; price: number }

function getDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}
function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function BookPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showOTP, setShowOTP] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [step, setStep] = useState<Step>('datetime')
  const [centre, setCentre] = useState<any>(null)

  // Date + shift selection
  const dates = getDates()
  const [selectedDate, setSelectedDate] = useState(dates[0])
  const [selectedShift, setSelectedShift] = useState<ShiftData | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null)

  // Seat selection
  const [seats, setSeats] = useState<SeatData[]>([])
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null)
  const [lockId, setLockId] = useState<string | null>(null)
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null)
  const [lockTimer, setLockTimer] = useState<number>(0)
  const [loadingSeats, setLoadingSeats] = useState(false)
  const [lockingId, setLockingId] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('sf_user')
    if (stored) setUser(JSON.parse(stored))
    fetch(`/api/centres/${CENTRE_ID}`).then(r => r.json()).then(d => {
      setCentre(d)
      if (d.shifts?.length) setSelectedShift(d.shifts[0])
      if (d.pricingPlans?.length) setSelectedPlan(d.pricingPlans[0])
    })
  }, [])

  // Timer countdown
  useEffect(() => {
    if (!lockExpiry) { setLockTimer(0); return }
    const tick = () => {
      const secs = Math.max(0, Math.floor((lockExpiry.getTime() - Date.now()) / 1000))
      setLockTimer(secs)
      if (secs === 0) releaseLock()
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [lockExpiry])

  const loadSeats = async () => {
    if (!selectedShift) return
    setLoadingSeats(true)
    try {
      const r = await fetch(`/api/centres/${CENTRE_ID}/availability?date=${selectedDate}&shiftId=${selectedShift.id}`)
      const data = await r.json()
      setSeats(data)
    } finally { setLoadingSeats(false) }
  }

  const releaseLock = async () => {
    if (lockId) { await fetch('/api/bookings/lock', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lockId }) }) }
    setLockId(null); setLockExpiry(null); setSelectedSeat(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleSeatClick = async (seat: SeatData) => {
    if (seat.availability !== 'available') return
    if (!user) { setShowOTP(true); return }

    // Release previous lock
    if (lockId) await releaseLock()

    setLockingId(seat.id)
    try {
      const r = await fetch('/api/bookings/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatId: seat.id, shiftId: selectedShift!.id, date: selectedDate, userId: user.id }),
      })
      if (!r.ok) { alert('Seat just taken! Please pick another.'); await loadSeats(); return }
      const { lockId: lid, expiresAt } = await r.json()
      setLockId(lid)
      setLockExpiry(new Date(expiresAt))
      setSelectedSeat(seat)
      setStep('summary')
    } finally { setLockingId(null) }
  }

  const goToSeats = () => {
    if (!selectedShift) return
    setStep('seats')
    loadSeats()
  }

  const handleLoginSuccess = (u: any) => {
    setUser(u)
    localStorage.setItem('sf_user', JSON.stringify(u))
    setShowOTP(false)
  }

  const handlePaymentSuccess = (bookingId: string) => {
    setShowPayment(false)
    router.push(`/bookings/${bookingId}`)
  }

  const fmtTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const rows = seats.reduce<Record<number, SeatData[]>>((acc, s) => {
    if (!acc[s.rowNumber]) acc[s.rowNumber] = []
    acc[s.rowNumber].push(s)
    return acc
  }, {})

  const stepNum = step === 'datetime' ? 1 : step === 'seats' ? 2 : 3

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {showOTP && <OTPModal onSuccess={handleLoginSuccess} onClose={() => setShowOTP(false)} />}
      {showPayment && selectedSeat && selectedShift && selectedPlan && (
        <PaymentModal
          seat={selectedSeat}
          shift={selectedShift}
          date={selectedDate}
          plan={selectedPlan}
          lockId={lockId!}
          centreId={CENTRE_ID}
          userId={user?.id}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Nav */}
      <nav style={{
        background: 'rgba(8,8,26,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60
      }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 800, fontSize: 18 }}>Seat<span style={{ color: 'var(--primary)' }}>Fit</span></span>
        {user && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>👤 {user.name}</span>}
        {!user && <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setShowOTP(true)}>Login</button>}
      </nav>

      <div style={{ maxWidth: 840, margin: '0 auto', padding: '32px 20px' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
          {[{ n: 1, label: 'Date & Shift' }, { n: 2, label: 'Pick Seat' }, { n: 3, label: 'Confirm' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div className={`step-dot ${stepNum === s.n ? 'step-active' : stepNum > s.n ? 'step-done' : 'step-idle'}`}>
                  {stepNum > s.n ? '✓' : s.n}
                </div>
                <span style={{ fontSize: 11, color: stepNum === s.n ? 'var(--primary)' : 'var(--text-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ width: 64, height: 1, background: stepNum > s.n ? 'var(--success)' : 'var(--border)', margin: '0 8px', marginBottom: 18, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Date + Shift ── */}
        {step === 'datetime' && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Choose a Date & Shift</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>Select when you want to study</p>

            {/* Date strip */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 28 }}>
              {dates.map(d => {
                const parts = fmtDate(d).split(' ')
                const active = d === selectedDate
                return (
                  <button key={d} onClick={() => setSelectedDate(d)} style={{
                    minWidth: 72, padding: '12px 8px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                    background: active ? 'var(--primary)' : 'var(--bg-card)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    color: active ? 'white' : 'var(--text-2)',
                    boxShadow: active ? '0 0 20px var(--primary-glow)' : 'none',
                    textAlign: 'center', flexShrink: 0
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>{parts[0]}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{parts[1]}</div>
                    <div style={{ fontSize: 11, opacity: 0.75 }}>{parts[2]}</div>
                  </button>
                )
              })}
            </div>

            {/* Shift cards */}
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--text-2)' }}>SELECT SHIFT</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
              {centre?.shifts?.map((s: ShiftData) => {
                const active = selectedShift?.id === s.id
                return (
                  <button key={s.id} onClick={() => setSelectedShift(s)} style={{
                    padding: '20px 24px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    background: active ? 'rgba(99,102,241,0.18)' : 'var(--bg-card)',
                    border: `2px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                    boxShadow: active ? '0 0 20px var(--primary-glow)' : 'none',
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.shiftType === 'morning' ? '🌅' : s.shiftType === 'evening' ? '🌆' : '☀️'}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)' }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{s.startTime} – {s.endTime}</div>
                    {/* Pricing for this shift */}
                    {centre?.pricingPlans?.length > 0 && (
                      <div style={{ marginTop: 12, fontSize: 13, color: active ? '#a5b4fc' : 'var(--text-3)' }}>
                        From ₹{centre.pricingPlans[0].price}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <button className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 16 }}
              disabled={!selectedShift} onClick={goToSeats}>
              View Available Seats →
            </button>
          </div>
        )}

        {/* ── STEP 2: Seat Map ── */}
        {step === 'seats' && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Pick Your Seat</h2>
              <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={() => setStep('datetime')}>← Back</button>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>
              {fmtDate(selectedDate)} · {selectedShift?.name} ({selectedShift?.startTime} – {selectedShift?.endTime})
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
              {[
                { cls: 'seat-available', label: 'Available' },
                { cls: 'seat-booked',   label: 'Booked' },
                { cls: 'seat-locked',   label: 'Held' },
                { cls: 'seat-blocked',  label: 'Blocked' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={`seat ${l.cls}`} style={{ width: 20, height: 20, fontSize: 0, borderRadius: 4 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {loadingSeats ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)' }}>Loading seats...</div>
            ) : (
              <div className="glass" style={{ padding: 24 }}>
                {/* Entry indicator */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-card)', padding: '4px 20px', borderRadius: 999, border: '1px solid var(--border)' }}>
                    🚪 ENTRY
                  </span>
                </div>
                {Object.keys(rows).sort((a, b) => +a - +b).map(rowKey => {
                  const rowSeats = rows[+rowKey].sort((a, b) => a.colNumber - b.colNumber)
                  const rowLabel = ['A', 'B', 'C', 'D'][+rowKey] ?? rowKey
                  return (
                    <div key={rowKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', width: 16, fontWeight: 600 }}>{rowLabel}</span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {rowSeats.map(seat => {
                          const isSelected = selectedSeat?.id === seat.id
                          const isLocking = lockingId === seat.id
                          const cls = isSelected ? 'seat-selected' : `seat-${seat.availability}`
                          return (
                            <button key={seat.id}
                              className={`seat ${cls}`}
                              title={`${seat.label} (${seat.seatType})`}
                              disabled={seat.availability !== 'available' || !!lockingId}
                              onClick={() => handleSeatClick(seat)}
                              style={{ position: 'relative' }}>
                              {isLocking ? '⏳' : seat.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-card)', padding: '4px 20px', borderRadius: 999, border: '1px solid var(--border)' }}>
                    🖥 BOARD / WHITEBOARD
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Summary ── */}
        {step === 'summary' && selectedSeat && selectedShift && (
          <div style={{ animation: 'slideUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>Confirm Booking</h2>
              <button className="btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }} onClick={async () => { await releaseLock(); setStep('seats') }}>
                ← Change Seat
              </button>
            </div>

            {/* Summary card */}
            <div className="glass" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'grid', gap: 16 }}>
                {[
                  { label: 'Centre', value: centre?.name ?? '—' },
                  { label: 'Seat', value: `${selectedSeat.label} (${selectedSeat.seatType})` },
                  { label: 'Date', value: fmtDate(selectedDate) },
                  { label: 'Shift', value: `${selectedShift.name} · ${selectedShift.startTime} – ${selectedShift.endTime}` },
                  { label: 'Amount', value: `₹${selectedPlan?.price ?? 60}` },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                    <span style={{ color: 'var(--text-2)', fontSize: 14 }}>{row.label}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer */}
            {lockTimer > 0 && (
              <div style={{
                background: lockTimer < 120 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                border: `1px solid ${lockTimer < 120 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                borderRadius: 12, padding: '12px 20px', marginBottom: 20,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>⏱ Seat held for</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: lockTimer < 120 ? '#ef4444' : '#f59e0b', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtTimer(lockTimer)}
                </span>
              </div>
            )}

            <button className="btn-primary" style={{ width: '100%', padding: 16, fontSize: 17 }}
              disabled={!user || lockTimer === 0}
              onClick={() => { if (!user) { setShowOTP(true) } else { setShowPayment(true) } }}>
              {!user ? '🔐 Login to Pay' : `Pay ₹${selectedPlan?.price ?? 60} →`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
