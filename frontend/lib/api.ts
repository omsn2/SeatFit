/**
 * Central API client — all calls go to the Java Spring Boot backend.
 * Base URL: http://localhost:8080/api
 *
 * Auth: JWT stored in localStorage under 'sf_user' → { token, role, phone }
 * Centre: the real UUID is fetched dynamically on first load via getCentres()
 */

export const API_BASE = 'http://localhost:8080/api'

// ─── Auth helpers ──────────────────────────────────────────────────────────

export function getStoredUser(): { token: string; role: string; phone: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('sf_user')
  return raw ? JSON.parse(raw) : null
}

export function storeUser(user: { token: string; role: string; phone: string }) {
  localStorage.setItem('sf_user', JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem('sf_user')
}

export function authHeaders(): Record<string, string> {
  const user = getStoredUser()
  if (!user?.token) return {}
  return { Authorization: `Bearer ${user.token}` }
}

// ─── Typed fetch wrapper ────────────────────────────────────────────────────

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(init?.headers as Record<string, string> | undefined),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message || body?.error || `HTTP ${res.status}`)
  }
  return res.json()
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const AuthAPI = {
  sendOtp: (phone: string) =>
    api('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (phone: string, otp: string): Promise<{ accessToken: string; refreshToken: string; role: string }> =>
    api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, otp }) }),
}

// ─── Centres ────────────────────────────────────────────────────────────────

export const CentreAPI = {
  list: (): Promise<CentreDetail[]> => api('/centres'),

  get: (centreId: string): Promise<CentreDetail> => api(`/centres/${centreId}`),

  /** seat availability map for a shift+date */
  seats: (centreId: string, shiftId: string, date: string): Promise<SeatAvailability[]> =>
    api(`/centres/${centreId}/seats?shiftId=${shiftId}&date=${date}`),
}

// ─── Bookings ───────────────────────────────────────────────────────────────

export const BookingAPI = {
  lock: (seatId: string, shiftId: string, date: string): Promise<{ lockId: string; expiresAt: string }> =>
    api('/bookings/lock', {
      method: 'POST',
      body: JSON.stringify({ seatId, shiftId, date }),
    }),

  create: (req: {
    seatId: string; shiftId: string; centreId: string
    pricingPlanId: string; date: string; walkIn?: boolean; notes?: string
  }) => api('/bookings', { method: 'POST', body: JSON.stringify(req) }),

  myBookings: (page = 0): Promise<{ content: Booking[]; totalPages: number }> =>
    api(`/bookings/my?page=${page}`),

  getById: (id: string): Promise<Booking> => api(`/bookings/${id}`),
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export const AdminAPI = {
  dashboard: () => api('/admin/dashboard'),
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CentreDetail {
  id: string
  name: string
  address: string
  city: string
  totalSeats: number
  openTime: string
  closeTime: string
  amenities: string[]
  shifts: Shift[]
  pricingPlans: PricingPlan[]
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  shiftType: string
}

export interface PricingPlan {
  id: string
  name: string
  planType: string
  price: number
}

export interface SeatAvailability {
  id: string
  label: string
  seatType: string
  rowNumber: number
  colNumber: number
  status: string
  availability: 'available' | 'booked' | 'locked' | 'blocked'
}

export interface Booking {
  id: string
  bookingDate: string
  status: string
  paymentStatus: string
  amount: number
  qrCode: string
  seat: { id: string; label: string; seatType: string }
  shift: { id: string; name: string; startTime: string; endTime: string }
  centre: { id: string; name: string }
}
