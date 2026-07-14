# SeatFit

SeatFit is a comprehensive full-stack application designed for study centres to manage seat reservations, shift planning, and pricing dynamically. It offers a seamless experience for students to browse availability, book seats, and manage their schedules, while providing centre administrators with a powerful dashboard to monitor occupancy, manage bookings, and view seat heatmaps.

This repository is structured as a monorepo containing both the frontend client and backend API.

## 🏗️ Repository Structure

```text
SeatFit/
├── frontend/         # Next.js web application
└── backend/          # Java Spring Boot REST API
```

## 🚀 Tech Stack

**Frontend**
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS (EduReserve Design System)
- JWT-based Authentication
- Fully responsive, modern, and dynamic UI

**Backend**
- Java 17
- Spring Boot 3.2.5 (Web, Data JPA, Security)
- PostgreSQL Database
- Flyway Database Migrations
- Stateless JWT Authentication
- Maven Build System

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17
- Maven
- PostgreSQL (running locally on port 5432)

### 1. Database Setup
Ensure PostgreSQL is running. Create the required database and user:
```sql
CREATE USER seatfit WITH PASSWORD 'seatfit';
CREATE DATABASE seatfit OWNER seatfit;
```
*(Note: Flyway will automatically run all migrations and seed data on the first application startup).*

### 2. Running the Backend
Navigate to the backend directory and start the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```
The API will be available at `http://localhost:8080/api`

### 3. Running the Frontend
Open a new terminal, navigate to the frontend directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```
The web application will be available at `http://localhost:3000`

## 🔑 Key Features
- **Dynamic Seat Maps**: Visual grid representing real-time seat availability per shift.
- **OTP-based Authentication**: Secure, passwordless login system.
- **Role-Based Access Control**: Differentiated views for regular Members and Centre Admins.
- **Admin Heatmaps**: Visual analytics for centre utilization.
- **Multi-Shift Management**: Support for Morning, Evening, and Custom shifts.

## 🤝 Contributing
1. Clone the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
