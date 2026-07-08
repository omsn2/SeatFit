import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeatFit — Book Your Study Seat',
  description: 'Reserve your preferred seat at StudyHub Koramangala. Morning, Evening & Full Day shifts.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
