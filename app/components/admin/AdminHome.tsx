"use client";

import { useEffect, useState } from "react";
import type { SafeUser } from "@/app/lib/auth";
import { Card, Stat, Pill } from "@/app/components/ui";
import { LineChart } from "@/app/components/Chart";

type Order = {
  id: number;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
  items_json: string;
};
type Product = { id: number; available: number };
type Feedback = { id: number; rating: number; sentiment: string; status: string };

const rs = (n: number) => `Rs. ${n.toLocaleString()}`;

export function AdminHome({
  user,
  onNavigate,
}: {
  user: SafeUser;
  onNavigate: (id: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/orders").then((r) => (r.ok ? r.json() : { orders: [] })),
      fetch("/api/products").then((r) => (r.ok ? r.json() : { products: [] })),
      fetch("/api/feedback").then((r) => (r.ok ? r.json() : { feedback: [] })),
    ])
      .then(([o, p, f]) => {
        setOrders(o.orders ?? []);
        setProducts(p.products ?? []);
        setFeedback(f.feedback ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = orders.filter((o) => o.status !== "cancelled");
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "new" || o.status === "preparing").length;
  const liveItems = products.filter((p) => p.available).length;

  // Orders per day for the last 7 days
  const days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en", { weekday: "short" });
    days.push({ label, value: orders.filter((o) => o.created_at?.slice(0, 10) === iso).length });
  }
  const hasOrderHistory = days.some((d) => d.value > 0);
  const peakDay = days.reduce((b, d, i, a) => (d.value > a[b].value ? i : b), 0);

  // Customer feedback pulse
  const rated = feedback.filter((f) => f.rating >= 1);
  const avgRating = rated.length ? rated.reduce((s, f) => s + f.rating, 0) / rated.length : 0;
  const positive = feedback.filter((f) => f.sentiment === "positive").length;
  const positivePct = feedback.length ? Math.round((positive / feedback.length) * 100) : 0;
  const newNegative = feedback.filter((f) => f.status === "new" && f.sentiment === "negative").length;

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  const quick = [
    { id: "menu", icon: "🍛", label: "Manage Menu" },
    { id: "orders", icon: "🧾", label: "View Orders" },
    { id: "feedback", icon: "💬", label: "Feedback" },
    { id: "location", icon: "📍", label: "Location" },
    { id: "part2", icon: "📊", label: "Forecast" },
    { id: "part3", icon: "⚔️", label: "Competitors" },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-gold/[0.08] to-transparent p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-gold/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">Admin Portal</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Here&apos;s how Safar-e-Zaiqa is doing today.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Logged Revenue" value={loading ? "…" : rs(revenue)} sub={`${active.length} orders`} accent />
        <Stat label="Pending Orders" value={loading ? "…" : String(pending)} sub="new + preparing" />
        <Stat label="Menu Items Live" value={loading ? "…" : String(liveItems)} sub={`${products.length} total`} />
        <Stat label="Completed" value={loading ? "…" : String(orders.filter((o) => o.status === "completed").length)} sub="all-time" />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Orders chart */}
        <Card className="p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold text-text">Orders — last 7 days</h3>
          <p className="mt-1 text-sm text-text-muted">Daily order volume placed from the customer site.</p>
          <div className="mt-6">
            {hasOrderHistory ? (
              <LineChart data={days} format={(n) => String(n)} highlightIndex={peakDay} />
            ) : (
              <div className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-text-dim">
                No orders yet — they&apos;ll chart here as they come in.
              </div>
            )}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-text">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {quick.map((q) => (
              <button
                key={q.id}
                onClick={() => onNavigate(q.id)}
                className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface/60 p-3.5 text-left transition hover:-translate-y-0.5 hover:border-gold/40"
              >
                <span className="text-xl">{q.icon}</span>
                <span className="text-sm font-medium text-text">{q.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text">Recent orders</h3>
          <button onClick={() => onNavigate("orders")} className="text-xs text-gold-soft hover:underline">
            View all →
          </button>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-text-muted">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">No orders yet.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-lg border border-border-soft bg-surface/50 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-text">#{o.id}</span>
                  <span className="text-sm text-text-muted">{o.customer_name || "Guest"}</span>
                  <Pill tone={o.status === "new" ? "gold" : o.status === "completed" ? "green" : o.status === "cancelled" ? "red" : "blue"}>
                    {o.status}
                  </Pill>
                </div>
                <span className="text-sm font-semibold text-gold-soft">{rs(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Customer pulse */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text">Customer pulse</h3>
            <p className="mt-1 text-sm text-text-muted">Read live from reviews by Zaiqa Sense.</p>
          </div>
          <button onClick={() => onNavigate("feedback")} className="text-xs text-gold-soft hover:underline">
            Open feedback →
          </button>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-text-muted">Loading…</p>
        ) : feedback.length === 0 ? (
          <p className="mt-4 text-sm text-text-muted">No reviews yet — they&apos;ll show up here as customers rate you.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Pulse label="Avg rating" value={avgRating ? `${avgRating.toFixed(1)} ★` : "—"} accent />
            <Pulse label="Positive" value={`${positivePct}%`} />
            <Pulse label="Total reviews" value={String(feedback.length)} />
            <Pulse
              label="Needs reply"
              value={String(newNegative)}
              tone={newNegative > 0 ? "red" : undefined}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function Pulse({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "red";
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface/50 p-3.5">
      <p className="text-xs text-text-dim">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          tone === "red" ? "text-red" : accent ? "text-gradient-gold" : "text-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
