"use client";

import { useEffect, useId, useRef, useState } from "react";

type Point = { label: string; value: number; note?: string };

/* ── helpers ──────────────────────────────────────────────── */

// Short axis labels: 1.2K, 30K, 1.1M, plain ints otherwise.
function compact(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (a >= 1_000) return `${trim(n / 1_000)}K`;
  return String(Math.round(n));
}
const trim = (n: number) => n.toFixed(1).replace(/\.0$/, "");

// "Nice" rounded number for axis steps (Heckbert's algorithm).
function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range || 1));
  const f = (range || 1) / Math.pow(10, exp);
  let nf: number;
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

// Even, human-friendly tick values from 0 → max.
function ticksFor(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const step = niceNum(niceNum(max, false) / count, true);
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) out.push(v);
  return out;
}

// Catmull-Rom → cubic Bézier for a smooth, non-jagged curve.
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x} ${pts[0].y}` : "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// Track the container's pixel width so the SVG renders crisp & undistorted.
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ── chart ────────────────────────────────────────────────── */

/**
 * Interactive area + line chart — dependency-free, responsive.
 * Values are always readable from the y-axis gridlines and per-point
 * labels; hovering reveals an exact tooltip and crosshair.
 */
export function LineChart({
  data,
  format = (n) => n.toLocaleString(),
  highlightIndex,
  height = 240,
}: {
  data: Point[];
  format?: (n: number) => string;
  highlightIndex?: number;
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const [box, W] = useWidth();
  const [hover, setHover] = useState<number | null>(null);

  const H = height;
  const padL = 46;
  const padR = 16;
  const padT = 22;
  const padB = 28;
  const plotW = Math.max(1, W - padL - padR);
  const plotH = Math.max(1, H - padT - padB);

  const dataMax = Math.max(...data.map((d) => d.value), 0);
  const ticks = ticksFor(dataMax);
  const yMax = ticks[ticks.length - 1] || 1;

  const n = data.length;
  const x = (i: number) => (n <= 1 ? padL + plotW / 2 : padL + (i * plotW) / (n - 1));
  const y = (v: number) => padT + plotH * (1 - v / yMax);

  const pts = data.map((d, i) => ({ x: x(i), y: y(d.value) }));
  const line = smoothPath(pts);
  const baseline = padT + plotH;
  const area = pts.length
    ? `${line} L ${pts[pts.length - 1].x} ${baseline} L ${pts[0].x} ${baseline} Z`
    : "";

  const active = hover != null ? data[hover] : null;
  const ax = hover != null ? pts[hover].x : 0;
  const ay = hover != null ? pts[hover].y : 0;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (n === 0) return;
    const ox = e.nativeEvent.offsetX;
    const i = n <= 1 ? 0 : Math.round((ox - padL) / (plotW / (n - 1)));
    setHover(Math.min(n - 1, Math.max(0, i)));
  };

  return (
    <div ref={box} className="relative w-full select-none" style={{ height: H }}>
      <svg
        width={W}
        height={H}
        className="overflow-visible"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(212,175,55,0.32)" />
            <stop offset="100%" stopColor="rgba(212,175,55,0)" />
          </linearGradient>
          <linearGradient id={`line-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold-soft)" />
            <stop offset="100%" stopColor="var(--gold-deep)" />
          </linearGradient>
        </defs>

        {/* gridlines + y-axis labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padL}
              y1={y(t)}
              x2={W - padR}
              y2={y(t)}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray={t === 0 ? "0" : "3 4"}
              opacity={t === 0 ? 0.9 : 0.45}
            />
            <text
              x={padL - 10}
              y={y(t) + 3.5}
              textAnchor="end"
              className="fill-[var(--text-dim)]"
              style={{ fontSize: 10 }}
            >
              {compact(t)}
            </text>
          </g>
        ))}

        {/* area + line */}
        {area && <path d={area} fill={`url(#area-${uid})`} />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke={`url(#line-${uid})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* hover crosshair */}
        {active && (
          <line
            x1={ax}
            y1={padT}
            x2={ax}
            y2={baseline}
            stroke="var(--gold)"
            strokeWidth={1}
            strokeDasharray="3 4"
            opacity={0.5}
          />
        )}

        {/* points + x labels + always-on value labels */}
        {data.map((d, i) => {
          const hi = i === highlightIndex;
          const on = i === hover;
          const labelY = Math.max(pts[i].y - 11, padT + 9);
          return (
            <g key={d.label}>
              {!active && (
                <text
                  x={pts[i].x}
                  y={labelY}
                  textAnchor="middle"
                  className={hi ? "fill-[var(--gold-soft)]" : "fill-[var(--text-dim)]"}
                  style={{ fontSize: 10, fontWeight: hi ? 700 : 500 }}
                >
                  {compact(d.value)}
                </text>
              )}
              <circle
                cx={pts[i].x}
                cy={pts[i].y}
                r={on ? 5.5 : hi ? 4.5 : 3.5}
                fill="var(--surface)"
                stroke="var(--gold-soft)"
                strokeWidth={2}
                style={
                  hi || on
                    ? { filter: "drop-shadow(0 0 6px rgba(212,175,55,0.55))" }
                    : undefined
                }
              />
              <text
                x={pts[i].x}
                y={baseline + 17}
                textAnchor="middle"
                className={on || hi ? "fill-[var(--text-muted)]" : "fill-[var(--text-dim)]"}
                style={{ fontSize: 11, fontWeight: on || hi ? 600 : 400 }}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* exact-value tooltip */}
      {active && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-gold/30 bg-bg/95 px-3 py-1.5 text-center shadow-lg backdrop-blur-sm"
          style={{
            left: Math.min(Math.max(ax, 60), W - 60),
            top: Math.max(ay - 14, 8),
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-[10px] font-medium uppercase tracking-wide text-text-dim">
            {active.label}
          </div>
          <div className="text-sm font-bold text-gold-soft">{format(active.value)}</div>
          {active.note && <div className="text-[10px] text-text-muted">{active.note}</div>}
        </div>
      )}
    </div>
  );
}
