// Seed using @libsql/client directly — avoids Prisma 7 adapter ESM/CJS issues in tsx
import { createClient } from '@libsql/client'

const client = createClient({ url: 'file:./prisma/dev.db' })

async function run(sql: string, args: any[] = []) {
  await client.execute({ sql, args })
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── Centre ──
  await run(`INSERT OR IGNORE INTO "Centre" (id, name, address, city, totalSeats, openTime, closeTime, amenities, photos, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`, [
    'centre-studyhub-01', 'StudyHub Koramangala',
    '5th Block, Koramangala, Bengaluru', 'Bengaluru', 40,
    '06:00', '22:00',
    JSON.stringify(['AC', 'WiFi', 'Printing', 'Lockers', 'Charging Points']),
    JSON.stringify([]),
  ])
  console.log('✅ Centre created')

  // ── Shifts ──
  await run(`INSERT OR IGNORE INTO "Shift" (id, centreId, name, startTime, endTime, shiftType, isActive, createdAt)
    VALUES (?, 'centre-studyhub-01', ?, ?, ?, ?, 1, datetime('now'))`, ['shift-morning-01', 'Morning', '06:00', '14:00', 'morning'])
  await run(`INSERT OR IGNORE INTO "Shift" (id, centreId, name, startTime, endTime, shiftType, isActive, createdAt)
    VALUES (?, 'centre-studyhub-01', ?, ?, ?, ?, 1, datetime('now'))`, ['shift-evening-01', 'Evening', '14:00', '22:00', 'evening'])
  console.log('✅ Shifts created')

  // ── Pricing Plans ──
  await run(`INSERT OR IGNORE INTO "PricingPlan" (id, centreId, name, planType, price, isActive, createdAt)
    VALUES (?, 'centre-studyhub-01', ?, ?, ?, 1, datetime('now'))`, ['plan-per-shift-01', 'Single Shift', 'per_shift', 60.0])
  await run(`INSERT OR IGNORE INTO "PricingPlan" (id, centreId, name, planType, price, isActive, createdAt)
    VALUES (?, 'centre-studyhub-01', ?, ?, ?, 1, datetime('now'))`, ['plan-daily-01', 'Full Day', 'daily', 100.0])
  await run(`INSERT OR IGNORE INTO "PricingPlan" (id, centreId, name, planType, price, isActive, createdAt)
    VALUES (?, 'centre-studyhub-01', ?, ?, ?, 1, datetime('now'))`, ['plan-monthly-01', 'Monthly', 'monthly', 1200.0])
  console.log('✅ Pricing plans created')

  // ── 40 Seats: A1–D10 ──
  const rows = ['A', 'B', 'C', 'D']
  for (let r = 0; r < rows.length; r++) {
    for (let c = 1; c <= 10; c++) {
      const label = `${rows[r]}${c}`
      const seatType = c === 1 || c === 10 ? 'window' : c === 5 || c === 6 ? 'corner' : 'standard'
      await run(`INSERT OR IGNORE INTO "Seat" (id, centreId, label, seatType, status, rowNumber, colNumber, createdAt)
        VALUES (?, 'centre-studyhub-01', ?, ?, 'available', ?, ?, datetime('now'))`,
        [`seat-${rows[r]}${c}`, label, seatType, r, c - 1])
    }
  }
  console.log('✅ 40 seats created (A1–D10)')

  // ── Users ──
  await run(`INSERT OR IGNORE INTO "User" (id, name, phone, role, centreId, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, 'centre_admin', 'centre-studyhub-01', 1, datetime('now'), datetime('now'))`,
    ['user-admin-01', 'Admin User', '+919999000001'])
  await run(`INSERT OR IGNORE INTO "User" (id, name, phone, role, isActive, createdAt, updatedAt)
    VALUES (?, ?, ?, 'member', 1, datetime('now'), datetime('now'))`,
    ['user-member-01', 'Test Student', '+919999000002'])
  console.log('✅ Users created')

  // ── Demo Bookings (today, morning shift, first 3 seats) ──
  const today = new Date().toISOString().split('T')[0]
  for (let i = 1; i <= 3; i++) {
    const row = rows[Math.floor((i - 1) / 10)]
    const col = ((i - 1) % 10) + 1
    const seatId = `seat-${row}${col}`
    await run(`INSERT OR IGNORE INTO "Booking"
      (id, userId, seatId, centreId, shiftId, pricingPlanId, bookingDate, status, paymentStatus, amount, qrCode, isWalkIn, createdAt, updatedAt)
      VALUES (?, 'user-member-01', ?, 'centre-studyhub-01', 'shift-morning-01', 'plan-per-shift-01', ?, 'confirmed', 'paid', 60.0, ?, 0, datetime('now'), datetime('now'))`,
      [`demo-booking-0${i}`, seatId, today, `QR-DEMO-${i}`])
  }
  console.log('✅ Demo bookings created')

  console.log('\n🎉 Seed complete!')
  console.log('   Admin  : +919999000001  (OTP: 123456)')
  console.log('   Member : +919999000002  (OTP: 123456)')
  console.log('   Centre : centre-studyhub-01')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => client.close())
