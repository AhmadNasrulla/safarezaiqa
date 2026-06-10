import { BRAND, PERSONAS, REVENUE_PROJECTION, COMPETITORS } from "@/app/lib/content";
import { Card, Stat } from "@/app/components/ui";

const PARTS = [
  { n: "01", title: "AI Customer Intelligence", desc: "Three data-driven personas, pain points, triggers, channels & A1 comparison." },
  { n: "02", title: "Predictive Sales Forecasting", desc: "Daily, weekly & monthly forecasts with assumptions and PKR revenue projections." },
  { n: "03", title: "Competitive Intelligence", desc: "5 direct + 3 indirect rivals, benchmark matrix and full SWOT analysis." },
  { n: "04", title: "Marketing Automation", desc: "AI customer journey, WhatsApp chatbot flow and a tiered loyalty program." },
  { n: "05", title: "Executive Decision Challenge", desc: "Diagnose a 25% sales drop and deliver a 30/60/90-day recovery plan." },
];

export function Overview() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <Card className="relative overflow-hidden p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-red/10 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold-soft">
            🚚 {BRAND.category}
          </div>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            <span className="text-gradient-gold">Safar-e-Zaiqa</span>
          </h1>
          <p className="mt-3 text-lg font-medium text-text-muted sm:text-xl">
            “{BRAND.tagline}” — an AI Marketing Intelligence Command Center
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
            A complete, AI-powered marketing analysis for a student-focused desi biryani &amp;
            pulao food truck. Five intelligence modules — customer personas, sales forecasting,
            competitive benchmarking, marketing automation and an executive recovery challenge —
            each augmented with live Google&nbsp;AI generation.
          </p>
          <p className="mt-4 text-xs text-text-dim">
            {BRAND.course} · {BRAND.author}
          </p>
        </div>
      </Card>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Steady Monthly Revenue" value={`PKR ${(REVENUE_PROJECTION.monthlySteady / 1000).toFixed(0)}K`} sub="Month 3, single truck" accent />
        <Stat label="Avg. Order Value" value="PKR 280" sub="Within student range" />
        <Stat label="Gross Margin" value={`${REVENUE_PROJECTION.grossMarginPct}%`} sub="Before fixed costs" />
        <Stat label="Customer Personas" value={`${PERSONAS.length}`} sub={`${COMPETITORS.length} competitors mapped`} />
      </div>

      {/* The five parts */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-dim">
          The Five Intelligence Modules
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PARTS.map((p) => (
            <Card key={p.n} className="p-6" hover>
              <div className="flex items-start justify-between">
                <span className="text-3xl font-black text-gradient-gold">{p.n}</span>
                <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-text-dim">
                  20 Marks
                </span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-text">{p.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{p.desc}</p>
            </Card>
          ))}
          <Card className="flex flex-col justify-center bg-gradient-to-br from-gold/10 to-transparent p-6">
            <p className="text-2xl font-bold text-gradient-gold">100</p>
            <p className="text-sm font-medium text-text">Total Marks</p>
            <p className="mt-2 text-xs text-text-muted">
              Every module pairs a ready analysis with a live ✦ AI panel.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
