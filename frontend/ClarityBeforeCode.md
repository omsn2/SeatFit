# Phase 0 — Clarity Before Code
### Study Centre Seat Booking Web App

---

## Table of Contents

1. [Market Context](#1-market-context)
2. [V1 Feature List](#2-v1-feature-list)
3. [User Flows](#3-user-flows)
4. [Data Model](#4-data-model)
5. [Scalability, Security & Privacy](#5-scalability-security--privacy)
6. [Tech Stack Decision](#6-tech-stack-decision)
7. [Definition of Done — Phase 0](#7-definition-of-done--phase-0)

---

## 1. Market Context

### What the market shows

- **First-come-first-served seating is the #1 reason students churn** from Indian study centres. Students commuting 20–30 minutes to find no preferred seat immediately switch to a reserved-seat alternative.
- **Seat guarantee is the core value proposition** — not just "booking", but "your seat is waiting for you when you arrive."
- **Owner pain is real and measurable.** Library owners across India lose revenue daily to missed renewals, empty seat confusion, and manual WhatsApp/cash workflows. Your admin panel directly solves operational pain — which is why owners will onboard.
- **Shift structure determines revenue ceiling.** A 50-seat centre running 2 shifts (morning + evening) has 100 bookable units. Adding a third shift makes it 150. Digital booking is what makes 3-shift management feasible at all.
- **WhatsApp is the communication layer Indian students already use.** Automated 7-3-1 day reminders increase on-time renewal rates by 40–60% over manual calls.

### Competitive landscape

| Product | Focus | Gap you can exploit |
|---------|-------|---------------------|
| 24Library | Owner-side management (seats, attendance, fees) | No clean student-facing booking page |
| SeatWise | Owner management + WhatsApp automation | Owner tool, not a student booking product |
| BookMiSeat | Marketplace discovery across cities | No per-centre white-label page for owners |
| GoLibrary | Mid-size library management | No free plan, limited WhatsApp integration |

**Your v1 position:** A clean, per-centre booking page that a centre owner can share directly with their students via WhatsApp — zero marketplace friction, zero learning curve for the student.

### The 60-second rule

> Every feature decision in v1 must pass this test: **does this help a first-time student book a seat in under 60 seconds?** If not, it does not belong in v1.

---

## 2. V1 Feature List

### RBAC Roles

| Role | Who |
|------|-----|
| `guest` | Unregistered visitor — can browse availability only |
| `member` | Registered student — can book, pay, manage own bookings |
| `centre_admin` | Centre owner/staff — manages their centre only |
| `super_admin` | Platform owner (you) — access across all centres |

---

### Module 1 — Auth & RBAC

| Priority | Feature | Notes |
|----------|---------|-------|
| ✅ Core | Phone + OTP login | No password. Indian users expect OTP. Use MSG91 or Twilio Verify |
| ✅ Core | JWT with role in payload | `userId`, `role`, `centreId` — nothing else |
| ✅ Core | centreId scoped tokens | `centre_admin` token locked to their centre on every backend check |
| ✅ Core | Protected routes frontend + backend | Both layers required — frontend for UX, backend for security |
| 🟡 Required | Minimal profile — name, phone, email optional | No Aadhaar, no ID proof in v1 |
| ❌ Cut | Google / social OAuth | V2 — adds complexity, OTP is sufficient for students |
| ❌ Cut | SSO / enterprise login | V3 marketplace only |

---

### Module 2 — Booking Flow (User-facing)

| Priority | Feature | Notes |
|----------|---------|-------|
| ✅ Core | Shift picker — morning / evening / full-day | Tied to `SHIFTS` table, admin-configurable |
| ✅ Core | Date selector — today + 7 days ahead | Max 7 days prevents speculative holding |
| ✅ Core | Visual seat map — click to select | Green = available, grey = taken, amber = held by someone in payment |
| ✅ Core | Seat lock — 10-minute hold during payment | Prevents double-booking race condition |
| ✅ Core | No-double-booking conflict check (backend) | Check on every `POST /bookings` regardless of frontend state |
| ✅ Core | Guest can browse without login | Login triggered only at booking step |
| 🟡 Required | Cancel / reschedule within policy window | Policy set by admin (e.g. cancel up to 2 hours before shift) |
| 🟡 Required | My bookings — upcoming + past with QR code | QR used for check-in at the centre |
| 🟡 Required | Booking summary screen before payment | Show seat, shift, date, price — one confirmation step |
| ❌ Cut | Recurring / monthly seat subscription | V2 — requires subscription billing logic |
| ❌ Cut | Seat change after booking | V2 |
| ❌ Cut | Group booking (multiple seats) | V2 |

---

### Module 3 — Payment

| Priority | Feature | Notes |
|----------|---------|-------|
| ✅ Core | Razorpay UPI + card inline | No redirect. Razorpay modal inside the page |
| ✅ Core | Payment webhook → auto-confirm booking | Never trust frontend payment confirmation |
| ✅ Core | Receipt auto-generated | WhatsApp message with booking ID, seat, amount |
| ✅ Core | Seat released on payment failure / timeout | Triggered by webhook failed event or lock TTL expiry |
| 🟡 Required | Refund on cancel within policy — Razorpay refund API | Only if cancellation is within allowed window |
| ❌ Cut | Prepaid wallet / credits | V2 |
| ❌ Cut | EMI or split payments | Not relevant for daily/monthly booking amounts |

---

### Module 4 — Admin Panel

| Priority | Feature | Notes |
|----------|---------|-------|
| ✅ Core | Live occupancy dashboard | Seats booked vs available, by shift, for today |
| ✅ Core | All bookings list — filter by date / shift / status | Paginated, searchable by name or phone |
| ✅ Core | Walk-in manual booking | Admin creates booking for cash customers, marks as paid |
| ✅ Core | Block / unblock a seat | Maintenance, reserved, or gender-designated zones |
| ✅ Core | QR-based check-in | Admin scans student QR or student shows booking ID |
| 🟡 Required | Daily revenue summary | Total collected, shift-wise breakdown |
| 🟡 Required | Centre settings — hours, pricing plans, amenities, photos | Admin-editable without code changes |
| 🟡 Required | Upcoming arrivals list | Next 2 hours, sorted by shift start time |
| ❌ Cut | Advanced analytics / occupancy heatmaps | V2 |
| ❌ Cut | Staff roles (multiple admins per centre) | V2 |
| ❌ Cut | Multi-branch roll-up dashboard | V2 marketplace layer |

---

### Module 5 — Notifications

| Priority | Feature | Notes |
|----------|---------|-------|
| ✅ Core | WhatsApp confirmation — booking + payment | Sent immediately after `payment.captured` webhook |
| ✅ Core | Reminder 30 min before shift starts | Automated, no manual work |
| 🟡 Required | Cancellation confirmation via WhatsApp | Include refund timeline if applicable |
| ❌ Cut | Email notifications | WhatsApp is primary for this audience. Email is V2 |
| ❌ Cut | Push notifications | Mobile app only — V3 |
| ❌ Cut | Marketing broadcasts | Separate opt-in required, not v1 |

---

### What is explicitly cut from v1

These are not forgotten — they are deliberately deferred to avoid scope creep:

- Prepaid wallet / credits
- Recurring subscriptions
- Social login
- Multi-branch support
- Advanced analytics
- Staff sub-roles
- Group bookings
- Mobile apps (iOS / Android)
- Marketplace discovery layer

---

## 3. User Flows

### 3.1 — Member Flow (New visitor → Confirmed booking)

```
[Lands on page]
       │
       ▼
[Sees availability today]
  Live seat count · pricing · amenities strip
       │
       ▼
[Picks date + shift]
  Today or up to 7 days · morning / evening / full-day
       │
       ▼
[Chooses seat on map]
  Green = available · Grey = taken · Amber = held
       │
       ▼
  ┌────────────┐
  │ Logged in? │
  └─────┬──────┘
        │ NO ──────────────────────────────────────┐
        │ YES                                      ▼
        │                               [Phone OTP login]
        │                                30-sec friction max
        │◄─────────────────────────────────────────┘
        ▼
[Booking summary screen]
  Seat · shift · price — confirm before paying
        │
        ▼
[Pay via Razorpay]
  UPI / card inline · seat locked for 10 min
        │
  ┌─────────────┐
  │ Payment OK? │
  └──────┬──────┘
         │ NO ──────────► [Seat released → Retry or exit]
         │ YES
         ▼
[Booking confirmed]
  Booking ID + QR code shown on screen
         │
         ▼
[WhatsApp confirmation sent]
  Seat no. · shift · centre address · receipt
         │
         ▼
[Day of: QR check-in at centre]
  Admin scans or member shows booking ID
```

---

### 3.2 — Admin Flow (Daily operations)

```
[Admin logs in]
       │
       ▼
[Dashboard home]
  Occupancy today · Revenue today · Upcoming arrivals
       │
  ┌────┴───────────────────────────────────────┐
  ▼          ▼              ▼                  ▼
[Manage    [Walk-in       [Seat map]      [Centre settings
bookings]   booking]                      + revenue]
  │          │              │                  │
  ▼          ▼              ▼                  ▼
View      Enter name     Click seat        View daily /
detail    + phone        on map            weekly revenue
  │       Pick seat,     See status,
  │       shift, date    who booked it     Edit hours,
  ▼          │              │              pricing, photos
Action?   Mark as         Block /
Cancel /  paid            unblock
no action    │              │
  │          ▼              │
  │       Booking           │
  │       created           │
  └────────────┬────────────┘
               ▼
        [Back to dashboard]
```

---

### 3.3 — Guest Flow (Browse without booking)

```
[Lands on page]
       │
       ▼
[Sees live availability]
  Seats available today · pricing · amenities
       │
       ▼
[Clicks "Book a seat"]
       │
       ▼
[Prompted to login with phone]
  "Enter your phone to continue"
       │
  ┌────┴─────────┐
  │ Enters OTP?  │
  └──────┬───────┘
         │ YES → Becomes member → continues booking flow
         │ NO  → Stays on page, can browse only
```

---

## 4. Data Model

### Entity Relationship Overview

```
USERS ──< BOOKINGS >── SEATS ──< CENTRES
                │              │
                │              ├──< SHIFTS
                │              └──< PRICING_PLANS
                │
                └──── PAYMENTS (1:1)

SEATS ──< SEAT_LOCKS (temporary, TTL-based)
```

---

### Table Definitions

#### `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  phone         VARCHAR(15) NOT NULL UNIQUE,         -- primary identity
  email         VARCHAR(150),                         -- optional
  role          VARCHAR(20) NOT NULL                  -- guest|member|centre_admin|super_admin
                  DEFAULT 'member'
                  CHECK (role IN ('guest','member','centre_admin','super_admin')),
  centre_id     UUID REFERENCES centres(id),          -- NULL for members, set for admins
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role  ON users(role);
```

**Design decisions:**
- `phone` is unique — it is the primary identity, not email
- `centre_id` is nullable — members are not tied to a centre; only admins are
- `is_active` soft delete — never hard delete users (financial audit trail)
- `role` is validated with a CHECK constraint in addition to application-level RBAC

---

#### `centres`

```sql
CREATE TABLE centres (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(150) NOT NULL,
  address       TEXT NOT NULL,
  city          VARCHAR(100) NOT NULL,
  total_seats   INTEGER NOT NULL,
  open_time     TIME NOT NULL,
  close_time    TIME NOT NULL,
  amenities     JSONB NOT NULL DEFAULT '[]',          -- ["AC","WiFi","Printing","Lockers"]
  photos        JSONB NOT NULL DEFAULT '[]',          -- [{url, caption, is_primary}]
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Design decisions:**
- `amenities` and `photos` as `JSONB` — flexible, no migrations needed when adding new amenity types
- `open_time / close_time` are operational hours; shift logic lives in the separate `shifts` table
- `total_seats` is a denormalised count for quick dashboard queries — kept consistent by application logic

---

#### `seats`

```sql
CREATE TABLE seats (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id     UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  label         VARCHAR(20) NOT NULL,               -- "A1", "B12", "Corner-3"
  seat_type     VARCHAR(20) NOT NULL DEFAULT 'standard'
                  CHECK (seat_type IN ('standard','window','corner','private')),
  status        VARCHAR(20) NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available','blocked','removed')),
  row_number    INTEGER NOT NULL,
  col_number    INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (centre_id, label)
);

CREATE INDEX idx_seats_centre ON seats(centre_id);
```

**Design decisions:**
- `row_number + col_number` — enables frontend seat map rendering without a separate layout table. Map is built by iterating these coordinates
- `seat_type` allows premium seat pricing in v2 (window seats cost more)
- `status` is the **operational state** of the seat itself — not whether it is booked. Booking state lives in `bookings`. A seat can be `available` (operational) but still have a booking on it for tomorrow
- `UNIQUE(centre_id, label)` — prevents duplicate seat labels within a centre

---

#### `shifts`

```sql
CREATE TABLE shifts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id     UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  name          VARCHAR(50) NOT NULL,               -- "Morning", "Evening", "Full Day"
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  shift_type    VARCHAR(20) NOT NULL
                  CHECK (shift_type IN ('morning','evening','full_day','night','custom')),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Design decisions:**
- Shifts are a table, not hardcoded. Admin can add a third shift (night) without code changes
- A 50-seat centre in 2 shifts = 100 bookable units. In 3 shifts = 150. This table makes that scaling zero-code
- `is_active` — deactivate a shift without deleting it. Existing bookings referencing it remain valid

---

#### `pricing_plans`

```sql
CREATE TABLE pricing_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id     UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  name          VARCHAR(100) NOT NULL,              -- "Morning Shift", "Full Day", "Monthly"
  plan_type     VARCHAR(20) NOT NULL
                  CHECK (plan_type IN ('per_shift','daily','weekly','monthly')),
  price         DECIMAL(10,2) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Design decisions:**
- Linked to `centres` — every centre sets their own pricing independently
- `is_active` instead of delete — existing `bookings` reference `pricing_plan_id`. Deleting a plan would break historical records
- `plan_type` is the billing cadence; actual shift assignment happens in `bookings`

---

#### `bookings`

```sql
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  seat_id           UUID NOT NULL REFERENCES seats(id),
  centre_id         UUID NOT NULL REFERENCES centres(id),
  shift_id          UUID NOT NULL REFERENCES shifts(id),
  pricing_plan_id   UUID NOT NULL REFERENCES pricing_plans(id),
  booking_date      DATE NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  payment_status    VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                      CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
  amount            DECIMAL(10,2) NOT NULL,
  qr_code           VARCHAR(100) UNIQUE,             -- generated UUID hash for check-in
  notes             TEXT,                            -- admin notes for walk-ins
  is_walk_in        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at      TIMESTAMPTZ,

  -- Prevent double-booking: same seat, same shift, same date
  UNIQUE (seat_id, shift_id, booking_date)
);

CREATE INDEX idx_bookings_user       ON bookings(user_id);
CREATE INDEX idx_bookings_centre     ON bookings(centre_id);
CREATE INDEX idx_bookings_date       ON bookings(booking_date);
CREATE INDEX idx_bookings_status     ON bookings(status);
CREATE INDEX idx_bookings_seat_shift ON bookings(seat_id, shift_id, booking_date);
```

**Design decisions:**
- `UNIQUE(seat_id, shift_id, booking_date)` — the database-level double-booking guard. Even if application logic fails, the DB constraint catches it
- `centre_id` is denormalised here (derivable via `seat_id`) for query performance — dashboard queries filter by `centre_id` directly
- `amount` is stored at booking time — protects against future price changes affecting historical records
- `qr_code` is a unique hash generated on booking confirmation — used for physical check-in
- `is_walk_in` flag — distinguishes admin-created bookings from student-initiated ones (important for revenue analytics)
- `cancelled_at` is a separate timestamp — never null out `created_at`

---

#### `payments`

```sql
CREATE TABLE payments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id            UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  amount                DECIMAL(10,2) NOT NULL,
  method                VARCHAR(20)
                          CHECK (method IN ('upi','card','netbanking','wallet','cash','waived')),
  razorpay_order_id     VARCHAR(100),               -- from Razorpay order creation
  razorpay_payment_id   VARCHAR(100),               -- from Razorpay payment captured
  status                VARCHAR(20) NOT NULL DEFAULT 'created'
                          CHECK (status IN ('created','captured','failed','refunded')),
  paid_at               TIMESTAMPTZ,
  refunded_at           TIMESTAMPTZ,
  refund_amount         DECIMAL(10,2),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status  ON payments(status);
```

**Design decisions:**
- Separate from `bookings` — in v2, retries and partial payments become possible without schema changes
- `UNIQUE(booking_id)` — one payment record per booking in v1
- Both `razorpay_order_id` and `razorpay_payment_id` are stored — both are required for the Razorpay refund API
- `method` includes `cash` and `waived` — for admin walk-in bookings where no online payment is made
- Admin never sees card details — Razorpay handles card data, you store only their transaction IDs

---

#### `seat_locks`

```sql
CREATE TABLE seat_locks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_id       UUID NOT NULL REFERENCES seats(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  shift_id      UUID NOT NULL REFERENCES shifts(id),
  lock_date     DATE NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,               -- created_at + 10 minutes
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (seat_id, shift_id, lock_date)             -- only one lock per seat per shift per day
);

CREATE INDEX idx_seat_locks_expires ON seat_locks(expires_at);
CREATE INDEX idx_seat_locks_seat    ON seat_locks(seat_id, shift_id, lock_date);
```

**Design decisions:**
- This table is the concurrency guard. When a user selects a seat and starts payment, a lock row is inserted
- On payment success → booking confirmed, lock deleted
- On payment failure or timeout → lock deleted (by cron job or Redis TTL in production)
- `UNIQUE(seat_id, shift_id, lock_date)` — only one user can be in the payment flow for any given seat+shift+date at a time
- In production, back this with Redis for sub-millisecond lock checks at peak hours (exam season)

---

### Enum Reference

```
users.role:             guest | member | centre_admin | super_admin
seats.seat_type:        standard | window | corner | private
seats.status:           available | blocked | removed
shifts.shift_type:      morning | evening | full_day | night | custom
pricing_plans.plan_type: per_shift | daily | weekly | monthly
bookings.status:        pending | confirmed | cancelled | completed | no_show
bookings.payment_status: unpaid | paid | refunded | failed
payments.method:        upi | card | netbanking | wallet | cash | waived
payments.status:        created | captured | failed | refunded
```

---

### Seed Data (for local development)

```sql
-- One centre
INSERT INTO centres (name, address, city, total_seats, open_time, close_time, amenities)
VALUES ('StudyHub Koramangala', '5th Block, Koramangala, Bengaluru', 'Bengaluru', 40,
        '06:00', '22:00', '["AC","WiFi","Printing","Lockers","Charging Points"]');

-- Two shifts
INSERT INTO shifts (centre_id, name, start_time, end_time, shift_type)
VALUES
  (<centre_id>, 'Morning', '06:00', '14:00', 'morning'),
  (<centre_id>, 'Evening', '14:00', '22:00', 'evening');

-- Three pricing plans
INSERT INTO pricing_plans (centre_id, name, plan_type, price)
VALUES
  (<centre_id>, 'Single Shift', 'per_shift', 60.00),
  (<centre_id>, 'Full Day',     'daily',     100.00),
  (<centre_id>, 'Monthly',      'monthly',   1200.00);

-- 40 seats (4 rows x 10 cols)
-- Generate with a script: label A1-A10, B1-B10, C1-C10, D1-D10

-- Two users
INSERT INTO users (name, phone, role, centre_id)
VALUES
  ('Admin User',   '+919999000001', 'centre_admin', <centre_id>),
  ('Test Student', '+919999000002', 'member',        NULL);
```

---

## 5. Scalability, Security & Privacy

### Scalability

| Decision | Reason |
|----------|--------|
| All IDs are `UUID v4` | Safe for distributed systems when you scale to marketplace. No integer ID collisions across centres |
| `centre_id` on every relevant table | Multi-tenancy built in from day 1. No schema changes needed when going from 1 centre to 1000 |
| `SHIFTS` as a configurable table | Adding a 3rd shift doubles potential revenue per centre with zero code changes |
| `JSONB` for amenities + photos | New amenity types require no migrations |
| Pagination on all list endpoints | `GET /bookings?page=1&limit=20` from day 1. Never return unbounded lists |
| `SEAT_LOCKS` backed by Redis in production | Handles flash-crowd concurrency (exam season) without DB bottleneck |
| Indexes on all foreign keys + date columns | Dashboard queries filter by `centre_id + booking_date` — these must be indexed |

### Security

| Layer | Implementation |
|-------|---------------|
| JWT payload | `userId`, `role`, `centreId` only — minimal surface area |
| Token expiry | 15-minute access token + 7-day refresh token |
| Admin route guard | Every admin API checks BOTH `role` AND `centreId` — a `centre_admin` cannot query another centre's data even with a valid token |
| Razorpay webhooks | HMAC signature verified on every incoming webhook before processing. Never trust webhook data without verification |
| OTP rate limiting | Max 3 OTP requests per phone number per hour |
| Seat lock atomicity | `UNIQUE` constraint on `seat_locks` + Redis NX (set-if-not-exists) — prevents race condition at DB and cache layer |
| HTTPS | Enforced on all endpoints. No HTTP fallback |
| Input validation | `zod` schema validation on all request bodies — before any DB call |
| SQL injection | Prisma parameterised queries — no raw string interpolation |

### Privacy

| Decision | Why |
|----------|-----|
| Minimum data collected | Name + phone only. Email optional. No Aadhaar, no ID proof in v1 |
| No card data stored | Razorpay is the card data processor. You store only `razorpay_payment_id` |
| Account deletion | User deletes account → bookings anonymised (`user_id` set to null), not deleted. Financial records preserved |
| WhatsApp messages | Booking info only. No marketing without explicit opt-in |
| `phone` is the only PII in plain text | All future sensitive fields encrypted at rest using `pgcrypto` |
| Admin cannot see other admins' data | `centreId` scoping enforced at API layer on every request |

---

## 6. Tech Stack Decision

> This is final. Do not revisit during build. Every tool below has been chosen for your existing skills, India-first requirements, and zero-friction path to marketplace.

```
Layer               Tool                    Why
─────────────────────────────────────────────────────────────────────
Frontend            Next.js 14              SSR + routing + API routes in one repo
Styling             Tailwind CSS            Mobile-first, fast to ship
Backend             Node.js + Express       Your existing BFF skills apply directly
ORM                 Prisma                  Type-safe, migration-friendly, great DX
Database            PostgreSQL (Supabase)   Managed, free tier, real-time capable
Cache / Locks       Redis (Upstash)         Seat locks, OTP rate limiting, sessions
Auth                Custom JWT + bcrypt     Phone OTP via MSG91 (₹0.18/OTP) or Twilio
Payments            Razorpay                UPI + card, India-first, best webhook docs
WhatsApp            Interakt or WATI        Official WhatsApp Business API, India support
Frontend hosting    Vercel                  Free tier, auto-deploy from Git
Backend hosting     Railway                 Simple, affordable, Postgres + Redis add-ons
Validation          Zod                     Runtime type safety on all API inputs
```

### What this stack gives you for the marketplace transition

- Next.js pages become templates — one component set, parameterised by `centreId`
- Supabase Row Level Security (RLS) handles multi-tenant data isolation at DB level
- Prisma schema already designed for multi-centre — no migrations needed
- Razorpay supports marketplace / route payments (funds to centre owners) in v2

---

## 7. Definition of Done — Phase 0

You are ready to write code when ALL of the following are true:

- [ ] This document is read, understood, and agreed upon
- [ ] Razorpay test account created — API keys in hand
- [ ] MSG91 or Twilio account created — OTP sending tested manually
- [ ] Supabase project created — connection string ready
- [ ] Upstash Redis instance created — connection URL ready
- [ ] GitHub repo created — `main` and `dev` branches set up
- [ ] `.env.example` written with all required variables listed
- [ ] One test centre mentally defined — name, address, seat count, shift times, pricing
- [ ] V1 feature list reviewed — every "cut from v1" item acknowledged and agreed

**Nothing else. Do not write code until this checklist is complete.**

---

*Document version: 1.0 | Created for: Study Centre Booking Web App | Phase: 0 — Pre-development*
