import { NextRequest, NextResponse } from 'next/server'

// Mock OTP store (in-memory for prototype)
export const otpStore = new Map<string, string>()

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })
  // In prototype, OTP is always 123456
  otpStore.set(phone, '123456')
  console.log(`[MOCK OTP] Phone: ${phone} → OTP: 123456`)
  return NextResponse.json({ success: true, message: 'OTP sent (demo: use 123456)' })
}
