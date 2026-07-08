import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ centreId: string }> }) {
  const { centreId } = await params
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date')
  const shiftId = searchParams.get('shiftId')

  if (!date || !shiftId) {
    return NextResponse.json({ error: 'date and shiftId are required' }, { status: 400 })
  }

  // Purge expired locks
  await prisma.seatLock.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  const seats = await prisma.seat.findMany({
    where: { centreId, status: { not: 'removed' } },
    orderBy: [{ rowNumber: 'asc' }, { colNumber: 'asc' }],
  })

  const bookedSeatIds = new Set(
    (
      await prisma.booking.findMany({
        where: { centreId, shiftId, bookingDate: date, status: { in: ['confirmed', 'pending'] } },
        select: { seatId: true },
      })
    ).map((b) => b.seatId)
  )

  const lockedSeatIds = new Set(
    (
      await prisma.seatLock.findMany({
        where: { shiftId, lockDate: date, expiresAt: { gt: new Date() } },
        select: { seatId: true },
      })
    ).map((l) => l.seatId)
  )

  const result = seats.map((seat) => ({
    ...seat,
    availability:
      seat.status === 'blocked'
        ? 'blocked'
        : bookedSeatIds.has(seat.id)
        ? 'booked'
        : lockedSeatIds.has(seat.id)
        ? 'locked'
        : 'available',
  }))

  return NextResponse.json(result)
}
