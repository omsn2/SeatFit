'use client'
import { useRef, useState } from 'react'

export default function OTPModal({ onSuccess, onClose }: {
  onSuccess: (user: any) => void
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('+91')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const sendOTP = async () => {
    setError(''); setLoading(true)
    await fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) })
    setLoading(false); setPhase('otp')
  }

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) inputRefs.current[i + 1]?.focus()
    if (!val && i > 0) inputRefs.current[i - 1]?.focus()
  }

  const verifyOTP = async () => {
    setError(''); setLoading(true)
    const code = otp.join('')
    const r = await fetch('/api/auth/verify-otp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp: code }),
    })
    const data = await r.json()
    setLoading(false)
    if (!r.ok) { setError(data.error || 'Invalid OTP'); return }
    onSuccess(data.user)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{phase === 'phone' ? 'Login / Sign Up' : 'Enter OTP'}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
              {phase === 'phone' ? 'No password needed' : `Sent to ${phone}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        {phase === 'phone' ? (
          <>
            <input className="sf-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210" style={{ marginBottom: 16 }} />
            {/* Demo hint */}
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#a5b4fc' }}>
              💡 <strong>Demo:</strong> Any phone works. OTP is always <strong>123456</strong>.<br />
              Admin login: <strong>+919999000001</strong>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button className="btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading || phone.length < 10} onClick={sendOTP}>
              {loading ? 'Sending...' : 'Send OTP →'}
            </button>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {otp.map((v, i) => (
                <input key={i} ref={el => { inputRefs.current[i] = el }}
                  className="otp-box" type="text" inputMode="numeric" maxLength={1} value={v}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !v && i > 0) inputRefs.current[i - 1]?.focus() }}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
              Demo OTP: <strong style={{ color: 'var(--primary)' }}>123456</strong>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button className="btn-primary" style={{ width: '100%', padding: 14 }}
              disabled={loading || otp.join('').length < 6} onClick={verifyOTP}>
              {loading ? 'Verifying...' : 'Verify & Continue →'}
            </button>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 10 }} onClick={() => { setPhase('phone'); setOtp(['','','','','','']); setError('') }}>
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  )
}
