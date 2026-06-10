import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "./auth";

/**
 * Lite, zero-dependency database using Node's built-in SQLite (node:sqlite).
 * Persists to ./data/sez.db. A single connection is reused across hot reloads
 * via globalThis so dev mode doesn't open a new handle on every change.
 */

export type Product = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  available: number; // 0 | 1
  sort_order: number;
};

export type OrderRow = {
  id: number;
  customer_name: string;
  phone: string;
  address: string;
  items_json: string;
  total: number;
  note: string;
  status: string;
  created_at: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  address: string;
  password_hash: string;
  role: string;
  created_at: string;
};

type Glob = typeof globalThis & { __sezDb?: DatabaseSync };
const g = globalThis as Glob;

function init(): DatabaseSync {
  const dir = path.join(process.cwd(), "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "sez.db"));

  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      available INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL,
      total INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migrations for databases created before these columns existed.
  ensureColumn(db, "users", "phone", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "users", "address", "TEXT NOT NULL DEFAULT ''");
  ensureColumn(db, "orders", "address", "TEXT NOT NULL DEFAULT ''");

  seed(db);
  return db;
}

function ensureColumn(db: DatabaseSync, table: string, column: string, def: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  }
}

function seed(db: DatabaseSync) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (count.n === 0) {
    const insert = db.prepare(
      "INSERT INTO products (category, name, description, price, available, sort_order) VALUES (?,?,?,?,1,?)",
    );
    MENU_SEED.forEach((p, i) => insert.run(p.category, p.name, p.description, p.price, i));
  }

  const sCount = db.prepare("SELECT COUNT(*) AS n FROM settings").get() as { n: number };
  if (sCount.n === 0) {
    const set = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    Object.entries(DEFAULT_SETTINGS).forEach(([k, v]) => set.run(k, v));
  }

  // Seed a default admin so the dashboard is reachable immediately.
  // Credentials are documented in the README — change them after first login.
  const uCount = db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
  if (uCount.n === 0) {
    db.prepare(
      "INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,'admin')",
    ).run("admin@safarezaiqa.com", "Zaiqa Admin", hashPassword("Admin@123"));
  }
}

export function getDb(): DatabaseSync {
  if (!g.__sezDb) g.__sezDb = init();
  return g.__sezDb;
}

/* ----------------------------- Products ----------------------------- */

export function listProducts(opts: { onlyAvailable?: boolean } = {}): Product[] {
  const db = getDb();
  const where = opts.onlyAvailable ? "WHERE available = 1" : "";
  return db
    .prepare(`SELECT * FROM products ${where} ORDER BY sort_order ASC, id ASC`)
    .all() as Product[];
}

export function getProduct(id: number): Product | undefined {
  return getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as Product | undefined;
}

export function createProduct(p: {
  category: string;
  name: string;
  description?: string;
  price: number;
  available?: boolean;
}): Product {
  const db = getDb();
  const max = db.prepare("SELECT COALESCE(MAX(sort_order), 0) AS m FROM products").get() as {
    m: number;
  };
  const res = db
    .prepare(
      "INSERT INTO products (category, name, description, price, available, sort_order) VALUES (?,?,?,?,?,?)",
    )
    .run(
      p.category,
      p.name,
      p.description ?? "",
      Math.round(p.price),
      p.available === false ? 0 : 1,
      max.m + 1,
    );
  return getProduct(Number(res.lastInsertRowid))!;
}

export function updateProduct(
  id: number,
  p: Partial<{ category: string; name: string; description: string; price: number; available: boolean }>,
): Product | undefined {
  const existing = getProduct(id);
  if (!existing) return undefined;
  getDb()
    .prepare(
      "UPDATE products SET category=?, name=?, description=?, price=?, available=? WHERE id=?",
    )
    .run(
      p.category ?? existing.category,
      p.name ?? existing.name,
      p.description ?? existing.description,
      p.price != null ? Math.round(p.price) : existing.price,
      p.available == null ? existing.available : p.available ? 1 : 0,
      id,
    );
  return getProduct(id);
}

export function deleteProduct(id: number): boolean {
  const res = getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
  return Number(res.changes) > 0;
}

/* ----------------------------- Settings ----------------------------- */

export type Settings = {
  truck_label: string;
  address: string;
  truck_lat: string;
  truck_lng: string;
  maps_url: string;
  whatsapp_number: string;
  truck_status: string;
  hours: string;
};

export function getSettings(): Settings {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...map } as Settings;
}

export function updateSettings(partial: Partial<Settings>) {
  const db = getDb();
  const up = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );
  Object.entries(partial).forEach(([k, v]) => up.run(k, String(v ?? "")));
}

/* ----------------------------- Orders ------------------------------- */

export function createOrder(o: {
  customer_name: string;
  phone: string;
  address?: string;
  items: unknown;
  total: number;
  note?: string;
}): OrderRow {
  const db = getDb();
  const res = db
    .prepare(
      "INSERT INTO orders (customer_name, phone, address, items_json, total, note) VALUES (?,?,?,?,?,?)",
    )
    .run(
      o.customer_name,
      o.phone,
      o.address ?? "",
      JSON.stringify(o.items),
      Math.round(o.total),
      o.note ?? "",
    );
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(res.lastInsertRowid)) as OrderRow;
}

export function listOrders(): OrderRow[] {
  return getDb().prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 200").all() as OrderRow[];
}

export function updateOrderStatus(id: number, status: string): boolean {
  const res = getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  return Number(res.changes) > 0;
}

/* ------------------------------ Users ------------------------------- */

export function getUserByEmail(email: string): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as
    | User
    | undefined;
}

export function getUserById(id: number): User | undefined {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(u: {
  email: string;
  name: string;
  password_hash: string;
  role?: string;
  phone?: string;
  address?: string;
}): User {
  const db = getDb();
  const res = db
    .prepare(
      "INSERT INTO users (email, name, password_hash, role, phone, address) VALUES (?,?,?,?,?,?)",
    )
    .run(
      u.email.toLowerCase(),
      u.name,
      u.password_hash,
      u.role ?? "customer",
      u.phone ?? "",
      u.address ?? "",
    );
  return getUserById(Number(res.lastInsertRowid))!;
}

export function updateUserProfile(
  id: number,
  p: { name?: string; phone?: string; address?: string },
): User | undefined {
  const existing = getUserById(id);
  if (!existing) return undefined;
  getDb()
    .prepare("UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?")
    .run(p.name ?? existing.name, p.phone ?? existing.phone, p.address ?? existing.address, id);
  return getUserById(id);
}

/* --------------------------- Session store -------------------------- */

export function dbCreateSession(token: string, userId: number, expiresAt: number) {
  getDb().prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)").run(
    token,
    userId,
    expiresAt,
  );
}

export function dbGetSession(token: string): { user_id: number; expires_at: number } | undefined {
  return getDb()
    .prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?")
    .get(token) as { user_id: number; expires_at: number } | undefined;
}

export function dbDeleteSession(token: string) {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

/* ----------------------- Seed data (real menu) ---------------------- */

const MENU_SEED: { category: string; name: string; description: string; price: number }[] = [
  // The Signature Daigs
  { category: "The Signature Daigs", name: "Zaiqa-e-Khas Biryani — Chicken", description: "Saffron-infused long-grain basmati rice layered with tender marinated chicken & our secret spice blend.", price: 210 },
  { category: "The Signature Daigs", name: "Zaiqa-e-Khas Biryani — Beef", description: "Saffron-infused long-grain basmati rice layered with tender marinated beef & our secret spice blend.", price: 290 },
  { category: "The Signature Daigs", name: "Zaiqa-e-Khas Biryani — Mutton", description: "Saffron-infused long-grain basmati rice layered with tender marinated mutton & our secret spice blend.", price: 380 },
  { category: "The Signature Daigs", name: "Heritage Yakhni Pulao — Chicken", description: "Fragrant rice cooked in a rich, slow-simmered chicken bone broth for a subtle, soul-warming flavour.", price: 210 },
  { category: "The Signature Daigs", name: "Heritage Yakhni Pulao — Beef", description: "Fragrant rice cooked in a rich, slow-simmered beef bone broth for a subtle, soul-warming flavour.", price: 290 },

  // The "Safar" Combos
  { category: 'The "Safar" Combos', name: "The Solo Traveler", description: "Single Serving + Cooling Raita + Small Soft Drink.", price: 300 },
  { category: 'The "Safar" Combos', name: "The Caravan Deal", description: "2 Full Servings + Large Fresh Salad + 2 Soft Drinks.", price: 550 },
  { category: 'The "Safar" Combos', name: "Student Special — BSAI Edition", description: "Economy Biryani + Mint Chutney. Valid with Student ID.", price: 180 },

  // Humsafar (Sides)
  { category: "Humsafar (Sides)", name: "Extra Shami Kebab", description: "Soft, spiced shami kebab on the side.", price: 70 },
  { category: "Humsafar (Sides)", name: "Kachumbar Salad", description: "Fresh diced onion, tomato & cucumber salad.", price: 50 },
  { category: "Humsafar (Sides)", name: "Cooling Raita", description: "Creamy yoghurt raita to balance the spice.", price: 50 },
  { category: "Humsafar (Sides)", name: "Fresh Green Salad", description: "Crisp seasonal greens.", price: 60 },

  // Meetha Safar
  { category: "Meetha Safar", name: "Saffron Zarda", description: "Traditional sweet saffron rice.", price: 120 },
  { category: "Meetha Safar", name: "Signature Cheesecake", description: "House signature cheesecake.", price: 250 },

  // Beverages
  { category: "Beverages", name: "Seasonal Drink", description: "Fresh seasonal beverage.", price: 100 },
  { category: "Beverages", name: "Chai-e-Zaiqa", description: "Signature karak chai.", price: 80 },
  { category: "Beverages", name: "Soft Drinks / Water", description: "Chilled soft drink or mineral water.", price: 60 },
];

export const CATEGORY_ORDER = [
  "The Signature Daigs",
  'The "Safar" Combos',
  "Humsafar (Sides)",
  "Meetha Safar",
  "Beverages",
];

const DEFAULT_SETTINGS: Settings = {
  truck_label: "Safar-e-Zaiqa Food Truck",
  address: "Near University of Central Punjab, Johar Town, Lahore",
  truck_lat: "31.4486",
  truck_lng: "74.2701",
  maps_url: "https://maps.app.goo.gl/4L9iwSH7cJvMbNeT7",
  whatsapp_number: "",
  truck_status: "Open",
  hours: "Mon–Sat · 12:00 PM – 11:00 PM",
};
