-- V1__init_schema.sql
-- SeatFit — Initial Database Schema
-- Mirrors the Prisma schema, adapted for PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- CENTRES
-- ─────────────────────────────────────────
CREATE TABLE centres (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(150) NOT NULL,
    address      TEXT         NOT NULL,
    city         VARCHAR(100) NOT NULL,
    total_seats  INTEGER      NOT NULL,
    open_time    TIME         NOT NULL,
    close_time   TIME         NOT NULL,
    amenities    JSONB        NOT NULL DEFAULT '[]',
    photos       JSONB        NOT NULL DEFAULT '[]',
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    phone       VARCHAR(20)  NOT NULL UNIQUE,
    email       VARCHAR(150),
    role        VARCHAR(20)  NOT NULL DEFAULT 'member'
                  CHECK (role IN ('member','centre_admin','super_admin')),
    centre_id   UUID         REFERENCES centres(id),
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_phone     ON users(phone);
CREATE INDEX idx_users_role      ON users(role);
CREATE INDEX idx_users_centre_id ON users(centre_id);

-- ─────────────────────────────────────────
-- OTP REQUESTS  (rate-limiting + expiry)
-- ─────────────────────────────────────────
CREATE TABLE otp_requests (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone       VARCHAR(20)  NOT NULL,
    otp_hash    TEXT         NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    is_used     BOOLEAN      NOT NULL DEFAULT false,
    attempt_no  INTEGER      NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_phone   ON otp_requests(phone);
CREATE INDEX idx_otp_expires ON otp_requests(expires_at);

-- ─────────────────────────────────────────
-- SEATS
-- ─────────────────────────────────────────
CREATE TABLE seats (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id   UUID         NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    label       VARCHAR(20)  NOT NULL,
    seat_type   VARCHAR(20)  NOT NULL DEFAULT 'standard'
                  CHECK (seat_type IN ('standard','window','corner','private')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available','blocked','removed')),
    row_number  INTEGER      NOT NULL,
    col_number  INTEGER      NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (centre_id, label)
);

CREATE INDEX idx_seats_centre ON seats(centre_id);

-- ─────────────────────────────────────────
-- SHIFTS
-- ─────────────────────────────────────────
CREATE TABLE shifts (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id   UUID         NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    name        VARCHAR(50)  NOT NULL,
    start_time  TIME         NOT NULL,
    end_time    TIME         NOT NULL,
    shift_type  VARCHAR(20)  NOT NULL
                  CHECK (shift_type IN ('morning','evening','full_day','night','custom')),
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_shifts_centre ON shifts(centre_id);

-- ─────────────────────────────────────────
-- PRICING PLANS
-- ─────────────────────────────────────────
CREATE TABLE pricing_plans (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    centre_id   UUID         NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    plan_type   VARCHAR(20)  NOT NULL
                  CHECK (plan_type IN ('per_shift','daily','weekly','monthly')),
    price       DECIMAL(10,2) NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_pricing_centre ON pricing_plans(centre_id);

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE bookings (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID         NOT NULL REFERENCES users(id),
    seat_id          UUID         NOT NULL REFERENCES seats(id),
    centre_id        UUID         NOT NULL REFERENCES centres(id),
    shift_id         UUID         NOT NULL REFERENCES shifts(id),
    pricing_plan_id  UUID         NOT NULL REFERENCES pricing_plans(id),
    booking_date     DATE         NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
    payment_status   VARCHAR(20)  NOT NULL DEFAULT 'unpaid'
                       CHECK (payment_status IN ('unpaid','paid','refunded','failed')),
    amount           DECIMAL(10,2) NOT NULL,
    qr_code          VARCHAR(100) UNIQUE,
    notes            TEXT,
    is_walk_in       BOOLEAN      NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    cancelled_at     TIMESTAMPTZ,

    -- DB-level double-booking guard
    UNIQUE (seat_id, shift_id, booking_date)
);

CREATE INDEX idx_bookings_user        ON bookings(user_id);
CREATE INDEX idx_bookings_centre      ON bookings(centre_id);
CREATE INDEX idx_bookings_date        ON bookings(booking_date);
CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_bookings_seat_shift  ON bookings(seat_id, shift_id, booking_date);

-- ─────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────
CREATE TABLE payments (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id           UUID         NOT NULL REFERENCES bookings(id) UNIQUE,
    amount               DECIMAL(10,2) NOT NULL,
    method               VARCHAR(20)
                           CHECK (method IN ('upi','card','netbanking','wallet','cash','waived')),
    razorpay_order_id    VARCHAR(100),
    razorpay_payment_id  VARCHAR(100),
    status               VARCHAR(20)  NOT NULL DEFAULT 'created'
                           CHECK (status IN ('created','captured','failed','refunded')),
    paid_at              TIMESTAMPTZ,
    refunded_at          TIMESTAMPTZ,
    refund_amount        DECIMAL(10,2),
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status  ON payments(status);

-- ─────────────────────────────────────────
-- SEAT LOCKS  (10-minute hold during payment)
-- ─────────────────────────────────────────
CREATE TABLE seat_locks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    seat_id     UUID         NOT NULL REFERENCES seats(id),
    user_id     UUID         NOT NULL REFERENCES users(id),
    shift_id    UUID         NOT NULL REFERENCES shifts(id),
    lock_date   DATE         NOT NULL,
    expires_at  TIMESTAMPTZ  NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

    UNIQUE (seat_id, shift_id, lock_date)
);

CREATE INDEX idx_seat_locks_expires ON seat_locks(expires_at);
CREATE INDEX idx_seat_locks_seat    ON seat_locks(seat_id, shift_id, lock_date);
