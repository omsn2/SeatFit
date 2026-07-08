import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CENTRE_ID = 'centre-studyhub-01'

export async function GET(req: NextRequest) {
  const today = new Date().toISOString().split('T')[0]

  const [totalSeats, shifts] = await Promise.all([
    prisma.seat.count({ where: { centreId: CENTRE_ID, status: { not: 'removed' } } }),
    prisma.shift.findMany({ where: { centreId: CENTRE_ID, isActive: true } }),
  ])

  const occupancy = await Promise.all(
    shifts.map(async (shift) => {
      const booked = await prisma.booking.count({
        where: { centreId: CENTRE_ID, shiftId: shift.id, bookingDate: today, status: 'confirmed' },
      })
      return { shiftId: shift.id, shiftName: shift.name, booked, total: totalSeats }
    })
  )

  const revenue = await prisma.booking.aggregate({
    where: { centreId: CENTRE_ID, bookingDate: today, paymentStatus: 'paid' },
    _sum: { amount: true },
  })

  const recentBookings = await prisma.booking.findMany({
    where: { centreId: CENTRE_ID },
    include: { user: true, seat: true, shift: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({ occupancy, revenueToday: revenue._sum.amount ?? 0, recentBookings })
}
