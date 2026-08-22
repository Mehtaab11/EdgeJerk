# ⚡ EdgeJerk — Personal Trading Journal Terminal

A high-density, terminal-inspired personal trading journal and quantitative performance analytics web application built with **Next.js (App Router)**, **TypeScript**, **Supabase (Postgres & Storage)**, **Tailwind CSS**, **Recharts**, and **Zustand**.

---

## ✨ Features

- **🔒 Data Security & Row Level Security (RLS)**: Single-user design with strict Supabase Row Level Security policies on every database table (`auth.uid() = user_id`).
- **🧮 Server-Side Write Calculation Engine**: Automatically calculates derived metrics on trade creation/updates: Net P&L ($ and %), Initial Risk Amount ($), Risk % of Account, R-Multiple, UTC Session auto-detection, and Pre-Trade Plan Slippage.
- **📝 6-Section Trade Logger**:
  - **Section 0**: Timestamped Pre-Trade Plan (planned entry, stop loss, take profit, thesis).
  - **Section 1**: Trade Basics (asset, direction, size, entry/exit timestamp, duration readout, session auto-detect & override, broker).
  - **Section 2**: Price & Risk (entry/exit prices, stop/target, fees, balance, leverage, live bold P&L readout & R-multiple).
  - **Section 3**: Strategy & Context (setup tags, market conditions, correlated positions, news event tags, before/after chart screenshots).
  - **Section 4**: Exit & Execution Review (segmented exit reason, 1-5 bar trade grade dial).
  - **Section 5**: Psychology & Review (emotional state text chips, rule compliance binary toggle, mistake tags multi-select, lessons learned).
- **📊 14 Quantitative Analytics Endpoints & Recharts Visualizations**:
  - **Zone 1 (Performance)**: Equity curve, Drawdown depth curve, Risk % over time.
  - **Zone 2 (Strategy Edge)**: Expectancy matrix table, R-multiple distribution histogram, Win % & Avg R paired bars.
  - **Zone 3 (Execution Quality)**: Exit reason breakdown, Trade grade vs outcome scatter plot, Plan deviation & slippage stats.
  - **Zone 4 (Behavioral Impact)**: Mistake tag frequency & cost ranked bar chart, P&L by emotional state, Rule compliance % over time line chart.
  - **Zone 5 (Exposure & Context)**: Correlated vs isolated trade P&L comparison, GitHub-style calendar heatmap, Session and news event breakdown.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database & Auth**: Supabase (Postgres Database, Supabase Auth, Supabase Storage)
- **Styling**: Tailwind CSS, custom ink-toned terminal theme (`#0a0f1e` base, `#dfff00` cyber lime accent)
- **Typography**: Google Fonts `Hanken Grotesk` (headlines) & `JetBrains Mono` (tabular numbers)
- **Form Handling**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **State Management**: Zustand
- **Charting**: Recharts

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ and npm installed.
- A Supabase project created at [supabase.com](https://supabase.com).

### 2. Environment Setup
Copy `.env.example` to `.env.local` and add your Supabase connection parameters:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_your_key_here
```

### 3. Database Migration
1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run the migration script located in [`supabase/migrations/20260822000000_initial_schema.sql`](supabase/migrations/20260822000000_initial_schema.sql).
3. This creates all 8 database tables, composite indexes, triggers, RLS policies, and the `trade-screenshots` storage bucket.

### 4. Install Dependencies & Start Dev Server
```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Verification & Testing

- **TypeScript Strict Compilation Check**:
  ```bash
  npm run typecheck
  ```
- **Backend Calculation & Validation Unit Tests**:
  ```bash
  npx tsx scratch/test-backend.ts
  ```
- **Production Build Optimization**:
  ```bash
  npm run build
  ```

---

## 📁 Repository Structure

```
.
├── supabase/
│   └── migrations/
│       └── 20260822000000_initial_schema.sql  # Database DDL schema, RLS policies & indexes
├── src/
│   ├── app/
│   │   ├── api/                               # 32 Next.js App Router API Route Handlers
│   │   │   ├── analytics/                     # 14 Analytics aggregation endpoints
│   │   │   ├── auth/                          # Signup, Login, Logout, Session check
│   │   │   ├── trade-plans/                   # Pre-trade plans CRUD
│   │   │   ├── trades/                        # Trades CRUD & search query engine
│   │   │   ├── tags/                          # Strategy & mistake tags CRUD
│   │   │   ├── screenshots/                   # Supabase storage upload handler
│   │   │   └── weekly-reviews/                # Weekly reviews CRUD
│   │   ├── page.tsx                           # Dashboard screen
│   │   ├── login/page.tsx                     # Auth screen
│   │   ├── trades/
│   │   │   ├── page.tsx                       # Trade log & filter bar screen
│   │   │   ├── new/page.tsx                   # 6-section trade entry form
│   │   │   └── [id]/page.tsx                  # Trade detail & screenshots view
│   │   └── analytics/page.tsx                 # Deep review analytics screen (Zones 1-5)
│   ├── components/
│   │   ├── layout/NavigationHeader.tsx        # Terminal navbar
│   │   └── ui/                                # Reusable UI components
│   ├── lib/
│   │   ├── supabase/                          # Browser, server, and middleware clients
│   │   ├── utils/trade-calculations.ts        # Derived metric calculation engine
│   │   └── validations/                       # Zod validation schemas
│   ├── stores/                                # Zustand state stores (auth & filter)
│   └── types/                                 # Supabase & API TypeScript interfaces
├── scratch/
│   └── test-backend.ts                        # Backend calculation & Zod test script
├── package.json
└── README.md
```

---

## 📜 License
MIT License
