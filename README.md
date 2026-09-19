# StudioOS — Creative Business OS for Freelancers & Studios

A production-ready Creative Business OS built for freelance videographers, photographers, cinematographers, and creative studios (IconTejas Studio).

---

## Key Features

1. **Studio Command Center (Dashboard)**
   - Financial KPIs: Total Invoiced, Collected Cash, Outstanding Balance, Overdue Follow-ups, and Active Shoots count.
   - Today's call times, client locations, and equipment prep reminders.
   - Actionable Overdue & Quotation cards with 1-click **WhatsApp** reminder links.
   - Interactive Project Lifecycle Pipeline (`LEAD` → `QUOTED` → `BOOKED` → `SHOOTING` → `EDITING` → `REVIEW` → `DELIVERED`).

2. **Client CRM & Dossier**
   - Full client directory with GSTIN, billing addresses, phone numbers, and company names.
   - Dedicated Client Detail Drawer with historical project records, balance overview, and secure Client Portal link generator.

3. **Shoots & Production Calendar**
   - Switchable **List** and **Calendar** views.
   - Detailed call times, shoot types (*Car Delivery, Automotive Promo, Reel, Drone, Photography, Event*), location mapping, and equipment checklists.

4. **Fast Quotation Builder & A4 Printable PDF**
   - Package presets and custom multi-line item calculations.
   - Editorial, branded A4 Quotation layout with UPI and bank transfer instructions.
   - 1-Click **"Convert to Invoice"** upon client acceptance.

5. **Invoices, Partial Payments & Automatic Balances**
   - Real-time balance calculations (`Total - Paid = Balance`).
   - Supports multiple partial payments (*UPI, Bank Transfer, Cash, Card*).
   - Automatic status transition to `PAID` when balance reaches zero.
   - 1-Click WhatsApp payment reminders.

6. **Money, Profitability & Expense Tracker**
   - Complete cash pipeline (*Quoted → Accepted → Invoiced → Realized Cash*).
   - Categorized studio & shoot expenses (*Fuel, Assistant Crew, Equipment Rental, Software, Travel*).
   - Automatic Net Studio Profit and Margin calculations.

7. **Dedicated Secure Client Portal (`/portal/:token`)**
   - Isolated client interface with zero access to freelancer revenue, profit, internal notes, or other clients.
   - Real-time project status progress bar.
   - Digital quotation review and instant 1-click acceptance with timestamp.
   - Embedded 4K video preview player and full-res download links.
   - Client deliverable approval or "Request Changes" revision comments that immediately trigger studio alerts.
   - Direct project chat with the videographer.

8. **Global Search (Ctrl + K / Cmd + K)**
   - Instant keyboard-driven lookup across Clients, Projects, Quotations, Invoices, and Phone numbers.

9. **Data Migration Importer**
   - 1-click importer for legacy prototype `localStorage` data.

---

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Vanilla CSS Design System with custom dark cinematic studio tokens, Lucide React icons, Canvas Confetti.
- **Backend & Database:** Supabase PostgreSQL with Row Level Security (RLS), Supabase Auth, Triggers, and Foreign Keys.
- **Resilience:** Built-in instant demo mode that functions immediately offline and connects smoothly to live Supabase upon entering API keys.

---

## Supabase Database Setup

1. Create a new project in [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and execute the contents of [supabase/schema.sql](file:///c:/Users/prasa/Downloads/icontejas-studio-mvp/supabase/schema.sql) to create all tables, indexes, triggers, and Row Level Security policies.
4. *(Optional)* Execute [supabase/seed.sql](file:///c:/Users/prasa/Downloads/icontejas-studio-mvp/supabase/seed.sql) to populate realistic initial demo data.
5. In your Supabase dashboard under **Project Settings > API**, copy your **Project URL** and **anon / public key**.
6. Create a `.env` file in the root directory (copy from `.env.example`):

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check & build production bundle
npm run build
```

The application will be running at `http://localhost:5173`.
