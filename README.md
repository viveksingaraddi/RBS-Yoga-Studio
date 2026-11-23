# RBS Yoga Studio — Platform & Online LMS

**Tagline:** The Art of Strength, Balance & Wellness  
**Lead Instructor:** Master Sangu (M.Sc. Yoga)  
**Verified Experience:** 10+ Years of Teaching Experience · International Practice in Vietnam  

---

## 🧘 Overview

RBS Yoga Studio is a premium digital wellness platform designed for an editorial, mindful, and authentic yogic experience. It comprises three interconnected environments:

1. **Public Marketing Website:**
   - Cinematic hero experience ("Find Your Balance. Discover Your Strength.")
   - Philosophy section detailing the 6 foundational yogic pillars ("More Than Movement. A Way of Living.")
   - Master Sangu instructor profile (strictly verified qualifications: M.Sc. Yoga, 10+ years experience, international experience in Vietnam)
   - 6 configurable programs: Hatha Yoga, Pranayama, Meditation & Yoga Nidra, Group Yoga, Online Live Sessions, Personal Mentorship
   - Immersive mental wellbeing section ("Your Body Needs Movement. Your Mind Needs Stillness.")
   - Live timetable connected to database schedule capacities
   - Tiered membership options (Monthly, Quarterly, Annual)
   - Visual sanctuary gallery
   - Direct contact & WhatsApp inquiry system (stores inquiry in DB with status `NEW` and redirects with prefilled message)

2. **Learner Portal:**
   - Dashboard overview with active pass status, days remaining, upcoming sittings, and recommended video recordings
   - My Bookings: view upcoming and past sessions, delivery types, and self-service cancellation
   - My Membership: view entitlements, validity dates, and renewal options
   - Live Sessions: server-protected access requiring active membership before granting Google Meet/Zoom URLs
   - Recorded Practice Library: category filters (Hatha, Pranayama, Meditation), completion tracking, and signed private stream playback URLs

3. **Administrative Dashboard:**
   - Real-time business overview: total learners, active passholders, today's bookings, upcoming classes, total inquiries, and real captured revenue
   - Learner management with status toggles
   - Program catalog management
   - Schedule & capacity management with seat tracking
   - Class booking administration
   - Membership pass management
   - Live session broadcast scheduler with encrypted meeting URLs
   - Recorded video management with Cloudflare Stream adapter
   - WhatsApp inquiry CRM with status progression (`NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`) and internal notes
   - Dynamic business settings (studio name, tagline, WhatsApp number, email, phone, address, timezone, currency)

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router, Server Components & Client Components)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS with custom palette (Forest `#173F34`, Sage `#E9EDE5`, Ivory `#F8F6F0`, Earth `#B69B73`, Olive `#68776B`, Charcoal `#1E3029`)
- **Database & ORM:** PostgreSQL + Prisma ORM (21 normalized models)
- **Authentication:** Custom JWT in `HttpOnly` secure cookies + bcrypt password hashing (12 salt rounds) + RBAC (`LEARNER`, `ADMIN`)
- **Payments:** Razorpay integration with backend order creation, HMAC-SHA256 signature verification, and webhook idempotency
- **Notifications:** Transactional email notification dispatcher (Resend adapter + database logging)
- **Testing:** Vitest automated test suite covering Auth, Payments, Access Control, Bookings, and Inquiries

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or remote URL)

### 2. Environment Variables (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/rbs_yoga?schema=public"
JWT_SECRET="rbs_yoga_studio_super_secret_jwt_key_2026_dev_prod_secure_min32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Razorpay (Test Mode / Sandbox)
RAZORPAY_KEY_ID="rzp_test_rbsyogastudio"
RAZORPAY_KEY_SECRET="rzp_secret_dummy_test_key_for_signature"
RAZORPAY_WEBHOOK_SECRET="rzp_webhook_secret_dummy_123"

# Email Delivery
RESEND_API_KEY="re_test_mock_key"
EMAIL_FROM="RBS Yoga Studio <notifications@rbsyogastudio.com>"
OWNER_NOTIFICATION_EMAIL="owner@rbsyogastudio.com"

# Studio WhatsApp Configuration
NEXT_PUBLIC_BUSINESS_NAME="RBS Yoga Studio"
NEXT_PUBLIC_BUSINESS_TAGLINE="The Art of Strength, Balance & Wellness"
NEXT_PUBLIC_WHATSAPP_PHONE="919876543210"
```

### 3. Setup Commands
```bash
# Install dependencies
npm install

# Push Prisma schema to PostgreSQL
npx prisma db push

# Seed database with Master Sangu profile, programs, schedules, and plans
node scripts/seed.mjs

# Run test suite
npm run test

# Build for production
npm run build

# Start production server
npm run start
```

---

## 🔐 Seeded Test Credentials

- **Admin Account:**
  - Email: `admin@rbsyogastudio.com`
  - Password: `Admin@RBSYoga2026!`
  - Role: `ADMIN` (Full access to `/admin`)

- **Learner Account:**
  - Email: `learner@rbsyogastudio.com`
  - Password: `Learner@RBSYoga2026!`
  - Role: `LEARNER` (Active Quarterly Membership seeded, access to `/portal`)

---

## 🛡️ Security Implementation
- **Timing-Safe Equivalence:** HMAC-SHA256 signature verification for payment callbacks and webhooks.
- **Server-Side Gatekeeping:** Live session URLs and video playback URLs are never exposed in public HTML or public APIs. They require active membership authorization.
- **Concurrency-Safe Bookings:** Slot holds and bookings execute inside atomic PostgreSQL transactions, preventing overbooking beyond capacity.
