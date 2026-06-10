"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, SectionHeader, Stat, BarChart } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

const pkr = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;
const STORAGE_KEY = "sez_forecast_v1";

type Inputs = {
  dailyRevenue: number;
  aov: number;
  operatingDays: number;
  growth: number; // % monthly
  margin: number; // % gross
};

const DEFAULTS: Inputs = { dailyRevenue: 21000, aov: 280, operatingDays: 6, growth: 6, margin: 50 };

// Relative demand weight per weekday (Fri–Sun peak).
const WEEKDAY_WEIGHTS: Record<string, number> = {
  Mon: 0.85, Tue: 0.8, Wed: 0.9, Thu: 1.0, Fri: 1.45, Sat: 1.55, Sun: 1.2,
};
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function selectedDays(operatingDays: number): string[] {
  if (operatingDays >= 7) return WEEK;
  if (operatingDays === 6) return WEEK.slice(1); // Tue–Sun (closed Mon)
  if (operatingDays === 5) return WEEK.slice(0, 5); // Mon–Fri
  return WEEK.slice(0, Math.max(1, operatingDays));
}

export function SalesForecasting() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setInp({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(inp));
  }, [inp, loaded]);

  const f = useMemo(() => {
    const days = selectedDays(inp.operatingDays);
    const weekly = inp.dailyRevenue * inp.operatingDays;
    const monthly = weekly * 4.333;
    const platesDay = inp.aov > 0 ? inp.dailyRevenue / inp.aov : 0;

    const totalWeight = days.reduce((s, d) => s + (WEEKDAY_WEIGHTS[d] ?? 1), 0);
    const daily = days.map((d) => ({
      label: d,
      value: (weekly * (WEEKDAY_WEIGHTS[d] ?? 1)) / totalWeight,
    }));

    const g = inp.growth / 100;
    const months = Array.from({ length: 6 }, (_, i) => ({
      label: `M${i + 1}`,
      value: monthly * Math.pow(1 + g, i),
    }));
    const sixMonthTotal = months.reduce((s, m) => s + m.value, 0);
    const monthlyProfit = monthly * (inp.margin / 100);

    return { daily, months, weekly, monthly, platesDay, sixMonthTotal, monthlyProfit };
  }, [inp]);

  const peak = f.daily.reduce((b, d, i, a) => (d.value > a[b].value ? i : b), 0);
  const set = (k: keyof Inputs, v: number) => setInp((s) => ({ ...s, [k]: Number.isFinite(v) ? v : 0 }));

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Part 2"
        marks={20}
        title="Predictive Sales Forecasting"
        subtitle="Enter your average daily revenue and the model instantly projects weekday demand, weekly and monthly revenue, a 6-month growth curve and profit — with live charts. Inputs are saved on this device."
      />

      {/* Inputs */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text">Forecast inputs</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Avg. daily revenue (PKR)" value={inp.dailyRevenue} step={500} onChange={(v) => set("dailyRevenue", v)} highlight />
          <Field label="Avg. order value (PKR)" value={inp.aov} step={10} onChange={(v) => set("aov", v)} />
          <Field label="Operating days / week" value={inp.operatingDays} step={1} min={1} max={7} onChange={(v) => set("operatingDays", Math.min(7, Math.max(1, v)))} />
          <Field label="Monthly growth (%)" value={inp.growth} step={1} onChange={(v) => set("growth", v)} />
          <Field label="Gross margin (%)" value={inp.margin} step={1} min={0} max={100} onChange={(v) => set("margin", v)} />
        </div>
        <button
          onClick={() => setInp(DEFAULTS)}
          className="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs text-text-muted transition hover:text-text"
        >
          ↺ Reset to baseline
        </button>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Weekly revenue" value={pkr(f.weekly)} sub={`${inp.operatingDays} operating days`} accent />
        <Stat label="Monthly (steady)" value={pkr(f.monthly)} sub="≈ 4.33 weeks" />
        <Stat label="Plates / day" value={`~${Math.round(f.platesDay)}`} sub={`@ ${pkr(inp.aov)} AOV`} />
        <Stat label="Est. monthly profit" value={pkr(f.monthlyProfit)} sub={`${inp.margin}% margin`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Daily distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text">Revenue by weekday</h3>
          <p className="mt-1 text-sm text-text-muted">Modelled from your weekly total — peaks on Fri–Sun.</p>
          <div className="mt-6">
            <BarChart data={f.daily} highlightIndex={peak} format={(n) => pkr(n)} />
          </div>
        </Card>

        {/* 6-month trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text">6-month revenue trajectory</h3>
          <p className="mt-1 text-sm text-text-muted">Compounding at {inp.growth}% per month.</p>
          <div className="mt-6">
            <LineChart points={f.months} format={(n) => `PKR ${(n / 1000).toFixed(0)}K`} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-gold/20 bg-gold/[0.05] px-4 py-2.5 text-sm">
            <span className="text-text-muted">6-month cumulative revenue</span>
            <span className="font-bold text-gradient-gold">{pkr(f.sixMonthTotal)}</span>
          </div>
        </Card>
      </div>

      <AIGenerator
        part="sales-forecasting"
        title="Ask AI to stress-test this forecast"
        cta="Generate Scenarios"
        placeholder="Optional: e.g. 'model a rainy-week slowdown' or 'exam break impact'…"
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  highlight,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  highlight?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-dim">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-full rounded-lg border bg-bg/60 px-3 py-2.5 text-sm text-text outline-none focus:border-gold/50 ${
          highlight ? "border-gold/40" : "border-border"
        }`}
      />
    </label>
  );
}

/* SVG area/line chart — dependency-free */
function LineChart({
  points,
  format = (n) => String(n),
}: {
  points: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const W = 600;
  const H = 220;
  const padX = 36;
  const padY = 28;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const span = max - min || 1;
  const stepX = (W - padX * 2) / Math.max(1, points.length - 1);
  const x = (i: number) => padX + i * stepX;
  const y = (v: number) => padY + (H - padY * 2) * (1 - (v - min) / span);

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ");
  const area = `${line} L ${x(points.length - 1)} ${H - padY} L ${x(0)} ${H - padY} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 220 }}>
      <defs>
        <linearGradient id="areaGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,175,55,0.35)" />
          <stop offset="100%" stopColor="rgba(212,175,55,0)" />
        </linearGradient>
        <linearGradient id="lineGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8cf85" />
          <stop offset="100%" stopColor="#a9851f" />
        </linearGradient>
      </defs>
      {/* baseline */}
      <line x1={padX} y1={H - padY} x2={W - padX} y2={H - padY} stroke="var(--border)" strokeWidth="1" />
      <path d={area} fill="url(#areaGold)" />
      <path d={line} fill="none" stroke="url(#lineGold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.value)} r="4" fill="#16161f" stroke="#e8cf85" strokeWidth="2" />
          <text x={x(i)} y={y(p.value) - 10} textAnchor="middle" className="fill-[var(--text-muted)]" style={{ fontSize: 11, fontWeight: 600 }}>
            {format(p.value)}
          </text>
          <text x={x(i)} y={H - padY + 16} textAnchor="middle" className="fill-[var(--text-dim)]" style={{ fontSize: 11 }}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
