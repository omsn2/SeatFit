import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Dummy payment confirm — simulates Razorpay webhook behaviour
export async function POST(req: NextRequest) {
  const { lockId, seatId, shiftId, date, userId, centreId, pricingPlanId, amount } = await req.json()

  // Generate QR code token
  const qrCode = `SF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        seatId,
        centreId,
        shiftId,
        pricingPlanId,
        bookingDate: date,
        status: 'confirmed',
        paymentStatus: 'paid',
        amount,
        qrCode,
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount,
        method: 'upi',
        status: 'captured',
        paidAt: new Date(),
      },
    })

    // Release seat lock
    if (lockId) {
      await prisma.seatLock.deleteMany({ where: { id: lockId } })
    }

    console.log(`[MOCK WHATSAPP] Booking confirmed! ID: ${booking.id}, QR: ${qrCode}`)

    return NextResponse.json({ success: true, bookingId: booking.id, qrCode })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Seat was just booked by someone else' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}
