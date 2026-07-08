import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { seat: true, shift: true, centre: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(bookings)
}
