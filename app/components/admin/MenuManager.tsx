"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/app/lib/types";
import { CATEGORY_ORDER } from "@/app/lib/types";
import { Card, SectionHeader } from "@/app/components/ui";

const rs = (n: number) => `Rs. ${n.toLocaleString()}`;
const blank = { category: CATEGORY_ORDER[0], name: "", description: "", price: "", image: "" };
type Draft = typeof blank;

export function MenuManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState<Draft>(blank);
  const [editId, setEditId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(blank);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setErr("Could not load products.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function addProduct() {
    setErr("");
    if (!adding.name.trim() || adding.price === "") {
      setErr("Name and price are required.");
      return;
    }
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...adding, price: Number(adding.price) }),
    });
    if (!res.ok) {
      setErr((await res.json())?.error ?? "Failed to add.");
      return;
    }
    setAdding(blank);
    load();
  }

  async function saveEdit(id: number) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editDraft, price: Number(editDraft.price) }),
    });
    if (res.ok) {
      setEditId(null);
      load();
    }
  }

  async function toggle(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: p.available ? false : true }),
    });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this item from the menu?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  }

  const grouped = CATEGORY_ORDER.map(
    (c) => [c, products.filter((p) => p.category === c)] as const,
  ).concat(
    [...new Set(products.map((p) => p.category))]
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .map((c) => [c, products.filter((p) => p.category === c)] as const),
  );

  const input =
    "rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50";

  const totalLive = products.filter((p) => p.available).length;

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Operations"
        title="Menu Manager"
        subtitle="Add, edit, delete and toggle availability for every item. Changes appear instantly on the customer ordering site."
      />

      <div className="flex flex-wrap gap-3 text-sm">
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-text-muted">
          {products.length} items
        </span>
        <span className="rounded-full border border-green/30 bg-green/10 px-3 py-1 text-green">
          {totalLive} live
        </span>
      </div>

      {/* Add product */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text">Add a new item</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={adding.category}
            onChange={(e) => setAdding({ ...adding, category: e.target.value })}
            className={input}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            placeholder="Item name"
            value={adding.name}
            onChange={(e) => setAdding({ ...adding, name: e.target.value })}
            className={`${input} lg:col-span-2`}
          />
          <input
            placeholder="Price (Rs.)"
            type="number"
            value={adding.price}
            onChange={(e) => setAdding({ ...adding, price: e.target.value })}
            className={input}
          />
          <button
            onClick={addProduct}
            className="rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-4 py-2 text-sm font-semibold text-[#1a1505] transition hover:brightness-110"
          >
            + Add Item
          </button>
        </div>
        <input
          placeholder="Description (optional)"
          value={adding.description}
          onChange={(e) => setAdding({ ...adding, description: e.target.value })}
          className={`${input} mt-3 w-full`}
        />
        <input
          placeholder="Image path (optional) — e.g. /items/biryani-chicken.png"
          value={adding.image}
          onChange={(e) => setAdding({ ...adding, image: e.target.value })}
          className={`${input} mt-3 w-full`}
        />
        {err && <p className="mt-3 text-sm text-red">⚠️ {err}</p>}
      </Card>

      {/* Product list */}
      {loading ? (
        <p className="text-sm text-text-muted">Loading menu…</p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([cat, list]) =>
            list.length === 0 ? null : (
              <div key={cat}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-soft">
                  {cat} <span className="text-text-dim">· {list.length}</span>
                </h3>
                <div className="space-y-2">
                  {list.map((p) =>
                    editId === p.id ? (
                      <Card key={p.id} className="p-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <select
                            value={editDraft.category}
                            onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                            className={input}
                          >
                            {CATEGORY_ORDER.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          <input
                            value={editDraft.name}
                            onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                            className={`${input} lg:col-span-2`}
                          />
                          <input
                            type="number"
                            value={editDraft.price}
                            onChange={(e) => setEditDraft({ ...editDraft, price: e.target.value })}
                            className={input}
                          />
                        </div>
                        <input
                          value={editDraft.description}
                          onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                          placeholder="Description"
                          className={`${input} mt-3 w-full`}
                        />
                        <input
                          value={editDraft.image}
                          onChange={(e) => setEditDraft({ ...editDraft, image: e.target.value })}
                          placeholder="Image path — e.g. /items/biryani-chicken.png"
                          className={`${input} mt-3 w-full`}
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => saveEdit(p.id)}
                            className="rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-4 py-1.5 text-sm font-semibold text-[#1a1505]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="rounded-lg border border-border px-4 py-1.5 text-sm text-text-muted hover:text-text"
                          >
                            Cancel
                          </button>
                        </div>
                      </Card>
                    ) : (
                      <div
                        key={p.id}
                        className={`flex items-center gap-4 rounded-xl border border-border-soft bg-surface/60 p-3 ${
                          p.available ? "" : "opacity-60"
                        }`}
                      >
                        <Thumb src={p.image} alt={p.name} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-text">{p.name}</p>
                            {!p.available && (
                              <span className="rounded-full border border-red/40 bg-red/10 px-2 py-0.5 text-[10px] text-red">
                                Hidden
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="truncate text-xs text-text-muted">{p.description}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-bold text-gold-soft">{rs(p.price)}</span>
                          <button
                            onClick={() => toggle(p)}
                            title={p.available ? "Hide from menu" : "Show on menu"}
                            className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-muted hover:text-text"
                          >
                            {p.available ? "👁 Hide" : "Show"}
                          </button>
                          <button
                            onClick={() => {
                              setEditId(p.id);
                              setEditDraft({
                                category: p.category,
                                name: p.name,
                                description: p.description,
                                price: String(p.price),
                                image: p.image,
                              });
                            }}
                            className="rounded-lg border border-border px-2.5 py-1.5 text-xs text-text-muted hover:text-gold-soft"
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => remove(p.id)}
                            className="rounded-lg border border-red/30 px-2.5 py-1.5 text-xs text-red hover:bg-red/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function Thumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-base text-text-dim">
        🍽️
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover"
    />
  );
}
