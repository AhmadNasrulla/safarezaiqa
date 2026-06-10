import {
  DAILY_FORECAST,
  WEEKLY_FORECAST,
  MONTHLY_FORECAST,
  FORECAST_ASSUMPTIONS,
  REVENUE_PROJECTION,
  AOV,
} from "@/app/lib/content";
import { Card, SectionHeader, Stat, BarChart } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

const pkr = (n: number) => `PKR ${n.toLocaleString()}`;

export function SalesForecasting() {
  const peakIndex = DAILY_FORECAST.reduce(
    (best, d, i, arr) => (d.orders > arr[best].orders ? i : best),
    0,
  );

  return (
    <div className="space-y-10">
      <SectionHeader
        part="Part 2"
        marks={20}
        title="Predictive Sales Forecasting"
        subtitle="Daily, weekly and monthly demand forecasts built on validated assumptions — translated into PKR revenue projections and a six-month growth trajectory for a single truck."
      />

      {/* Projection KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Avg. Daily Revenue" value={pkr(REVENUE_PROJECTION.dailyAvg)} sub="~75 plates/day" accent />
        <Stat label="Avg. Weekly Revenue" value={pkr(REVENUE_PROJECTION.weeklyAvg)} sub="6 operating days" />
        <Stat label="Steady Monthly Revenue" value={pkr(REVENUE_PROJECTION.monthlySteady)} sub="Month 3" />
        <Stat label="6-Month Revenue" value={`PKR ${(REVENUE_PROJECTION.sixMonthTotal / 1_000_000).toFixed(2)}M`} sub="Cumulative" />
      </div>

      {/* Daily forecast */}
      <Card className="p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-text">Daily Forecast — Orders by Weekday</h3>
            <p className="mt-1 text-sm text-text-muted">
              Demand concentrates on Friday–Sunday (Jumma, payday &amp; family orders). Closed Mondays. AOV {pkr(AOV)}.
            </p>
          </div>
          <span className="text-xs text-text-dim">Hover bars for order counts</span>
        </div>
        <div className="mt-6">
          <BarChart
            data={DAILY_FORECAST.map((d) => ({ label: d.day, value: d.orders, note: d.note }))}
            highlightIndex={peakIndex}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-7">
          {DAILY_FORECAST.map((d) => (
            <div key={d.day} className="rounded-lg border border-border-soft bg-surface-2/50 p-2.5">
              <p className="font-semibold text-text">{d.day}</p>
              <p className="text-gold-soft">{d.orders} orders</p>
              <p className="mt-0.5 text-[10px] text-text-dim">{d.note}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly + Monthly */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text">Weekly Forecast (Month 1)</h3>
          <p className="mt-1 text-sm text-text-muted">Steady week-on-week climb as word of mouth builds.</p>
          <div className="mt-5 space-y-3">
            {WEEKLY_FORECAST.map((w) => {
              const max = Math.max(...WEEKLY_FORECAST.map((x) => x.revenue));
              return (
                <div key={w.week}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{w.week}</span>
                    <span className="font-semibold text-text">{pkr(w.revenue)}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold-deep"
                      style={{ width: `${(w.revenue / max) * 100}%` }}
                    />
                  </div>
                  <p className="mt-0.5 text-[11px] text-text-dim">{w.orders} orders</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text">6-Month Revenue Trajectory</h3>
          <p className="mt-1 text-sm text-text-muted">Launch → steady state → expansion-ready.</p>
          <div className="mt-6">
            <BarChart
              data={MONTHLY_FORECAST.map((m) => ({ label: m.month.replace("Month ", "M"), value: m.revenue }))}
              format={(n) => `PKR ${(n / 1000).toFixed(0)}K`}
            />
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            {MONTHLY_FORECAST.map((m) => (
              <div key={m.month} className="flex items-center justify-between">
                <span className="text-text-dim">
                  {m.month} · <span className="text-text-muted">{m.label}</span>
                </span>
                <span className="font-medium text-gold-soft">{pkr(m.revenue)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Assumptions + revenue logic */}
      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="p-6 lg:col-span-3">
          <h3 className="text-lg font-semibold text-text">Forecast Assumptions</h3>
          <ul className="mt-4 space-y-2.5">
            {FORECAST_ASSUMPTIONS.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm text-text-muted">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[11px] font-bold text-gold-soft">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{a}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-gradient-to-br from-gold/[0.06] to-transparent p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-text">Revenue Logic</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <Line label="Avg. order value" value={pkr(AOV)} />
            <Line label="× Plates / day" value="~75" />
            <Line label="= Daily revenue" value={pkr(REVENUE_PROJECTION.dailyAvg)} bold />
            <Line label="× 6 days / week" value={pkr(REVENUE_PROJECTION.weeklyAvg)} />
            <Line label="≈ Monthly (steady)" value={pkr(REVENUE_PROJECTION.monthlySteady)} bold />
            <div className="border-t border-border pt-3">
              <Line label="Gross margin" value={`${REVENUE_PROJECTION.grossMarginPct}%`} />
              <Line label="Est. monthly profit" value={pkr(REVENUE_PROJECTION.estMonthlyProfit)} accent />
            </div>
          </dl>
        </Card>
      </div>

      <AIGenerator
        part="sales-forecasting"
        title="Stress-test the forecast with AI"
        cta="Generate Scenarios"
        placeholder="Optional: e.g. 'model a rainy-season slowdown'…"
      />
    </div>
  );
}

function Line({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-text-muted">{label}</dt>
      <dd
        className={`font-semibold ${
          accent ? "text-gradient-gold text-base" : bold ? "text-text" : "text-text-muted"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
