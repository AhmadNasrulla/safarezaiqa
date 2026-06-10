"use client";

import { useEffect, useState } from "react";
import { Card, SectionHeader, Pill } from "@/app/components/ui";

type Order = {
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

const STATUSES = ["new", "preparing", "ready", "completed", "cancelled"];
const rs = (n: number) => `Rs. ${n.toLocaleString()}`;

const statusTone = (s: string) =>
  s === "new" ? "gold" : s === "completed" ? "green" : s === "cancelled" ? "red" : "blue";

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: number, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Operations"
        title="Orders"
        subtitle="Live orders placed from the customer site (and sent on to WhatsApp). Update each order's status as you prepare it."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Mini label="Total orders" value={String(orders.length)} />
        <Mini label="New / preparing" value={String(orders.filter((o) => o.status === "new" || o.status === "preparing").length)} />
        <Mini label="Completed" value={String(orders.filter((o) => o.status === "completed").length)} />
        <Mini label="Revenue (logged)" value={rs(revenue)} accent />
      </div>

      <div className="flex justify-end">
        <button
          onClick={load}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:text-text"
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-text-muted">No orders yet. They&apos;ll appear here in real time.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            let items: { name: string; qty: number; price: number }[] = [];
            try {
              items = JSON.parse(o.items_json);
            } catch {
              items = [];
            }
            return (
              <Card key={o.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text">#{o.id}</span>
                      <Pill tone={statusTone(o.status)}>{o.status}</Pill>
                      <span className="text-xs text-text-dim">{o.created_at}</span>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {o.customer_name || "Guest"}
                      {o.phone ? ` · ${o.phone}` : ""}
                    </p>
                    {o.address && <p className="text-xs text-text-dim">📍 {o.address}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gold-soft">{rs(o.total)}</p>
                  </div>
                </div>

                <ul className="mt-3 space-y-1 border-t border-border-soft pt-3 text-sm text-text-muted">
                  {items.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>
                        {it.qty}× {it.name}
                      </span>
                      <span className="text-text-dim">{rs(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
                {o.note && <p className="mt-2 text-xs italic text-text-dim">Note: {o.note}</p>}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(o.id, s)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        o.status === s
                          ? "bg-gold/20 text-gold-soft"
                          : "border border-border text-text-muted hover:text-text"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-text-dim">{label}</p>
      <p className={`mt-1 text-xl font-bold ${accent ? "text-gradient-gold" : "text-text"}`}>{value}</p>
    </Card>
  );
}
