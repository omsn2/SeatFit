'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import OTPModal from '@/components/OTPModal'
import PaymentModal from '@/components/PaymentModal'
import { CentreAPI, BookingAPI, getStoredUser, type CentreDetail, type SeatAvailability, type Shift, type PricingPlan } from '@/lib/api'

type Step = 'datetime' | 'seats' | 'summary'

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
function fmtDateParts(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).split(' ')
}

export default function BookPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showOTP, setShowOTP] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [step, setStep] = useState<Step>('datetime')
  const [centre, setCentre] = useState<CentreDetail | null>(null)
  const [centreError, setCentreError] = useState(false)

  const dates = getDates()
  const [selectedDate, setSelectedDate] = useState(dates[0])
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)

  const [seats, setSeats] = useState<SeatAvailability[]>([])
  const [selectedSeat, setSelectedSeat] = useState<SeatAvailability | null>(null)
  const [lockId, setLockId] = useState<string | null>(null)
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null)
  const [lockTimer, setLockTimer] = useState<number>(0)
  const [loadingSeats, setLoadingSeats] = useState(false)
  const [lockingId, setLockingId] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load user from storage
  useEffect(() => {
    const stored = getStoredUser()
    if (stored) setUser(stored)
  }, [])

  // Load first centre dynamically (fetches real UUID from DB)
  useEffect(() => {
    CentreAPI.list()
      .then(centres => {
        if (!centres.length) { setCentreError(true); return }
        const c = centres[0]
        setCentre(c)
        if (c.shifts?.length) setSelectedShift(c.shifts[0])
        if (c.pricingPlans?.length) setSelectedPlan(c.pricingPlans[0])
      })
      .catch(() => setCentreError(true))
  }, [])

  // Lock countdown timer
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
    if (!selectedShift || !centre) return
    setLoadingSeats(true)
    try {
      const data = await CentreAPI.seats(centre.id, selectedShift.id, selectedDate)
      setSeats(data)
    } finally { setLoadingSeats(false) }
  }

  const releaseLock = () => {
    // Locks expire automatically after TTL — no need to delete
    setLockId(null); setLockExpiry(null); setSelectedSeat(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleSeatClick = async (seat: SeatAvailability) => {
    if (seat.availability !== 'available') return
    if (!user) { setShowOTP(true); return }
    setLockingId(seat.id)
    try {
      const lock = await BookingAPI.lock(seat.id, selectedShift!.id, selectedDate)
      setLockId(lock.lockId as any)
      setLockExpiry(new Date(lock.expiresAt))
      setSelectedSeat(seat)
    } catch (e: any) {
      alert(e.message || 'Seat just taken! Please pick another.')
      await loadSeats()
    } finally { setLockingId(null) }
  }

  const goToSeats = () => {
    if (!selectedShift) return
    setStep('seats')
    loadSeats()
  }

  const handleLoginSuccess = (u: any) => {
    setUser(u)
    setShowOTP(false)
  }

  const handlePaymentSuccess = (bookingId: string) => {
    setShowPayment(false)
    router.push(`/bookings/${bookingId}`)
  }

  const fmtTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const rows = seats.reduce<Record<number, SeatAvailability[]>>((acc, s) => {
    if (!acc[s.rowNumber]) acc[s.rowNumber] = []
    acc[s.rowNumber].push(s)
    return acc
  }, {})

  const stepNum = step === 'datetime' ? 1 : step === 'seats' ? 2 : 3
  const availCount = seats.filter(s => s.availability === 'available').length

  return (
    <>
      {showOTP && <OTPModal onSuccess={handleLoginSuccess} onClose={() => setShowOTP(false)} />}
      {showPayment && selectedSeat && selectedShift && selectedPlan && centre && (
        <PaymentModal
          seat={selectedSeat}
          shift={selectedShift}
          date={selectedDate}
          plan={selectedPlan}
          centreId={centre.id}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Page title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 14, color: 'var(--sf-text-2)' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sf-text-2)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>home</span>
            Hub
          </button>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
          <span style={{ color: 'var(--sf-blue)', fontWeight: 600 }}>Book a Spot</span>
        </div>
        <h1 className="text-headline-lg" style={{ color: 'var(--sf-text-1)' }}>Book a Spot</h1>
        <p style={{ fontSize: 15, color: 'var(--sf-text-2)', marginTop: 4 }}>
          {centreError ? '⚠️ Could not load centre data. Is the backend running?' : `${centre?.name ?? 'Loading...'}`}
        </p>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, gap: 0 }}>
        {[{ n: 1, label: 'Date & Shift' }, { n: 2, label: 'Pick Seat' }, { n: 3, label: 'Confirm' }].map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className={`step-dot ${stepNum === s.n ? 'step-active' : stepNum > s.n ? 'step-done' : 'step-idle'}`}>
                {stepNum > s.n ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span> : s.n}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', color: stepNum === s.n ? 'var(--sf-blue)' : 'var(--outline)' }}>{s.label}</span>
            </div>
            {i < 2 && (
              <div style={{ width: 80, height: 2, background: stepNum > s.n ? '#16a34a' : 'var(--sf-border)', margin: '0 8px', marginBottom: 18, borderRadius: 1, transition: 'background 0.3s' }} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Date + Shift ── */}
      {step === 'datetime' && (
        <div className="animate-in">
          <h2 className="text-headline-sm" style={{ marginBottom: 4 }}>Choose a Date & Shift</h2>
          <p style={{ fontSize: 14, color: 'var(--sf-text-2)', marginBottom: 24 }}>Select when you want to study</p>

          {/* Date strip */}
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 32, scrollbarWidth: 'none' }}>
            {dates.map(d => {
              const parts = fmtDateParts(d)
              const active = d === selectedDate
              return (
                <button key={d} onClick={() => setSelectedDate(d)} className={`date-pill ${active ? 'active' : ''}`}>
                  <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2, opacity: 0.8 }}>{parts[0]}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1 }}>{parts[1]}</div>
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.75 }}>{parts[2]}</div>
                </button>
              )
            })}
          </div>

          {/* Shifts */}
          <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--sf-text-2)', letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Select Shift</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 28 }}>
            {centre?.shifts?.map((s: Shift) => {
              const active = selectedShift?.id === s.id
              const shiftIcon = s.shiftType === 'morning' ? '🌅' : s.shiftType === 'evening' ? '🌇' : '☀️'
              return (
                <button key={s.id} onClick={() => setSelectedShift(s)} className={`shift-card ${active ? 'active' : ''}`}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{shiftIcon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--sf-text-1)', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--sf-text-2)' }}>{s.startTime} – {s.endTime}</div>
                  {centre?.pricingPlans?.length > 0 && (
                    <div style={{ marginTop: 12, fontSize: 14, color: active ? 'var(--sf-blue)' : 'var(--outline)', fontWeight: 600 }}>
                      From ₹{centre.pricingPlans[0].price}
                    </div>
                  )}
                </button>
              )
            })}
            {!centre && !centreError && (
              <div style={{ padding: 24, color: 'var(--sf-text-2)', textAlign: 'center' }}>Loading shifts…</div>
            )}
          </div>

          {/* Pricing plans */}
          {(centre?.pricingPlans?.length ?? 0) > 0 && (
            <>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--sf-text-2)', letterSpacing: '0.06em', marginBottom: 14, textTransform: 'uppercase' }}>Pricing Plan</h3>
              <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {centre!.pricingPlans.map((p: PricingPlan) => {
                  const active = selectedPlan?.id === p.id
                  return (
                    <button key={p.id} onClick={() => setSelectedPlan(p)} style={{
                      padding: '12px 20px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                      background: active ? 'var(--sf-surface-low)' : 'var(--sf-card)',
                      border: `2px solid ${active ? 'var(--sf-blue)' : 'var(--sf-border)'}`,
                      display: 'flex', alignItems: 'baseline', gap: 6
                    }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--sf-blue)' }}>₹{p.price}</span>
                      <span style={{ fontSize: 13, color: 'var(--sf-text-2)', fontWeight: 500 }}>/ {p.name}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <button className="btn btn-dark btn-full btn-lg" disabled={!selectedShift || !centre} onClick={goToSeats}>
            View Available Seats
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward</span>
          </button>
        </div>
      )}

      {/* ── STEP 2: Seat Map ── */}
      {step === 'seats' && (
        <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Map area */}
          <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--sf-text-2)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
                Floor Plan
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
                <span style={{ color: 'var(--sf-blue)', fontWeight: 600 }}>{centre?.name}</span>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                {[
                  { cls: 'seat-available', label: 'Available' },
                  { cls: 'seat-booked',    label: 'Occupied' },
                  { cls: 'seat-selected',  label: 'Selected' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className={`seat ${l.cls}`} style={{ width: 16, height: 16, fontSize: 0, borderRadius: 4 }} />
                    <span style={{ fontSize: 12, color: 'var(--sf-text-2)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--sf-text-2)', marginBottom: 12 }}>
              {fmtDate(selectedDate)} · {selectedShift?.name} ({selectedShift?.startTime} – {selectedShift?.endTime})
              {availCount > 0 && <span style={{ marginLeft: 12, color: '#16a34a', fontWeight: 600 }}>● {availCount} available</span>}
            </div>

            {/* Seat map card */}
            <div className="card" style={{ padding: 24, background: 'var(--sf-surface-low)' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--sf-blue)', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--primary-fixed)', padding: '4px 16px', borderRadius: 999 }}>
                  Floor-to-Ceiling Windows
                </span>
              </div>

              {loadingSeats ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--sf-text-2)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.4 }}>chair</span>
                  Loading seats...
                </div>
              ) : (
                <>
                  {Object.keys(rows).sort((a, b) => +a - +b).map(rowKey => {
                    const rowSeats = rows[+rowKey].sort((a, b) => a.colNumber - b.colNumber)
                    const rowLabel = ['A', 'B', 'C', 'D', 'E', 'F'][+rowKey - 1] ?? rowKey
                    return (
                      <div key={rowKey} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: 'var(--outline)', width: 18, fontWeight: 700, textAlign: 'center' }}>{rowLabel}</span>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {rowSeats.map(seat => {
                            const isSelected = selectedSeat?.id === seat.id
                            const isLocking = lockingId === seat.id
                            const cls = isSelected ? 'seat-selected' : `seat-${seat.availability}`
                            return (
                              <button
                                key={seat.id}
                                className={`seat ${cls}`}
                                title={`${seat.label} (${seat.seatType})`}
                                disabled={seat.availability !== 'available' || !!lockingId}
                                onClick={() => handleSeatClick(seat)}
                              >
                                {isLocking ? '⏳' : seat.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}

                  <div style={{ textAlign: 'center', margin: '16px 0', fontSize: 11, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    — Main Walkway —
                  </div>
                </>
              )}

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--sf-text-2)', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'var(--sf-surface-container)', padding: '4px 16px', borderRadius: 999 }}>
                  🚪 Entry
                </span>
              </div>
            </div>

            <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => setStep('datetime')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
              Change Date / Shift
            </button>
          </div>

          {/* Right panel — seat detail */}
          <div className="card card-p" style={{ position: 'sticky', top: 20 }}>
            {selectedSeat ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <span style={{ background: 'var(--sf-surface-low)', color: '#16a34a', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(22,163,74,0.25)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                    Available Now
                  </span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--sf-text-1)', letterSpacing: '-0.5px', marginBottom: 6 }}>
                  SPOT {selectedSeat.label}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--sf-text-2)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>location_on</span>
                  {centre?.name} · {selectedSeat.seatType?.replace('_', ' ')}
                </p>

                {/* Duration selection */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--sf-text-2)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Date & Duration</p>
                  <div style={{ display: 'flex', background: 'var(--sf-surface-container)', borderRadius: 8, padding: 4, gap: 4, marginBottom: 12 }}>
                    {centre?.pricingPlans?.map((plan, i) => {
                      const active = selectedPlan?.id === plan.id
                      return (
                        <button key={plan.id} onClick={() => setSelectedPlan(plan)} style={{
                          flex: 1, padding: '8px 4px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                          background: active ? 'var(--sf-card)' : 'transparent',
                          color: active ? 'var(--sf-text-1)' : 'var(--sf-text-2)',
                          boxShadow: active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                        }}>{plan.name}</button>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--sf-text-2)' }}>
                    📅 {fmtDate(selectedDate)} · {selectedShift?.startTime} – {selectedShift?.endTime}
                  </div>
                </div>

                {/* Timer */}
                {lockTimer > 0 && (
                  <div style={{
                    background: lockTimer < 120 ? 'rgba(220,38,38,0.08)' : 'rgba(254,166,25,0.1)',
                    border: `1px solid ${lockTimer < 120 ? 'rgba(220,38,38,0.3)' : 'rgba(254,166,25,0.3)'}`,
                    borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--sf-text-2)' }}>⏱ Seat held for</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: lockTimer < 120 ? '#dc2626' : '#b45309', fontVariantNumeric: 'tabular-nums' }}>
                      {fmtTimer(lockTimer)}
                    </span>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full btn-lg"
                  style={{ borderRadius: 10 }}
                  disabled={!user || lockTimer === 0}
                  onClick={() => { if (!user) setShowOTP(true); else setShowPayment(true) }}
                >
                  {!user ? '🔐 Login to Continue' : `Confirm Spot Reservation →`}
                </button>
                <p style={{ fontSize: 12, color: 'var(--sf-text-2)', textAlign: 'center', marginTop: 8 }}>
                  By confirming, you agree to the Centre Code of Conduct.
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--sf-border)', display: 'block', marginBottom: 12 }}>
                  touch_app
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--sf-text-1)', marginBottom: 6 }}>Select a Spot</p>
                <p style={{ fontSize: 13, color: 'var(--sf-text-2)' }}>
                  Click on any available seat on the map to see details and book.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
