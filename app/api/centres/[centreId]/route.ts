import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ centreId: string }> }) {
  const { centreId } = await params
  const centre = await prisma.centre.findUnique({
    where: { id: centreId },
    include: {
      shifts: { where: { isActive: true } },
      pricingPlans: { where: { isActive: true } },
    },
  })
  if (!centre) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    ...centre,
    amenities: JSON.parse(centre.amenities),
    photos: JSON.parse(centre.photos),
  })
}
