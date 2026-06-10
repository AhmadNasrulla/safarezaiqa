import { createClient, type Client, type InValue, type ResultSet } from "@libsql/client";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { hashPassword } from "./auth";

/**
 * Database layer built on libSQL (@libsql/client) — SQLite-compatible.
 *
 *  • Production / Vercel: set TURSO_DATABASE_URL (libsql://…) + TURSO_AUTH_TOKEN.
 *  • Local dev: no env vars needed — falls back to a local file at ./data/sez.db.
 *
 * libSQL is async, so every helper returns a Promise. Schema + seed run once,
 * memoised on globalThis so dev hot-reloads reuse the same connection.
 */

export type Product = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image: string;
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

type Glob = typeof globalThis & { __sezClient?: Client; __sezReady?: Promise<Client> };
const g = globalThis as Glob;

function rawClient(): Client {
  if (g.__sezClient) return g.__sezClient;
  const url = process.env.TURSO_DATABASE_URL?.trim() || "file:./data/sez.db";
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (url.startsWith("file:")) {
    // Ensure the local folder exists before opening the file DB.
    const rel = url.slice("file:".length);
    mkdirSync(path.dirname(path.resolve(rel)), { recursive: true });
  }
  g.__sezClient = createClient(authToken ? { url, authToken } : { url });
  return g.__sezClient;
}

/** Returns a ready client (schema created + seeded), memoised. */
function db(): Promise<Client> {
  if (!g.__sezReady) g.__sezReady = init();
  return g.__sezReady;
}

async function init(): Promise<Client> {
  const c = rawClient();

  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      available INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL,
      total INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  ];
  for (const sql of tables) await c.execute(sql);

  // Best-effort migrations for DBs created before these columns existed.
  await ensureColumn(c, "users", "phone", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(c, "users", "address", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(c, "orders", "address", "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(c, "products", "image", "TEXT NOT NULL DEFAULT ''");

  await seed(c);
  await backfillImages(c);
  return c;
}

/**
 * One-time backfill of seed image paths onto existing rows (e.g. a Turso DB
 * that was seeded before the image column existed). Idempotent: only fills
 * empty images, and runs once (guarded by the `images_seeded` setting).
 */
const IMAGE_BACKFILL_VERSION = "2";

async function backfillImages(c: Client) {
  const flag = await c.execute("SELECT value FROM settings WHERE key = 'images_seeded'");
  const current = (flag.rows[0] as Record<string, unknown> | undefined)?.value;
  if (current === IMAGE_BACKFILL_VERSION) return; // bump the version to re-run
  for (const p of MENU_SEED) {
    if (!p.image) continue;
    await c.execute({
      sql: "UPDATE products SET image = ? WHERE name = ? AND (image = '' OR image IS NULL)",
      args: [p.image, p.name],
    });
  }
  await c.execute({
    sql: "INSERT INTO settings (key, value) VALUES ('images_seeded', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    args: [IMAGE_BACKFILL_VERSION],
  });
}

async function ensureColumn(c: Client, table: string, column: string, def: string) {
  try {
    const rs = await c.execute(`PRAGMA table_info(${table})`);
    const has = rs.rows.some((r) => (r as Record<string, unknown>).name === column);
    if (!has) await c.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  } catch {
    /* ignore — column most likely already exists */
  }
}

async function seed(c: Client) {
  const pc = await c.execute("SELECT COUNT(*) AS n FROM products");
  if (Number((pc.rows[0] as Record<string, unknown>).n) === 0) {
    for (let i = 0; i < MENU_SEED.length; i++) {
      const p = MENU_SEED[i];
      await c.execute({
        sql: "INSERT INTO products (category, name, description, price, image, available, sort_order) VALUES (?,?,?,?,?,1,?)",
        args: [p.category, p.name, p.description, p.price, p.image ?? "", i],
      });
    }
  }

  const sc = await c.execute("SELECT COUNT(*) AS n FROM settings");
  if (Number((sc.rows[0] as Record<string, unknown>).n) === 0) {
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      await c.execute({ sql: "INSERT INTO settings (key, value) VALUES (?, ?)", args: [k, v] });
    }
  }

  // Seed a default admin so the dashboard is reachable immediately.
  const uc = await c.execute("SELECT COUNT(*) AS n FROM users");
  if (Number((uc.rows[0] as Record<string, unknown>).n) === 0) {
    await c.execute({
      sql: "INSERT INTO users (email, name, password_hash, role) VALUES (?,?,?,'admin')",
      args: ["admin@safarezaiqa.com", "Zaiqa Admin", hashPassword("Admin@123")],
    });
  }
}

/* --------------------------- query helpers -------------------------- */

function mapRows<T>(rs: ResultSet): T[] {
  return rs.rows.map((row) => {
    const o: Record<string, unknown> = {};
    for (const col of rs.columns) o[col] = (row as Record<string, unknown>)[col];
    return o as T;
  });
}

async function all<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const c = await db();
  return mapRows<T>(await c.execute({ sql, args }));
}

async function one<T>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}

/* ----------------------------- Products ----------------------------- */

export async function listProducts(opts: { onlyAvailable?: boolean } = {}): Promise<Product[]> {
  const where = opts.onlyAvailable ? "WHERE available = 1" : "";
  return all<Product>(`SELECT * FROM products ${where} ORDER BY sort_order ASC, id ASC`);
}

export async function getProduct(id: number): Promise<Product | undefined> {
  return one<Product>("SELECT * FROM products WHERE id = ?", [id]);
}

export async function createProduct(p: {
  category: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available?: boolean;
}): Promise<Product> {
  const c = await db();
  const max = await one<{ m: number }>("SELECT COALESCE(MAX(sort_order), 0) AS m FROM products");
  const rs = await c.execute({
    sql: "INSERT INTO products (category, name, description, price, image, available, sort_order) VALUES (?,?,?,?,?,?,?) RETURNING *",
    args: [
      p.category,
      p.name,
      p.description ?? "",
      Math.round(p.price),
      p.image ?? "",
      p.available === false ? 0 : 1,
      (max?.m ?? 0) + 1,
    ],
  });
  return mapRows<Product>(rs)[0];
}

export async function updateProduct(
  id: number,
  p: Partial<{ category: string; name: string; description: string; price: number; image: string; available: boolean }>,
): Promise<Product | undefined> {
  const existing = await getProduct(id);
  if (!existing) return undefined;
  const c = await db();
  const rs = await c.execute({
    sql: "UPDATE products SET category=?, name=?, description=?, price=?, image=?, available=? WHERE id=? RETURNING *",
    args: [
      p.category ?? existing.category,
      p.name ?? existing.name,
      p.description ?? existing.description,
      p.price != null ? Math.round(p.price) : existing.price,
      p.image ?? existing.image,
      p.available == null ? existing.available : p.available ? 1 : 0,
      id,
    ],
  });
  return mapRows<Product>(rs)[0];
}

export async function deleteProduct(id: number): Promise<boolean> {
  const c = await db();
  const rs = await c.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
  return rs.rowsAffected > 0;
}

/* ----------------------------- Settings ----------------------------- */

export async function getSettings(): Promise<Settings> {
  const rows = await all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...DEFAULT_SETTINGS, ...map } as Settings;
}

export async function updateSettings(partial: Partial<Settings>) {
  const c = await db();
  for (const [k, v] of Object.entries(partial)) {
    await c.execute({
      sql: "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [k, String(v ?? "")],
    });
  }
}

/* ----------------------------- Orders ------------------------------- */

export async function createOrder(o: {
  customer_name: string;
  phone: string;
  address?: string;
  items: unknown;
  total: number;
  note?: string;
}): Promise<OrderRow> {
  const c = await db();
  const rs = await c.execute({
    sql: "INSERT INTO orders (customer_name, phone, address, items_json, total, note) VALUES (?,?,?,?,?,?) RETURNING *",
    args: [
      o.customer_name,
      o.phone,
      o.address ?? "",
      JSON.stringify(o.items),
      Math.round(o.total),
      o.note ?? "",
    ],
  });
  return mapRows<OrderRow>(rs)[0];
}

export async function listOrders(): Promise<OrderRow[]> {
  return all<OrderRow>("SELECT * FROM orders ORDER BY id DESC LIMIT 200");
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  const c = await db();
  const rs = await c.execute({ sql: "UPDATE orders SET status = ? WHERE id = ?", args: [status, id] });
  return rs.rowsAffected > 0;
}

/* ------------------------------ Users ------------------------------- */

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return one<User>("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
}

export async function getUserById(id: number): Promise<User | undefined> {
  return one<User>("SELECT * FROM users WHERE id = ?", [id]);
}

export async function createUser(u: {
  email: string;
  name: string;
  password_hash: string;
  role?: string;
  phone?: string;
  address?: string;
}): Promise<User> {
  const c = await db();
  const rs = await c.execute({
    sql: "INSERT INTO users (email, name, password_hash, role, phone, address) VALUES (?,?,?,?,?,?) RETURNING *",
    args: [
      u.email.toLowerCase(),
      u.name,
      u.password_hash,
      u.role ?? "customer",
      u.phone ?? "",
      u.address ?? "",
    ],
  });
  return mapRows<User>(rs)[0];
}

export async function updateUserProfile(
  id: number,
  p: { name?: string; phone?: string; address?: string },
): Promise<User | undefined> {
  const existing = await getUserById(id);
  if (!existing) return undefined;
  const c = await db();
  const rs = await c.execute({
    sql: "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ? RETURNING *",
    args: [p.name ?? existing.name, p.phone ?? existing.phone, p.address ?? existing.address, id],
  });
  return mapRows<User>(rs)[0];
}

/* --------------------------- Session store -------------------------- */

export async function dbCreateSession(token: string, userId: number, expiresAt: number) {
  const c = await db();
  await c.execute({
    sql: "INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)",
    args: [token, userId, expiresAt],
  });
}

export async function dbGetSession(
  token: string,
): Promise<{ user_id: number; expires_at: number } | undefined> {
  return one<{ user_id: number; expires_at: number }>(
    "SELECT user_id, expires_at FROM sessions WHERE token = ?",
    [token],
  );
}

export async function dbDeleteSession(token: string) {
  const c = await db();
  await c.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
}

/* ----------------------- Seed data (real menu) ---------------------- */

const MENU_SEED: { category: string; name: string; description: string; price: number; image?: string }[] = [
  // The Signature Daigs
  { category: "The Signature Daigs", name: "Zaiqa-e-Khas Biryani — Chicken", description: "Saffron-infused long-grain basmati rice layered with tender marinated chicken & our secret spice blend.", price: 210, image: "/items/biryani-chicken.png" },
  { category: "The Signature Daigs", name: "Zaiqa-e-Khas Biryani — Beef", description: "Saffron-infused long-grain basmati rice layered with tender marinated beef & our secret spice blend.", price: 290, image: "/items/biryani-beef.png" },
  { category: "The Signature Daigs", name: "Zaiqa-e-Khas Biryani — Mutton", description: "Saffron-infused long-grain basmati rice layered with tender marinated mutton & our secret spice blend.", price: 380, image: "/items/biryani-mutton.png" },
  { category: "The Signature Daigs", name: "Heritage Yakhni Pulao — Chicken", description: "Fragrant rice cooked in a rich, slow-simmered chicken bone broth for a subtle, soul-warming flavour.", price: 210, image: "/items/pulao-chicken.png" },
  { category: "The Signature Daigs", name: "Heritage Yakhni Pulao — Beef", description: "Fragrant rice cooked in a rich, slow-simmered beef bone broth for a subtle, soul-warming flavour.", price: 290, image: "/items/pulao-beef.jpeg" },

  // The "Safar" Combos
  { category: 'The "Safar" Combos', name: "The Solo Traveler", description: "Single Serving + Cooling Raita + Small Soft Drink.", price: 300, image: "/items/solo-traveler.jpeg" },
  { category: 'The "Safar" Combos', name: "The Caravan Deal", description: "2 Full Servings + Large Fresh Salad + 2 Soft Drinks.", price: 550, image: "/items/caravan-deal.jpeg" },
  { category: 'The "Safar" Combos', name: "Student Special — BSAI Edition", description: "Economy Biryani + Mint Chutney. Valid with Student ID.", price: 180, image: "/items/student-special.jpeg" },

  // Humsafar (Sides)
  { category: "Humsafar (Sides)", name: "Extra Shami Kebab", description: "Soft, spiced shami kebab on the side.", price: 70, image: "/items/shami-kebab.jpeg" },
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
