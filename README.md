# Safar-e-Zaiqa — Food Truck Platform + AI Marketing Intelligence

> _Daig Se Dil Tak_ — a desi **biryani & pulao** food truck. This project has
> **two sides**: a public **customer ordering site** and a black-&-gold **admin
> dashboard** (operations + the full Assignment 2 AI marketing analysis).

## Two sides

### 🍛 Customer site — `/`
- Browse the live menu (pulled from the database) grouped by category.
- **Customers must create an account and save a phone number + address before
  ordering** — the cart prompts login/registration and profile completion, then
  the saved details are used for every order (they can't be spoofed client-side).
- Add items to a cart, then **Order via WhatsApp** (the order is saved and a
  pre-filled WhatsApp message with their name/phone/address opens).
- See the **food truck's live location on an embedded Google Map**, hours and
  open/closed status, with an "Open in Google Maps" link.

### 🔒 Admin dashboard — `/admin` (login required)
**Operations**
- **Menu Manager** — add / edit / delete items and toggle availability. Changes
  appear on the customer site instantly.
- **Orders** — every order placed from the site, with status updates.
- **Location & Contact** — update the truck's map location (lat/lng + share
  link), hours, open/closed status and the **WhatsApp number** used for ordering.

**AI Marketing Intelligence (Assignment 2 — 100 marks)**
- Customer Intelligence · Sales Forecasting · Competitive Intelligence ·
  Marketing Automation · Executive Decision Challenge · Assumptions register,
  each with a live **AI generation panel**.

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000> for the customer site, or
<http://localhost:3000/admin> for the dashboard.

### Default admin login
A starter admin account is seeded automatically on first run:

```
Email:    admin@safarezaiqa.com
Password: Admin@123
```

> ⚠️ Change this after first login (you can register a new account on the login
> page). You can also create more staff accounts via **Register**.

### Enable WhatsApp ordering
The WhatsApp number is **blank by default** (so we never message a stranger).
Log in → **Location & Contact** → set the WhatsApp number with country code
(e.g. `923001234567`) and Save. The customer "Order via WhatsApp" button then
goes live. The default truck location points to the provided Google Maps pin.

### Enable the AI panels
Add your Google Gemini key to `.env.local` (free at
<https://aistudio.google.com/apikey>):

```bash
GEMINI_API_KEY=AIza...your_key...
```

The dashboard works fully without a key — only the **✦ Generate with AI** panels
need it.

## Deploying to Vercel (with Turso)

Vercel's serverless filesystem is read-only/ephemeral, so the local SQLite file
won't persist there. Use **Turso** (hosted libSQL — SQLite-compatible) for the
production database.

**1. Create a Turso database** (one-time):

```bash
# install the CLI (macOS/Linux/WSL): curl -sSfL https://get.tur.so/install.sh | bash
turso auth signup           # or: turso auth login
turso db create safar-e-zaiqa
turso db show safar-e-zaiqa          # copy the libsql:// URL
turso db tokens create safar-e-zaiqa # copy the auth token
```

> No CLI? Do the same from the dashboard at <https://turso.tech> → Create
> Database → copy the URL, then create a token.

**2. Add Environment Variables in Vercel** (Project → Settings → Environment
Variables, for Production + Preview):

| Name | Value |
| --- | --- |
| `GEMINI_API_KEY` | your Gemini key |
| `TURSO_DATABASE_URL` | `libsql://safar-e-zaiqa-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | the token from `turso db tokens create` |

**3. Redeploy.** On first request the app auto-creates the tables and seeds the
menu, settings and the default admin into Turso.

> Locally you don't need Turso — with the vars unset the app uses a local file
> (`./data/sez.db`). The exact same code runs in both places.

## Tech

- **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**
- **Database:** **libSQL / Turso** via `@libsql/client`. Production points at a
  hosted Turso DB (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`); local dev falls
  back to a `./data/sez.db` file. Schema, the real menu, settings and the default
  admin are seeded automatically on first run.
- **Auth:** scrypt-hashed passwords + httpOnly cookie sessions (no external deps).
- **AI:** Google Gemini via a secure server-side route handler.

## Project structure

```
app/
  page.tsx                     # Customer site (server → reads DB)
  admin/page.tsx               # Admin dashboard (auth-guarded)
  admin/login/page.tsx         # Login / register
  api/
    auth/{login,register,logout}/route.ts       # admin auth + shared login
    account/{register,me,profile}/route.ts      # customer accounts + profile
    products/route.ts  products/[id]/route.ts   # menu CRUD
    orders/route.ts    orders/[id]/route.ts     # orders (login + profile required)
    settings/route.ts                           # location & contact
    generate/route.ts                           # Gemini proxy
  components/
    customer/CustomerApp.tsx   # menu, cart, WhatsApp order, map
    admin/{MenuManager,OrdersPanel,LocationSettings}.tsx
    Dashboard.tsx              # admin tabbed shell
    sections/                  # the 5 marketing parts + Assumptions
  lib/
    db.ts                      # libSQL/Turso layer + seed (real menu)
    auth.ts                    # hashing + sessions
    content.ts, prompts.ts, types.ts
```
