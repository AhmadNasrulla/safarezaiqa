"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionHeader, Pill, Stat } from "@/app/components/ui";
import type { Feedback } from "@/app/lib/types";
import {
  aggregateFeedback,
  scoreColor,
  MODEL_NAME,
  QUALITY_LABELS,
  QUALITY_ICONS,
  type FeedbackAnalysis,
} from "@/app/lib/feedback-analyzer";

const STATUSES = ["new", "reviewed", "resolved", "archived"] as const;
type StatusFilter = "all" | (typeof STATUSES)[number];
type SentimentFilter = "all" | "positive" | "neutral" | "negative";

type Analyzed = Feedback & { analysis: FeedbackAnalysis | null };

function parse(f: Feedback): Analyzed {
  let analysis: FeedbackAnalysis | null = null;
  try {
    analysis = JSON.parse(f.analysis_json) as FeedbackAnalysis;
  } catch {
    analysis = null;
  }
  return { ...f, analysis };
}

const sentimentTone = (s: string) =>
  s === "positive" ? "green" : s === "negative" ? "red" : "blue";

const statusTone = (s: string) =>
  s === "resolved" ? "green" : s === "reviewed" ? "blue" : s === "archived" ? "neutral" : "gold";

export function FeedbackPanel() {
  const [rows, setRows] = useState<Analyzed[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sentiment, setSentiment] = useState<SentimentFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setRows((data.feedback ?? []).map(parse));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function setReviewStatus(id: number, next: string) {
    await fetch(`/api/feedback/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Delete this feedback permanently?")) return;
    await fetch(`/api/feedback/${id}`, { method: "DELETE" });
    load();
  }

  // Aggregate the full corpus (the true "voice of customer").
  const agg = useMemo(
    () =>
      aggregateFeedback(
        rows.map((r) => ({
          rating: r.rating || undefined,
          sentiment: r.sentiment,
          analysis: r.analysis
            ? { qualities: r.analysis.qualities, issues: r.analysis.issues }
            : null,
        })),
      ),
    [rows],
  );

  const needsAttention = rows.filter((r) => r.status === "new" && r.sentiment === "negative").length;

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (sentiment !== "all" && r.sentiment !== sentiment) return false;
        if (status !== "all" && r.status !== status) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!`${r.customer_name} ${r.message}`.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [rows, sentiment, status, search],
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Operations"
        title="Customer Feedback"
        subtitle="Every review is read the moment it lands by Zaiqa Sense — an on-device model that scores sentiment and the 4 quality pillars, flags what went wrong, and queues issues for action. No data leaves the server."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total reviews" value={loading ? "…" : String(agg.count)} sub={`${agg.ratedCount} rated`} />
        <Stat
          label="Average rating"
          value={loading ? "…" : agg.avgRating ? `${agg.avgRating.toFixed(1)} ★` : "—"}
          sub="out of 5"
          accent
        />
        <Stat label="Positive" value={loading ? "…" : `${agg.positivePct}%`} sub={`${agg.sentiment.positive} reviews`} />
        <Stat
          label="Needs attention"
          value={loading ? "…" : String(needsAttention)}
          sub="new + negative"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Quality Index — the bar of 4 qualities */}
        <Card className="p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">Quality Index</h3>
              <p className="mt-1 text-sm text-text-muted">
                Average score per pillar, inferred from review text (0–100).
              </p>
            </div>
            <ModelBadge />
          </div>
          <div className="mt-6 space-y-4">
            {agg.qualities.map((q) => (
              <QualityBar key={q.key} icon={q.icon} label={q.label} score={q.avg} count={q.count} mentioned={q.count > 0} />
            ))}
          </div>
          <p className="mt-5 border-t border-border-soft pt-3 text-[11px] text-text-dim">
            Scores reflect only the reviews that actually mentioned each pillar — the count beside
            each bar shows how many.
          </p>
        </Card>

        {/* Sentiment + what needs attention */}
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text">Sentiment</h3>
            <div className="mt-4">
              <SentimentMeter sentiment={agg.sentiment} total={agg.count} />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text">What needs attention</h3>
            {agg.topIssues.length === 0 ? (
              <p className="mt-3 text-sm text-text-muted">No recurring issues detected. 🎉</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {agg.topIssues.map((it) => (
                  <li key={it.text} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-text-muted">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                      {it.text}
                    </span>
                    <span className="shrink-0 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-text-dim">
                      ×{it.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or comment…"
            className="min-w-[180px] flex-1 rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50"
          />
          <Select label="Sentiment" value={sentiment} onChange={(v) => setSentiment(v as SentimentFilter)} options={["all", "positive", "neutral", "negative"]} />
          <Select label="Status" value={status} onChange={(v) => setStatus(v as StatusFilter)} options={["all", ...STATUSES]} />
          <button
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:text-text disabled:opacity-50"
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={load}
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:text-text"
          >
            ↻ Refresh
          </button>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <p className="text-sm text-text-muted">Loading feedback…</p>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-text-muted">No feedback yet. Reviews left on the customer site appear here.</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-text-muted">No reviews match these filters.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-text-dim">
            Showing {filtered.length} of {rows.length} review{rows.length === 1 ? "" : "s"}
          </p>
          {filtered.map((f) => (
            <FeedbackCard key={f.id} f={f} onStatus={setReviewStatus} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Feedback card ----------------------------- */

function FeedbackCard({
  f,
  onStatus,
  onDelete,
}: {
  f: Analyzed;
  onStatus: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}) {
  const a = f.analysis;
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text">{f.customer_name || "Guest"}</span>
            <Stars value={f.rating} />
            <Pill tone={sentimentTone(f.sentiment)}>{f.sentiment}</Pill>
            <Pill tone={statusTone(f.status)}>{f.status}</Pill>
          </div>
          <p className="mt-1 text-xs text-text-dim">
            {fmtDate(f.created_at)}
            {f.email ? ` · ${f.email}` : ""}
            {f.order_id ? ` · order #${f.order_id}` : ""}
          </p>
        </div>
        <button
          onClick={() => onDelete(f.id)}
          className="rounded-lg border border-border px-2 py-1 text-xs text-text-dim transition hover:border-red/40 hover:text-red"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {f.message ? (
        <p className="mt-3 rounded-lg border border-border-soft bg-bg/40 px-3.5 py-2.5 text-sm leading-relaxed text-text-muted">
          “{f.message}”
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-text-dim">No written comment.</p>
      )}

      {/* Model read */}
      <div className="mt-4 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.05] to-transparent p-4">
        <div className="flex items-center justify-between gap-2">
          <ModelBadge />
          {a && (
            <span className="text-[11px] text-text-dim">
              confidence {Math.round((a.confidence ?? 0) * 100)}%
            </span>
          )}
        </div>

        {a?.summary && <p className="mt-2 text-sm text-text">{a.summary}</p>}

        {a?.tagged && a.tagged.length > 0 && (
          <p className="mt-1.5 text-[11px] text-text-dim">
            🏷️ Customer tagged: {a.tagged.map((k) => `${QUALITY_ICONS[k]} ${QUALITY_LABELS[k]}`).join(" · ")}
          </p>
        )}

        {a && (
          <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {a.qualities.map((q) => (
              <QualityBar key={q.key} icon={q.icon} label={q.label} score={q.score} mentioned={q.mentioned} compact />
            ))}
          </div>
        )}

        {a && a.issues.length > 0 && (
          <ChipRow title="What went wrong" tone="red" items={a.issues} />
        )}
        {a && a.highlights.length > 0 && (
          <ChipRow title="What they loved" tone="green" items={a.highlights} />
        )}
      </div>

      {/* Triage workflow */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-text-dim">Mark as:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatus(f.id, s)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              f.status === s
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
}

/* ------------------------------- Primitives ------------------------------- */

function ModelBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-gold-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {MODEL_NAME}
    </span>
  );
}

function Stars({ value }: { value: number }) {
  if (!value) return <span className="text-xs text-text-dim">no rating</span>;
  return (
    <span className="text-sm leading-none" aria-label={`${value} out of 5 stars`}>
      <span className="text-gold">{"★".repeat(value)}</span>
      <span className="text-text-dim">{"★".repeat(Math.max(0, 5 - value))}</span>
    </span>
  );
}

function QualityBar({
  icon,
  label,
  score,
  count,
  mentioned = true,
  compact = false,
}: {
  icon: string;
  label: string;
  score: number;
  count?: number;
  mentioned?: boolean;
  compact?: boolean;
}) {
  const color = mentioned ? scoreColor(score) : "var(--border)";
  return (
    <div className={mentioned ? "" : "opacity-50"}>
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-text-muted">
          <span>{icon}</span>
          {label}
        </span>
        <span className="font-semibold" style={{ color: mentioned ? color : undefined }}>
          {mentioned ? score : "—"}
          {typeof count === "number" && mentioned && (
            <span className="ml-1 font-normal text-text-dim">· {count}</span>
          )}
        </span>
      </div>
      <div className={`mt-1.5 w-full overflow-hidden rounded-full bg-surface-2 ${compact ? "h-1.5" : "h-2"}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${mentioned ? score : 0}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ChipRow({ title, tone, items }: { title: string; tone: "red" | "green"; items: string[] }) {
  const cls =
    tone === "red"
      ? "border-red/30 bg-red/10 text-red"
      : "border-green/30 bg-green/10 text-green";
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-dim">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it, i) => (
          <span key={i} className={`rounded-lg border px-2 py-1 text-xs ${cls}`}>
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function SentimentMeter({
  sentiment,
  total,
}: {
  sentiment: Record<"positive" | "neutral" | "negative", number>;
  total: number;
}) {
  const segs = [
    { key: "positive", color: "var(--green)", value: sentiment.positive },
    { key: "neutral", color: "var(--blue)", value: sentiment.neutral },
    { key: "negative", color: "var(--red)", value: sentiment.negative },
  ];
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2">
        {total > 0 &&
          segs.map((s) => (
            <div
              key={s.key}
              style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
              title={`${s.key}: ${s.value}`}
            />
          ))}
      </div>
      <div className="mt-3 space-y-1.5">
        {segs.map((s) => (
          <div key={s.key} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 capitalize text-text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.key}
            </span>
            <span className="text-text-dim">
              {s.value} ({total ? Math.round((s.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs text-text-dim">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-bg/60 px-2.5 py-2 text-sm capitalize text-text outline-none focus:border-gold/50"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-bg-soft capitalize">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -------------------------------- Helpers -------------------------------- */

function fmtDate(s: string): string {
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
  return isNaN(d.getTime())
    ? s
    : d.toLocaleString("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(rows: Analyzed[]) {
  const header = [
    "id", "date", "name", "email", "rating", "sentiment",
    "taste", "service", "value", "hygiene", "status", "message",
  ];
  const lines = rows.map((r) =>
    [
      r.id, r.created_at, r.customer_name, r.email, r.rating, r.sentiment,
      r.score_taste, r.score_service, r.score_value, r.score_hygiene, r.status, r.message,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `safar-e-zaiqa-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
