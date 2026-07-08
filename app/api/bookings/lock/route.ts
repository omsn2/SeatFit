import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { seatId, shiftId, date, userId } = await req.json()
  if (!seatId || !shiftId || !date || !userId) {
    return NextResponse.json({ error: 'seatId, shiftId, date, userId required' }, { status: 400 })
  }

  // Purge expired locks
  await prisma.seatLock.deleteMany({ where: { expiresAt: { lt: new Date() } } })

  // Check no active booking
  const existing = await prisma.booking.findUnique({
    where: { seatId_shiftId_bookingDate: { seatId, shiftId, bookingDate: date } },
  })
  if (existing) return NextResponse.json({ error: 'Seat already booked' }, { status: 409 })

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  try {
    const lock = await prisma.seatLock.create({
      data: { seatId, userId, shiftId, lockDate: date, expiresAt },
    })
    return NextResponse.json({ lockId: lock.id, expiresAt: lock.expiresAt })
  } catch {
    return NextResponse.json({ error: 'Seat just locked by another user' }, { status: 409 })
  }
}

export async function DELETE(req: NextRequest) {
  const { lockId } = await req.json()
  await prisma.seatLock.deleteMany({ where: { id: lockId } })
  return NextResponse.json({ success: true })
}
