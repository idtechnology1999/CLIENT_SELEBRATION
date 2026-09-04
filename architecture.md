# Selliberation Frontend Architecture

## Overview

Selliberation is a React SaaS platform for earning online through digital skill courses and a multi-level affiliate program, targeting users in Nigeria/Africa. Users subscribe, learn, share referral links, and earn commissions across 6 levels.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.4 |
| Language | TypeScript (strict) | 5.9.3 |
| Build Tool | Vite | 8.0.1 |
| Routing | React Router | 7.13.2 |
| Styling | Tailwind CSS | 4.2.2 |
| Icons | Lucide React | 1.6.0 |
| Real-time | Socket.io-client | 4.8.3 |
| Payments | Paystack (redirect flow) | — |
| State | Context API + local state | — |

---

## Directory Structure

```
src/
├── assets/               # Static images (logo, hero, svgs)
├── components/
│   ├── ChatWidget.tsx    # Real-time socket.io support chat
│   ├── Layout.tsx        # Dashboard shell (sidebar + header)
│   └── SubscribeButton.tsx
├── context/
│   └── AuthContext.tsx   # Global auth state + token management
├── data/
│   └── mockData.ts       # Optional mock data
├── pages/
│   ├── Landing.tsx       # Public marketing page
│   ├── Login.tsx
│   ├── Register.tsx      # Two-step: form + OTP verification
│   └── dashboard/
│       ├── Dashboard.tsx         # Overview / stats
│       ├── Courses.tsx           # Course list + video player
│       ├── CourseDetail.tsx
│       ├── Referrals.tsx         # Affiliate hub + commission table
│       ├── Earnings.tsx          # Commission history
│       ├── Withdraw.tsx          # Bank setup + withdrawal requests
│       ├── Settings.tsx          # Profile + password
│       └── SubscribeCallback.tsx # Post-payment verification
├── services/
│   └── api.ts            # Centralized API client (grouped by domain)
├── types/
│   └── index.ts          # TypeScript interfaces
├── App.tsx               # Route definitions + auth guards
├── main.tsx              # React entry point
└── index.css             # Global styles + Tailwind imports
```

---

## Routing

```
/                         → Landing.tsx           (public)
/pricing                  → Landing.tsx           (public, same page)
/login                    → Login.tsx             (redirects if authed)
/register                 → Register.tsx          (?ref= for referrals)

/dashboard                → Layout.tsx wrapper    (protected)
  /                       → Dashboard.tsx
  /courses                → Courses.tsx
  /courses/:courseSlug    → Redirects to /dashboard/courses
  /referrals              → Referrals.tsx
  /earnings               → Earnings.tsx
  /withdraw               → Withdraw.tsx
  /settings               → Settings.tsx
  /subscribe/callback     → SubscribeCallback.tsx

*                         → Redirect to /
```

### Route Guards

- **`ProtectedRoute`** — Redirects unauthenticated users to `/login`
- **`PublicRoute`** — Redirects authenticated users away from `/login` and `/register`
- **`LoadingScreen`** — Shown while `AuthContext` restores session from localStorage

---

## Authentication

Token stored in `localStorage` under the key `selliberation_user_token`.

```
Register:
  1. POST /user-auth/register   → triggers OTP email
  2. POST /user-auth/verify-email (6-digit code)
  3. Token stored → AuthContext populated → redirect /dashboard

Login:
  1. POST /user-auth/login
  2. Token stored → AuthContext populated → redirect /dashboard

Session Restore (on app mount):
  1. Read token from localStorage
  2. GET /user-auth/me
  3. Populate AuthContext — or clear if request fails
```

---

## State Management

No Redux or Zustand. State is handled at two levels:

| Scope | Mechanism | Used For |
|-------|-----------|----------|
| Global | `AuthContext` (Context API) | User object, token, auth loading flag |
| Local | `useState` / `useEffect` | Form state, loading/error flags, fetched data |

**Data fetching pattern used throughout pages:**
```typescript
useEffect(() => {
  setLoading(true);
  api.method()
    .then(res => setData(res.data))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

---

## API Layer (`src/services/api.ts`)

Base URL: `import.meta.env.VITE_API_URL` (falls back to `http://localhost:5000/api`)

All authenticated requests include `Authorization: Bearer {token}`.

Expected response shape: `{ success: boolean, data?: any, message?: string }`

| Group | Purpose |
|-------|---------|
| `userAuthApi` | Login, register, OTP verify, profile fetch |
| `studentApi` | Dashboard stats, courses, commissions, withdrawals, referrals |
| `paymentApi` | Subscription, stage upgrades, module unlocks, bank account verification |
| `publicApi` | Public course list + platform settings (no auth) |
| `notificationApi` | Fetch and mark in-app notifications |
| `chatApi` | Chat history and send message |

A `fixUrl()` helper converts relative thumbnail URLs to absolute paths.

---

## Components

### `Layout.tsx`
Dashboard shell rendered for all `/dashboard/*` routes.
- Fixed header: logo, notification bell (with unread count), user avatar
- Collapsible sidebar (mobile hamburger): 6 nav links + logout
- `<Outlet />` for nested page content
- `ChatWidget` mounted at bottom-right

### `ChatWidget.tsx`
- Connects to server via Socket.io on widget open
- Fetches message history from `chatApi`
- Sends/receives messages in real-time
- Unread badge on collapsed state
- User messages styled amber, admin messages white

### `SubscribeButton.tsx`
Reusable button that triggers `paymentApi.initSubscription()`. Manages its own loading state. Used in `Landing.tsx` and `Settings.tsx`.

---

## Pages

### `Landing.tsx`
Public marketing page. Sections: Hero, How It Works, Courses (fetched from API), Pricing, Affiliate program, Footer. Smooth-scroll anchors (`#pricing`, `#affiliate`, `#how-it-works`).

### `Courses.tsx`
Two-view component:
1. **Stage list view** — shown immediately when user clicks "My Courses". Displays each stage as a collapsible accordion row.
2. **Course player** — shown when user selects a specific course from within a stage.

**Stage list UX flow:**
```
My Courses
  └── Fish      [unlocked / locked indicator]
        ▼ (click dropdown)
        ├── Course A
        ├── Course B
        └── Course C
  └── Dolphin   [unlocked / locked indicator]
        ▼ (click dropdown)
        └── ...
  └── Shark     [unlocked / locked indicator]
        ▼ (click dropdown)
        └── ...
  └── Whale     [unlocked / locked indicator]
        ▼ (click dropdown)
        └── ...
```

- Each stage row is a **dropdown/accordion** — clicking it expands to reveal the courses that belong to that stage.
- A **lock or unlock indicator** is shown on each stage row so users can immediately see which stages they have access to.
- Locked stages are **still expandable** — the user can open the dropdown and browse the course names inside, but cannot play them. Clicking a locked course prompts an upgrade via Paystack.

Stage system with unlock via Paystack (rendered in this fixed order, not API order):

| Stage | Key | Price | Notes |
|-------|-----|-------|-------|
| 🐟 Become a Fish | `fish` | ₦5,000 | Entry stage — 7-day free trial on signup |
| 🐬 Become a Dolphin | `dolphin` | ₦15,000 | Paid |
| 🦈 Become a Shark | `shark` | ₦50,000 | Paid |
| 🐋 Become a Whale | `whale` | ₦150,000 | Paid |

Fish stage special behaviour: shows "Free · 7 days" label instead of a price when locked, and "Trial Active" badge when unlocked. When the trial has expired and the stage is still locked, the upgrade footer reads "Your 7-day free trial has ended — pay ₦5,000 to continue."

### `Referrals.tsx`
Referral link + QR code, stats, 6-level commission structure table, direct referrals list.

### `Earnings.tsx`
Commission history table. Filterable by status: all / pending / withdrawable / withdrawn.

### `Withdraw.tsx`
- Nigerian bank selector (37 banks)
- Account number verification via Paystack (`paymentApi.verifyAccount`)
- Min withdrawal: ₦10,000
- Withdrawal history table

### `SubscribeCallback.tsx`
Reads `?reference=` and `?type=` from URL. Calls the appropriate verification endpoint (`subscription` | `module` | `stage`), then redirects to `/dashboard/courses` on success.

### `Settings.tsx`
Profile form (name, phone), password change form, subscription status with trial end date.

---

## Payment Flow

Provider: **Paystack** (redirect-based)

```
1. Component calls paymentApi.init*() → receives Paystack checkout URL
2. Browser redirects to Paystack hosted page
3. After payment, Paystack redirects to /dashboard/subscribe/callback?reference=xxx&type=yyy
4. SubscribeCallback.tsx verifies the transaction with the backend
5. On success: AuthContext.refreshUser() called, then redirect to /dashboard/courses
```

---

## Styling

- **Tailwind CSS** with `@tailwindcss/vite` plugin
- Mobile-first responsive design (`sm:`, `md:`, `lg:` breakpoints)
- Color palette:

| Role | Color |
|------|-------|
| Primary / CTA | Amber — `#F5820A`, `#F59E0B` |
| Public pages bg | Dark — `gray-900` |
| Dashboard bg | Light — `gray-50` |
| Support theme | Dark blue — `#0D2847` |
| Fish stage 🐟 | Blue |
| Dolphin stage 🐬 | Teal |
| Shark stage 🦈 | Purple |
| Whale stage 🐋 | Amber |

---

## Environment Configuration

```bash
# .env
VITE_API_URL=https://api.selliberation.co/api
```

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → /dist
npm run lint     # ESLint
```

A `Dockerfile` is present for containerized deployment.

---

## TypeScript Types (`src/types/index.ts`)

Key interfaces:

| Interface | Key Fields |
|-----------|-----------|
| `User` | id, name, email, phone, role, subscription, stage, trial dates |
| `Course` | id, title, modules, thumbnail |
| `Module` | courseId, title, isFree, submodules |
| `Commission` | payerId, beneficiaryId, level (1–6), amount, status |
| `Withdrawal` | userId, amount, bankName, accountNumber, status |
| `Referral` | userId, referredUserId, level |

---

## Data Flow Diagram

```
User Action
    │
    ▼
Page Component (useState for loading/data/error)
    │
    ▼
services/api.ts  ←──── AuthContext (injects Bearer token)
    │
    ▼
Backend REST API  (VITE_API_URL)
    │
    ▼
Component renders data  ──► AuthContext.refreshUser() on auth-changing actions
```

Real-time chat bypasses the REST layer and connects directly via Socket.io.

---

## Key Design Patterns

1. **Protected/Public route wrappers** — auth guards in App.tsx, not per-page
2. **Centralized API client** — all fetch calls go through `services/api.ts`
3. **Layout wrapper pattern** — dashboard chrome lives in `Layout.tsx`, pages render in `<Outlet />`
4. **URL-driven state** — referral codes (`?ref=`), payment type (`?type=`), course slugs via params
5. **No global loading/error store** — each component owns its async state independently
