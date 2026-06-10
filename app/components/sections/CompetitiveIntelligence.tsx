"use client";

import { useEffect, useState } from "react";
import { Card, SectionHeader, Pill } from "@/app/components/ui";
import { Markdown } from "@/app/components/Markdown";

const STORAGE_KEY = "sez_competitors_v1";

type Competitor = {
  id: string;
  name: string;
  type: "Direct" | "Indirect";
  price: string;
  rating: string;
  notes: string;
  swot?: string;
  insights?: string;
};

const SEED: Competitor[] = [
  { id: "c1", name: "Biryani Master", type: "Direct", price: "Rs. 450–600", rating: "3.6", notes: "Established name, larger menu, seen as pricey for students." },
  { id: "c2", name: "Master Biryani", type: "Direct", price: "Rs. 420–580", rating: "3.4", notes: "Familiar brand, central location, inconsistent hygiene." },
  { id: "c3", name: "University Cafeteria", type: "Indirect", price: "Rs. 150–300", rating: "2.9", notes: "On-campus convenience, low quality." },
];

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

export function CompetitiveIntelligence() {
  const [list, setList] = useState<Competitor[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({ name: "", type: "Direct", price: "", rating: "", notes: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setList(raw ? JSON.parse(raw) : SEED);
    } catch {
      setList(SEED);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, [list, loaded]);

  function add() {
    if (!form.name.trim()) return;
    setList((l) => [
      { id: uid(), name: form.name.trim(), type: form.type as "Direct" | "Indirect", price: form.price.trim(), rating: form.rating.trim(), notes: form.notes.trim() },
      ...l,
    ]);
    setForm({ name: "", type: "Direct", price: "", rating: "", notes: "" });
  }

  function remove(id: string) {
    setList((l) => l.filter((c) => c.id !== id));
  }

  async function run(c: Competitor, kind: "swot" | "insights") {
    const key = `${c.id}:${kind}`;
    setBusy((b) => ({ ...b, [key]: true }));
    const input = `${c.name} — ${c.type} competitor of Safar-e-Zaiqa. Price range: ${c.price || "n/a"}. Customer rating: ${c.rating || "n/a"}/5. Notes: ${c.notes || "none"}.`;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: kind === "swot" ? "competitor-swot" : "competitor-insights", input }),
      });
      const data = await res.json();
      const text = res.ok ? data.text : `⚠️ ${data?.error ?? "Failed to generate."}`;
      setList((l) => l.map((x) => (x.id === c.id ? { ...x, [kind]: text } : x)));
    } catch {
      setList((l) => l.map((x) => (x.id === c.id ? { ...x, [kind]: "⚠️ Network error." } : x)));
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  }

  const input = "w-full rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50";

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Part 3"
        marks={20}
        title="AI Competitive Intelligence"
        subtitle="Add any competitor, then generate an AI SWOT and a strategic playbook for each — one click. Everything you add is saved on this device."
      />

      {/* Add competitor */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text">Add a competitor</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input placeholder="Competitor name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`${input} lg:col-span-2`} />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input}>
            <option value="Direct">Direct</option>
            <option value="Indirect">Indirect</option>
          </select>
          <input placeholder="Price range" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} />
          <input placeholder="Rating /5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={input} />
        </div>
        <textarea placeholder="Notes (positioning, strengths, weaknesses you've observed)…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={`${input} mt-3 resize-none`} />
        <button onClick={add} className="mt-3 rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-4 py-2 text-sm font-semibold text-[#1a1505] transition hover:brightness-110">
          + Add competitor
        </button>
      </Card>

      {/* Competitor cards */}
      {list.length === 0 ? (
        <Card className="p-10 text-center text-text-muted">No competitors yet — add one above.</Card>
      ) : (
        <div className="space-y-5">
          {list.map((c) => (
            <Card key={c.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text">{c.name}</h3>
                    <Pill tone={c.type === "Direct" ? "red" : "blue"}>{c.type}</Pill>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-text-muted">
                    {c.price && <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5">💰 {c.price}</span>}
                    {c.rating && <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5">⭐ {c.rating}/5</span>}
                  </div>
                  {c.notes && <p className="mt-2 max-w-2xl text-sm text-text-muted">{c.notes}</p>}
                </div>
                <button onClick={() => remove(c.id)} className="rounded-lg border border-red/30 px-2.5 py-1.5 text-xs text-red hover:bg-red/10">
                  Delete
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <AiButton label="Generate SWOT" busy={!!busy[`${c.id}:swot`]} onClick={() => run(c, "swot")} />
                <AiButton label="AI Insights" busy={!!busy[`${c.id}:insights`]} onClick={() => run(c, "insights")} />
              </div>

              {(busy[`${c.id}:swot`] || c.swot) && (
                <Panel title="SWOT Analysis" busy={!!busy[`${c.id}:swot`]} text={c.swot} />
              )}
              {(busy[`${c.id}:insights`] || c.insights) && (
                <Panel title="Strategic Playbook" busy={!!busy[`${c.id}:insights`]} text={c.insights} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function AiButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-3.5 py-2 text-sm font-semibold text-gold-soft transition hover:bg-gold/20 disabled:opacity-60"
    >
      {busy ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        "✦"
      )}
      {label}
    </button>
  );
}

function Panel({ title, busy, text }: { title: string; busy: boolean; text?: string }) {
  return (
    <div className="animate-fade-up mt-4 rounded-xl border border-border bg-bg/50 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-soft">{title}</p>
      {busy && !text ? (
        <div className="space-y-2">
          {[88, 70, 80, 60].map((w, i) => (
            <div key={i} className="shimmer h-3 rounded bg-surface-2" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        text && <Markdown text={text} />
      )}
    </div>
  );
}
