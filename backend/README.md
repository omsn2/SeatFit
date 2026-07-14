# SeatFit — Spring Boot Backend

**Java 17 · Spring Boot 3.2 · PostgreSQL 16 · Flyway · Spring Security (JWT)**

---

## Quick Start

### Step 1 — Create the PostgreSQL database

Open a terminal and run:

```bash
# On Ubuntu/Linux — use your postgres superuser
sudo -i -u postgres psql

# Inside psql, run:
CREATE USER seatfit WITH PASSWORD 'seatfit_dev';
CREATE DATABASE seatfit OWNER seatfit;
GRANT ALL PRIVILEGES ON DATABASE seatfit TO seatfit;
\q
```

> **If you have a password for your postgres user**, use:
> ```bash
> psql -h localhost -U postgres -W
> ```

---

### Step 2 — Run the Spring Boot app

```bash
cd seatfit-backend
mvn spring-boot:run
```

Flyway will automatically run the migrations on startup:
- `V1__init_schema.sql` — creates all tables
- `V2__seed_data.sql` — inserts one centre, 40 seats, 2 shifts, 3 pricing plans

The server starts at **http://localhost:8080/api**

---

### Step 3 — Test the API

```bash
# 1. Send OTP (dev mode — OTP is always "123456")
curl -X POST http://localhost:8080/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919999000001"}'

# 2. Verify OTP — get JWT tokens
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+919999000001","otp":"123456","name":"Admin User"}'

# 3. Browse centres (public)
curl http://localhost:8080/api/centres

# 4. Get seat map for shift + date (public)
curl "http://localhost:8080/api/centres/{centreId}/seats?shiftId={shiftId}&date=2026-07-15"
```

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/send-otp` | Public | Send OTP to phone |
| POST | `/auth/verify-otp` | Public | Verify OTP, get JWT tokens |

### Centres (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/centres` | Public | List all active centres |
| GET | `/centres/{id}` | Public | Get centre details |
| GET | `/centres/{id}/shifts` | Public | Get active shifts |
| GET | `/centres/{id}/pricing` | Public | Get pricing plans |
| GET | `/centres/{id}/seats?shiftId=&date=` | Public | Seat map with availability |

### Bookings (Member)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookings/lock` | JWT | Lock seat for 10 min before payment |
| POST | `/bookings` | JWT | Create a booking |
| GET | `/bookings/my` | JWT | My bookings (paginated) |
| PATCH | `/bookings/{id}/cancel` | JWT | Cancel a booking |
| GET | `/bookings/qr/{qrCode}` | JWT | Check-in via QR code |

### Admin (Centre Admin / Super Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Today's stats, revenue, shifts |
| GET | `/admin/bookings` | Admin | All centre bookings (paginated) |
| PATCH | `/admin/bookings/{id}/cancel` | Admin | Cancel any booking |
| POST | `/admin/bookings/walk-in` | Admin | Cash/walk-in booking |
| PATCH | `/admin/seats/{id}/status` | Admin | Block or unblock a seat |
| GET | `/admin/seats?shiftId=&date=` | Admin | Seat map admin view |
| GET | `/admin/checkin/{qrCode}` | Admin | QR check-in |

---

## Architecture

```
seatfit-backend/
├── entity/          ← JPA entities (User, Centre, Seat, Booking, Payment, SeatLock, OtpRequest)
├── repository/      ← Spring Data JPA repositories with custom JPQL
├── service/         ← Business logic (AuthService, BookingService)
├── controller/      ← REST controllers (AuthController, BookingController, AdminController, CentreController)
├── security/        ← JWT (JwtTokenProvider, JwtAuthFilter, SeatFitUserPrincipal)
├── config/          ← SecurityConfig (CORS + Spring Security filter chain)
├── exception/       ← GlobalExceptionHandler + custom exceptions
├── scheduler/       ← Seat lock expiry (every 60s) + OTP cleanup (3am daily)
└── resources/
    ├── application.yml
    └── db/migration/
        ├── V1__init_schema.sql   ← All tables with indexes + constraints
        └── V2__seed_data.sql     ← Dev seed data
```

---

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `seatfit` | Database name |
| `DB_USER` | `seatfit` | Database user |
| `DB_PASSWORD` | `seatfit_dev` | Database password |
| `JWT_SECRET` | (see file) | **Change in production!** |
| `CORS_ORIGINS` | `http://localhost:3000` | Next.js frontend URL |
| `OTP_DEV_MODE` | `true` | When true, OTP = "123456" always |
| `RAZORPAY_KEY_ID` | — | Razorpay key (when ready) |

---

## Connecting Next.js Frontend

Update your Next.js API calls from internal routes to this backend:

```typescript
// Before (Next.js API route)
const res = await fetch('/api/auth/send-otp', { ... })

// After (Spring Boot backend)  
const res = await fetch('http://localhost:8080/api/auth/send-otp', { ... })
```

Or set `NEXT_PUBLIC_API_URL=http://localhost:8080/api` in your Next.js `.env.local`.
