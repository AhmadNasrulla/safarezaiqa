/**
 * Shared presentational primitives for the dashboard.
 * Pure, prop-driven components — no client-only APIs.
 */
import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface/80 backdrop-blur-sm ${
        hover ? "card-hover" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  part,
  marks,
  title,
  subtitle,
}: {
  part: string;
  marks?: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-wide text-gold-soft uppercase">
          {part}
        </span>
        {marks ? (
          <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text-muted">
            {marks} Marks
          </span>
        ) : null}
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-text sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-muted sm:text-base">
        {subtitle}
      </p>
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "gold" | "red" | "green" | "blue";
}) {
  const tones: Record<string, string> = {
    neutral: "border-border bg-surface-2 text-text-muted",
    gold: "border-gold/40 bg-gold/10 text-gold-soft",
    red: "border-red/40 bg-red/10 text-red",
    green: "border-green/40 bg-green/10 text-green",
    blue: "border-blue/40 bg-blue/10 text-blue",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-5" hover>
      <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-bold tracking-tight ${
          accent ? "text-gradient-gold" : "text-text"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-text-muted">{sub}</p> : null}
    </Card>
  );
}

/** Vertical bar chart rendered with pure CSS — no chart dependency. */
export function BarChart({
  data,
  max,
  format = (n) => n.toLocaleString(),
  highlightIndex,
}: {
  data: { label: string; value: number; note?: string }[];
  max?: number;
  format?: (n: number) => string;
  highlightIndex?: number;
}) {
  const ceiling = max ?? Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 200 }}>
      {data.map((d, i) => {
        const pct = ceiling ? Math.max(4, Math.round((d.value / ceiling) * 100)) : 0;
        const isHi = i === highlightIndex;
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-medium text-text-muted opacity-0 transition group-hover:opacity-100">
              {format(d.value)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${pct}%`,
                  background: isHi
                    ? "linear-gradient(180deg, #e8cf85, #a9851f)"
                    : "linear-gradient(180deg, rgba(212,175,55,0.55), rgba(212,175,55,0.12))",
                  boxShadow: isHi ? "0 0 18px rgba(212,175,55,0.35)" : "none",
                }}
                title={`${d.label}: ${format(d.value)}`}
              />
            </div>
            <span className="text-[11px] font-medium text-text-dim">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Horizontal 1–5 score bar for the competitor benchmark matrix. */
export function ScoreBar({ score, max = 5 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  const color =
    score >= 4.5 ? "#3ec77a" : score >= 3.5 ? "#d4af37" : score >= 2.5 ? "#f0a830" : "#e23b3b";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-text-muted">{score}</span>
    </div>
  );
}
