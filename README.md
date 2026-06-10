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

## Tech

- **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**
- **Database:** Node's built-in **`node:sqlite`** (zero native install) →
  `data/sez.db`. Schema, the real menu, settings and the default admin are
  seeded automatically.
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
    db.ts                      # node:sqlite layer + seed (real menu)
    auth.ts                    # hashing + sessions
    content.ts, prompts.ts, types.ts
```
