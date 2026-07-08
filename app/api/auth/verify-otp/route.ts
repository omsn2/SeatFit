import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json()
  if (!phone || !otp) return NextResponse.json({ error: 'Phone and OTP required' }, { status: 400 })

  // Mock verification: OTP must be 123456
  if (otp !== '123456') {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 })
  }

  // Upsert user by phone
  let user = await prisma.user.findUnique({ where: { phone } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Student',
        phone,
        role: 'member',
      },
    })
  }

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, phone: user.phone, role: user.role, centreId: user.centreId },
  })
}
