'use client'
import { useRef, useState } from 'react'
import { AuthAPI, storeUser } from '@/lib/api'

export default function OTPModal({ onSuccess, onClose }: {
  onSuccess: (user: { token: string; role: string; phone: string }) => void
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
    try {
      await AuthAPI.sendOtp(phone)
      setPhase('otp')
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
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
    try {
      const data = await AuthAPI.verifyOtp(phone, code)
      const user = { token: data.accessToken, role: data.role, phone }
      storeUser(user)
      onSuccess(user)
    } catch (e: any) {
      setError(e.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--sf-text-1)' }}>{phase === 'phone' ? 'Sign In to SeatFit' : 'Enter OTP'}</h2>
            <p style={{ fontSize: 13, color: 'var(--sf-text-2)', marginTop: 4 }}>
              {phase === 'phone' ? 'No password needed. Enter your phone.' : `Code sent to ${phone}`}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--sf-text-2)', cursor: 'pointer', fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {phase === 'phone' ? (
          <>
            <input className="sf-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210" style={{ marginBottom: 14 }} />
            <div style={{ background: 'var(--sf-surface-low)', border: '1px solid var(--sf-border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: 'var(--sf-text-2)' }}>
              💡 <strong>Demo:</strong> Any phone works. OTP is always <strong style={{ color: 'var(--sf-blue)' }}>123456</strong>.<br />
              Admin: <strong>+919999000001</strong>
            </div>
            {error && <p style={{ color: 'var(--sf-error)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button className="btn btn-primary btn-full" style={{ padding: 14 }} disabled={loading || phone.length < 10} onClick={sendOTP}>
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
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--sf-text-2)', marginBottom: 16 }}>
              Demo OTP: <strong style={{ color: 'var(--sf-blue)' }}>123456</strong>
            </div>
            {error && <p style={{ color: 'var(--sf-error)', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button className="btn btn-primary btn-full" style={{ padding: 14 }}
              disabled={loading || otp.join('').length < 6} onClick={verifyOTP}>
              {loading ? 'Verifying...' : 'Verify & Continue →'}
            </button>
            <button className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={() => { setPhase('phone'); setOtp(['','','','','','']); setError('') }}>
              ← Change number
            </button>
          </>
        )}
      </div>
    </div>
  )
}
