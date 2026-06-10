"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product, PublicSettings, CartItem, CustomerUser } from "@/app/lib/types";
import { CATEGORY_ORDER } from "@/app/lib/types";
import { AccountPanel } from "@/app/components/customer/AccountPanel";

const rs = (n: number) => `Rs. ${n.toLocaleString()}`;

export function CustomerApp({
  products,
  settings,
}: {
  products: Product[];
  settings: PublicSettings;
}) {
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [open, setOpen] = useState(false); // cart drawer
  const [accountOpen, setAccountOpen] = useState(false);
  const [me, setMe] = useState<CustomerUser | null>(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user ?? null))
      .catch(() => {});
  }, []);

  const items = Object.values(cart);
  const count = items.reduce((s, it) => s + it.qty, 0);
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  function add(p: Product) {
    setCart((c) => {
      const cur = c[p.id];
      return { ...c, [p.id]: { id: p.id, name: p.name, price: p.price, qty: (cur?.qty ?? 0) + 1 } };
    });
  }
  function dec(id: number) {
    setCart((c) => {
      const cur = c[id];
      if (!cur) return c;
      const next = { ...c };
      if (cur.qty <= 1) delete next[id];
      else next[id] = { ...cur, qty: cur.qty - 1 };
      return next;
    });
  }
  function clear() {
    setCart({});
  }

  const grouped = useMemo(() => groupByCategory(products), [products]);
  const isOpen = settings.truck_status?.toLowerCase() !== "closed";
  const firstName = me?.name?.split(" ")[0] ?? "";

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft to-gold-deep text-base font-black text-[#1a1505]">
              S
            </span>
            <span>
              <span className="block text-sm font-bold leading-none text-gradient-gold">
                Safar-e-Zaiqa
              </span>
              <span className="block text-[10px] text-text-dim">Daig Se Dil Tak</span>
            </span>
          </a>
          <div className="flex items-center gap-2">
            <a href="#menu" className="hidden rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text sm:block">
              Menu
            </a>
            <a href="#location" className="hidden rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text sm:block">
              Location
            </a>
            <button
              onClick={() => setAccountOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition hover:border-gold/40"
            >
              {me ? (
                <>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold-deep text-[11px] font-black text-[#1a1505]">
                    {firstName.charAt(0).toUpperCase() || "U"}
                  </span>
                  <span className="hidden sm:inline">{firstName}</span>
                </>
              ) : (
                <>👤 Login</>
              )}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-3.5 py-2 text-sm font-semibold text-[#1a1505] transition hover:brightness-110"
            >
              🛒 Cart
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red px-1 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="relative mt-6 overflow-hidden rounded-3xl border border-border bg-surface/60 p-8 sm:p-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-red/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                isOpen ? "border-green/40 bg-green/10 text-green" : "border-red/40 bg-red/10 text-red"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-green" : "bg-red"}`} />
              {isOpen ? "Open now" : "Currently closed"} · {settings.hours}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Authentic Desi <span className="text-gradient-gold">Biryani &amp; Pulao</span>,
              <br className="hidden sm:block" /> straight from the daig.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-text-muted">
              Saffron-infused, slow-cooked and student-friendly. Create an account, order ahead, and
              pick up hot &amp; fresh from our truck near {settings.address}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="rounded-xl bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-3 text-sm font-semibold text-[#1a1505] transition hover:brightness-110"
              >
                🍛 Order Now
              </a>
              <a
                href="#location"
                className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-gold/40"
              >
                📍 Find the Truck
              </a>
            </div>
          </div>
        </section>

        {/* Menu */}
        <section id="menu" className="mt-14 scroll-mt-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Our Menu</h2>
              <p className="mt-1 text-sm text-text-muted">Tap a dish to add it to your order.</p>
            </div>
          </div>

          <div className="mt-6 space-y-10">
            {grouped.map(([category, list]) => (
              <div key={category}>
                <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold text-gold-soft">
                  <span className="h-px w-6 flex-none bg-gold/40" />
                  {category}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {list.map((p) => {
                    const qty = cart[p.id]?.qty ?? 0;
                    return (
                      <div
                        key={p.id}
                        className="card-hover flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface/70 p-4"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-text">{p.name}</p>
                          {p.description && (
                            <p className="mt-1 text-xs leading-relaxed text-text-muted">{p.description}</p>
                          )}
                          <p className="mt-2 text-sm font-bold text-gold-soft">{rs(p.price)}</p>
                        </div>
                        {qty === 0 ? (
                          <button
                            onClick={() => add(p)}
                            className="shrink-0 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold-soft transition hover:bg-gold/20"
                          >
                            + Add
                          </button>
                        ) : (
                          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface-2 p-1">
                            <button onClick={() => dec(p.id)} className="h-7 w-7 rounded-md bg-surface text-text-muted hover:text-text">
                              −
                            </button>
                            <span className="w-5 text-center text-sm font-semibold text-text">{qty}</span>
                            <button onClick={() => add(p)} className="h-7 w-7 rounded-md bg-gradient-to-br from-gold-soft to-gold-deep font-bold text-[#1a1505]">
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="rounded-xl border border-border bg-surface p-6 text-center text-text-muted">
                The menu is being updated. Please check back shortly.
              </p>
            )}
          </div>
        </section>

        {/* Location */}
        <LocationSection settings={settings} isOpen={isOpen} />

        <footer className="mt-16 border-t border-border py-8 text-center text-xs text-text-dim">
          <p className="text-sm font-bold text-gradient-gold">Safar-e-Zaiqa — Daig Se Dil Tak</p>
          <p className="mt-2">{settings.address}</p>
          <p className="mt-3">
            <Link href="/admin" className="text-text-muted underline-offset-2 hover:text-gold-soft hover:underline">
              Admin / Staff login →
            </Link>
          </p>
        </footer>
      </main>

      {/* Cart drawer */}
      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        total={total}
        me={me}
        settings={settings}
        onInc={(id) => add(products.find((p) => p.id === id)!)}
        onDec={dec}
        onClear={clear}
        onRequireAccount={() => setAccountOpen(true)}
      />

      {/* Account modal */}
      {accountOpen && (
        <AccountPanel
          me={me}
          onClose={() => setAccountOpen(false)}
          onAuthed={(u) => {
            setMe(u);
            if (u.phone && u.address) setAccountOpen(false);
          }}
          onLogout={() => {
            setMe(null);
            setAccountOpen(false);
          }}
        />
      )}

      {/* Mobile floating cart */}
      {count > 0 && !open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-soft to-gold-deep px-6 py-3 text-sm font-bold text-[#1a1505] shadow-lg sm:hidden"
        >
          🛒 {count} item{count > 1 ? "s" : ""} · {rs(total)} · View Cart
        </button>
      )}
    </div>
  );
}

function groupByCategory(products: Product[]): [string, Product[]][] {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    if (!map.has(p.category)) map.set(p.category, []);
    map.get(p.category)!.push(p);
  }
  const ordered: [string, Product[]][] = [];
  for (const cat of CATEGORY_ORDER) {
    if (map.has(cat)) {
      ordered.push([cat, map.get(cat)!]);
      map.delete(cat);
    }
  }
  for (const [cat, list] of map) ordered.push([cat, list]);
  return ordered;
}

/* ----------------------------- Cart drawer ----------------------------- */

function CartDrawer({
  open,
  onClose,
  items,
  total,
  me,
  settings,
  onInc,
  onDec,
  onClear,
  onRequireAccount,
}: {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  me: CustomerUser | null;
  settings: PublicSettings;
  onInc: (id: number) => void;
  onDec: (id: number) => void;
  onClear: () => void;
  onRequireAccount: () => void;
}) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState("");

  const profileComplete = !!(me && me.phone && me.address);
  const waDigits = (settings.whatsapp_number || "").replace(/\D/g, "");

  async function checkout() {
    if (items.length === 0) return;
    if (!profileComplete) {
      onRequireAccount();
      return;
    }
    setSending(true);
    setDone("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "AUTH_REQUIRED" || data?.code === "PROFILE_INCOMPLETE") {
          onRequireAccount();
        } else {
          setDone(data?.error ?? "Could not place the order.");
        }
        return;
      }

      if (waDigits && me) {
        const lines = items.map((it) => `${it.qty}x ${it.name} — Rs. ${it.price * it.qty}`).join("\n");
        const msg =
          `*New Order #${data.id} — Safar-e-Zaiqa*\n\n${lines}\n\n*Total: Rs. ${total}*\n\n` +
          `Name: ${me.name}\nPhone: ${me.phone}\nAddress: ${me.address}` +
          (note ? `\nNote: ${note}` : "");
        window.open(`https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`, "_blank");
        setDone(`Order #${data.id} placed! Opening WhatsApp to confirm…`);
      } else {
        setDone(`Order #${data.id} placed! Our team will reach out to confirm.`);
      }
    } catch {
      setDone("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-bg-soft transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-lg font-bold text-text">Your Order</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-text-muted hover:text-text">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-text-muted">
              Your cart is empty. Add some daigs! 🍛
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 rounded-xl border border-border-soft bg-surface/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text">{it.name}</p>
                    <p className="text-xs text-gold-soft">{rs(it.price)} each</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-1">
                    <button onClick={() => onDec(it.id)} className="h-7 w-7 rounded-md bg-surface text-text-muted hover:text-text">
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{it.qty}</span>
                    <button onClick={() => onInc(it.id)} className="h-7 w-7 rounded-md bg-gradient-to-br from-gold-soft to-gold-deep font-bold text-[#1a1505]">
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Account / delivery state */}
          {items.length > 0 && (
            <div className="mt-5">
              {!me ? (
                <div className="rounded-xl border border-amber/40 bg-amber/10 p-4">
                  <p className="text-sm font-medium text-amber">Please log in to order</p>
                  <p className="mt-1 text-xs text-text-muted">
                    You&apos;ll need an account with your phone number and address.
                  </p>
                  <button
                    onClick={onRequireAccount}
                    className="mt-3 w-full rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-soft hover:bg-gold/20"
                  >
                    Log in / Register
                  </button>
                </div>
              ) : !profileComplete ? (
                <div className="rounded-xl border border-amber/40 bg-amber/10 p-4">
                  <p className="text-sm font-medium text-amber">Complete your profile</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Add your phone number and address before ordering.
                  </p>
                  <button
                    onClick={onRequireAccount}
                    className="mt-3 w-full rounded-lg border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold-soft hover:bg-gold/20"
                  >
                    Add phone &amp; address
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-border-soft bg-surface/60 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                    Delivering / handing over to
                  </p>
                  <p className="text-sm font-medium text-text">{me.name}</p>
                  <p className="text-sm text-text-muted">📞 {me.phone}</p>
                  <p className="text-sm text-text-muted">📍 {me.address}</p>
                  <button
                    onClick={onRequireAccount}
                    className="mt-2 text-xs text-gold-soft underline-offset-2 hover:underline"
                  >
                    Edit details
                  </button>
                </div>
              )}

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notes (spice level, pickup time)…"
                rows={2}
                className="mt-3 w-full resize-none rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50"
              />
            </div>
          )}

          {done && (
            <div className="animate-fade-up mt-4 rounded-lg border border-green/40 bg-green/10 px-4 py-3 text-sm text-green">
              ✓ {done}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={onClear} className="text-xs text-text-dim hover:text-red">
                Clear cart
              </button>
              <div className="text-right">
                <p className="text-xs text-text-dim">Total</p>
                <p className="text-xl font-bold text-gradient-gold">{rs(total)}</p>
              </div>
            </div>
            <button
              onClick={checkout}
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-[#06310f] transition hover:brightness-105 disabled:opacity-60"
            >
              {sending ? (
                "Placing order…"
              ) : profileComplete ? (
                <>
                  <WhatsAppIcon /> Order Now 
                </>
              ) : (
                "Log in to order"
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ----------------------------- Location ----------------------------- */

function LocationSection({ settings, isOpen }: { settings: PublicSettings; isOpen: boolean }) {
  const lat = settings.truck_lat?.trim();
  const lng = settings.truck_lng?.trim();
  const embed =
    lat && lng
      ? `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&z=15&output=embed`;
  const waDigits = (settings.whatsapp_number || "").replace(/\D/g, "");

  return (
    <section id="location" className="mt-14 scroll-mt-20">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Find the Truck</h2>
      <p className="mt-1 text-sm text-text-muted">We move with the crowd — here&apos;s where we are right now.</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-border lg:col-span-3">
          <iframe
            title="Safar-e-Zaiqa location"
            src={embed}
            className="h-[320px] w-full lg:h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-surface/70 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-text">{settings.truck_label}</h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  isOpen ? "border-green/40 bg-green/10 text-green" : "border-red/40 bg-red/10 text-red"
                }`}
              >
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className="mt-2 flex gap-2 text-sm text-text-muted">
              <span>📍</span> {settings.address}
            </p>
            <p className="mt-1.5 flex gap-2 text-sm text-text-muted">
              <span>🕒</span> {settings.hours}
            </p>
          </div>

          <a
            href={settings.maps_url || embed}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-text transition hover:border-gold/40"
          >
            🧭 Open in Google Maps
          </a>

          {waDigits ? (
            <a
              href={`https://wa.me/${waDigits}?text=${encodeURIComponent("Assalam-o-Alaikum! I'd like to ask about Safar-e-Zaiqa 🍛")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-[#06310f] transition hover:brightness-105"
            >
              <WhatsAppIcon /> WhatsApp Us
            </a>
          ) : (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-xs text-text-dim">
              WhatsApp contact coming soon.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.86 9.86 0 0 0 12.04 2zm0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.42 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24zm4.76 10.34c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.67.85-.83 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.4-2.1-1.29-.78-.69-1.3-1.55-1.46-1.81-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.07-.13-.59-1.42-.81-1.94-.21-.51-.43-.44-.59-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.16 0 1.27.92 2.5 1.05 2.67.13.17 1.82 2.78 4.42 3.9.62.27 1.1.43 1.47.55.62.2 1.18.17 1.63.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.11-.24-.18-.5-.31z" />
    </svg>
  );
}
