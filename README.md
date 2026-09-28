# HOUSE OF DREAMS
> **"Stay. Relax. Dream."**  
> *More Than Just a Stay.*

A production-ready, full-stack multi-branch luxury hotel booking and property management system engineered with **Node.js, Express, TypeScript, Prisma ORM, Neon PostgreSQL, React, Vite, and Tailwind CSS**.

Designed with an opulent aesthetic inspired by the House of Dreams brand identity: warm ivory backgrounds (`#F8F5EF`), soft sand surfaces (`#EFE8DC`), charcoal typography (`#242321`), warm espresso accents (`#5A4636`), and regal gold trim (`#B79A65`).

---

## 🌟 Key Architecture & Highlights

- **Strictly 3 User Roles**:
  - **`ADMIN`**: Global management across all hotel branches, branch CRUD, room and inventory control, staff assignments, multi-branch financial reports, CSV exports, coupon campaigns, and full audit logs.
  - **`RECEPTION`**: Secure branch-isolated operations. Can only view and operate on their assigned branch's rooms, walk-in bookings, check-in, check-out, extra charges, and physical desk payment collections.
  - **`CUSTOMER`**: Public room discovery, search with date overlap verification, instant reservation with desk payment guarantee, booking tracking (Upcoming, Current, Completed, Cancelled), itemized GST tax invoices, and verified stay reviews.
- **Physical Desk Payments Only (Zero Online Gateways)**:
  - In strict compliance with House of Dreams policy, **no online payment gateways** (Stripe, Razorpay, etc.) are integrated.
  - Customers reserve online; payment is collected physically at hotel reception upon check-in or checkout.
  - Receptionists record desk payments with method (`CASH`, `CARD`, `UPI`, `OTHER`), notes, and automatic receipt generation.
  - Dynamic payment status transitions: `UNPAID` ➔ `PARTIALLY_PAID` ➔ `PAID`.
- **Double-Booking Prevention Engine**:
  - Overlap verification: `checkInDate < requestedCheckOutDate AND checkOutDate > requestedCheckInDate` across `CONFIRMED` and `CHECKED_IN` bookings.
  - Database-level isolation with transactional safety and cloud latency tolerance.
- **Itemized Tax Invoices**:
  - Auto-generated on checkout or desk payment with custom invoice numbers (`INV-XXXXXX`).
  - Itemizes room tariff, nights, discount vouchers, 12% GST, extra service charges (dining, spa, laundry), paid amount, and outstanding balance.
- **Verified Guest Reviews Only**:
  - Customers can only review a branch if they have at least one verified completed stay (`CHECKED_OUT`) at that branch.

---

## 🔑 Demo Accounts & Quick Login

The system comes pre-seeded with realistic hotel branches, rooms, amenities, bookings, payments, and reviews. The frontend login page includes **1-Click Quick Login** buttons for immediate testing:

| Role | Branch | Email | Password |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | *All Branches (Global)* | `admin@houseofdreams.com` | `admin123` |
| **`RECEPTION`** | Udaipur Heritage Palace | `reception1@houseofdreams.com` | `reception123` |
| **`RECEPTION`** | Shimla Misty Pines | `reception2@houseofdreams.com` | `reception123` |
| **`RECEPTION`** | Goa Palm Serenity | `reception3@houseofdreams.com` | `reception123` |
| **`CUSTOMER`** | *Guest Account* | `customer@houseofdreams.com` | `customer123` |

---

## 🏨 Pre-Configured Branches

1. **House of Dreams - Udaipur Heritage Palace**
   - *Location*: Lake Pichola Road, Udaipur, Rajasthan
   - *Theme*: Royal Mewar architecture, marble arches, jharokha balconies, and lakefront views.
2. **House of Dreams - Shimla Misty Pines**
   - *Location*: Mall Road Upper Ridge, Shimla, Himachal Pradesh
   - *Theme*: Colonial heritage manor with cedar wood interiors and Himalayan mountain views.
3. **House of Dreams - Goa Palm Serenity**
   - *Location*: Varca Beachfront Avenue, South Goa
   - *Theme*: Tropical coastal sanctuary surrounded by coconut groves and private beach paths.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Neon PostgreSQL**: Already configured in `backend/.env`

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Push Prisma schema to Neon PostgreSQL (if setting up fresh)
npx prisma db push

# Seed branches, rooms, amenities, staff, and initial bookings
npm run seed

# Start development server on http://localhost:5000
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server on http://localhost:5173
npm run dev
```

Visit **`http://localhost:5173`** in your browser to explore the platform!

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Database** | Neon Serverless PostgreSQL (AWS us-east-2) |
| **Authentication** | JWT (JSON Web Tokens) with 7-day expiration, bcryptjs hashing |
| **Validation & Security**| Zod schema validation, Helmet security headers, CORS protection, Express Rate Limiter |

---

## 📁 Repository Structure

```
HOD/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Complete Neon PostgreSQL schema definition
│   │   └── seed.ts                 # Database seeding script (branches, rooms, staff, coupons)
│   ├── src/
│   │   ├── config/prisma.ts        # Prisma client singleton
│   │   ├── controllers/            # Route controllers for all hotel domains
│   │   │   ├── auth.controller.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── branch.controller.ts
│   │   │   ├── customer.controller.ts
│   │   │   ├── invoice.controller.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── reception.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   ├── room.controller.ts
│   │   │   └── ...
│   │   ├── middleware/             # Auth, role check, branch isolation, Zod validation
│   │   ├── routes/                 # Express API routes
│   │   ├── validators/             # Zod input validation schemas
│   │   └── server.ts               # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable UI components (Navbar, Footer, InvoiceModal)
│   │   ├── context/AuthContext.tsx # Centralized authentication state
│   │   ├── pages/
│   │   │   ├── admin/              # Admin dashboard, branches, rooms, staff, reports, coupons
│   │   │   ├── customer/           # Customer my-bookings, stay details, review modals
│   │   │   ├── public/             # Home, branches, room explorer, story, contact, login
│   │   │   └── reception/          # Reception dashboard, walk-ins, check-in/out, desk payments
│   │   ├── services/api.ts         # Axios client with JWT interceptors
│   │   ├── types/index.ts          # TypeScript interfaces and domain types
│   │   ├── App.tsx                 # Route definitions and role-based protection
│   │   └── main.tsx
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 📋 Comprehensive REST API Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new customer account
- `POST /api/auth/login` - Authenticate user (Admin / Reception / Customer) & receive JWT token
- `GET /api/auth/me` - Retrieve current user profile and role details

### 🏨 Branches (`/api/branches`)
- `GET /api/branches` - Public list of active hotel branches
- `GET /api/branches/:id` - Detailed branch information with room types
- `POST /api/branches` - *(Admin)* Create new hotel branch
- `PUT /api/branches/:id` - *(Admin)* Update branch details
- `PATCH /api/branches/:id/toggle-status` - *(Admin)* Activate/Deactivate branch

### 🛏️ Rooms & Inventory (`/api/rooms`)
- `GET /api/rooms/search` - Public availability search by `branchId`, `checkInDate`, `checkOutDate`, and `guests`
- `GET /api/rooms` - Authenticated list of rooms (Reception sees only their branch; Admin sees all)
- `GET /api/rooms/:id` - Room specifications and amenities
- `POST /api/rooms` - *(Admin)* Add new room
- `PUT /api/rooms/:id` - *(Admin)* Update room
- `PATCH /api/rooms/:id/status` - *(Admin / Reception)* Change status (`AVAILABLE`, `CLEANING`, `MAINTENANCE`)

### 📅 Bookings & Reservations (`/api/bookings`)
- `POST /api/bookings/check-availability` - Live price quote preview with coupon discount calculation
- `POST /api/bookings` - *(Customer)* Reserve room online with desk payment guarantee
- `POST /api/bookings/walk-in` - *(Reception / Admin)* Immediate walk-in booking with optional advance desk payment
- `POST /api/bookings/:id/check-in` - *(Reception / Admin)* Check in guest, sets room to `OCCUPIED`
- `POST /api/bookings/:id/check-out` - *(Reception / Admin)* Check out guest, sets room to `CLEANING`, generates final invoice
- `POST /api/bookings/:id/extra-charges` - *(Reception / Admin)* Add extra charge (Room Service, Spa, Dining, etc.)
- `POST /api/bookings/:id/change-room` - *(Reception / Admin)* Transfer guest to another available room
- `POST /api/bookings/:id/cancel` - Cancel booking & release room
- `GET /api/bookings` - List bookings (scoped by role and branch)
- `GET /api/bookings/:id` - Detailed booking stay record

### 💵 Desk Payments Only (`/api/payments`)
- `POST /api/payments/record-desk` - *(Reception / Admin)* Record physical desk payment (`CASH`, `CARD`, `UPI`, `OTHER`). Recalculates balance and payment status.
- `GET /api/payments` - *(Reception / Admin)* Desk payments audit ledger

### 🧾 Invoices (`/api/invoices`)
- `GET /api/invoices/booking/:bookingId` - Itemized tax invoice with room charges, services, GST, discounts, and payments

### 👥 Reception Staff Management (`/api/reception`)
- `GET /api/reception` - *(Admin)* List all reception staff members and branch assignments
- `POST /api/reception` - *(Admin)* Create new reception staff member and assign to branch
- `PUT /api/reception/:id` - *(Admin)* Update reception staff credentials or branch assignment

### 📊 Analytics & Reports (`/api/reports`)
- `GET /api/reports/dashboard` - *(Admin / Reception)* KPI cards (occupancy rate, revenue, room status breakdown, 7-day revenue trend)
- `GET /api/reports/revenue` - *(Admin)* Date-range financial report
- `GET /api/reports/export-csv` - *(Admin)* Export booking and revenue records to CSV

### ⭐ Reviews (`/api/reviews`)
- `GET /api/reviews` - Public customer reviews
- `POST /api/reviews` - *(Customer)* Post review for branch (enforces verified stay check)
- `PATCH /api/reviews/:id/toggle-visibility` - *(Admin)* Moderate customer review visibility

---

## 🛡️ Security & Integrity Highlights

1. **Role-Based Access Control (RBAC)**:
   - Handled via `authenticate` and `authorize('ADMIN', 'RECEPTION', 'CUSTOMER')` Express middlewares.
2. **Branch Isolation**:
   - `requireBranchAccess` ensures reception staff can **never** query or mutate resources from another hotel branch.
3. **No Online Gateway Risk**:
   - No sensitive credit card storage, zero third-party payment gateway downtime, and total resistance to checkout webhook exploits.
4. **Prisma Transaction Resilience**:
   - Multi-step booking and payment mutations utilize interactive transactions with extended timeout headroom for cross-continent remote PostgreSQL latency.

---

## 🏷️ Brand Philosophy

> *"House of Dreams is not just a place to lay your head. It is a sanctuary designed for those who appreciate understated elegance, timeless hospitality, and the luxury of quiet contemplation. From the sun-drenched courtyards of Udaipur to the misty pines of Shimla and the tranquil shores of South Goa, every stay is an unforgettable chapter in your journey."*
