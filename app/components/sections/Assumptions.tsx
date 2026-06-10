import { FORECAST_ASSUMPTIONS } from "@/app/lib/content";
import { Card, SectionHeader, Pill } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

type Assumption = {
  text: string;
  basis: string;
  risk: "High" | "Medium" | "Low";
};

type Group = {
  area: string;
  emoji: string;
  items: Assumption[];
};

const GROUPS: Group[] = [
  {
    area: "Customer & Demand",
    emoji: "👥",
    items: [
      { text: "Students (18–25) remain ~70% of demand and stay highly price-sensitive.", basis: "Assignment 1: 70% of 20 respondents were students.", risk: "Medium" },
      { text: "Demand peaks hold at lunch (12–3 PM) and evening (5–8 PM).", basis: "Field interviews on meal timing.", risk: "Low" },
      { text: "Word-of-mouth + social drives 7–8% organic monthly growth.", basis: "Gen-Z virality assumption for campus food.", risk: "High" },
    ],
  },
  {
    area: "Pricing & Revenue",
    emoji: "💰",
    items: [
      { text: "Blended average order value holds at PKR 350.", basis: "Validated PKR 200–400 willingness-to-pay band.", risk: "Medium" },
      { text: "Customers resist prices above PKR 500 per plate.", basis: "Very few A1 respondents would pay PKR 500+ regularly.", risk: "Low" },
      { text: "Gross margin stays near 55% after a ~45% food-cost ratio.", basis: "Typical desi food-truck cost structure.", risk: "High" },
    ],
  },
  {
    area: "Operations & Capacity",
    emoji: "🚚",
    items: [
      { text: "A single truck can serve ~150 plates/day at peak throughput.", basis: "Prep time + queue speed estimate.", risk: "Medium" },
      { text: "Operates 6 days/week while the university is in session.", basis: "Mobile model following campus footfall.", risk: "Low" },
      { text: "Exam breaks & summer vacation cut demand ~30%.", basis: "Academic-calendar seasonality.", risk: "High" },
    ],
  },
  {
    area: "Competitive & Market",
    emoji: "⚔️",
    items: [
      { text: "No incumbent currently owns 'affordable + hygienic + eco'.", basis: "Benchmark gap vs. Biryani Master / Master Biryani.", risk: "Medium" },
      { text: "Competitors don't immediately match our price + hygiene combo.", basis: "Imitation lag assumption.", risk: "High" },
      { text: "Input & fuel costs stay within a manageable inflation band.", basis: "Macro stability assumption.", risk: "High" },
    ],
  },
];

const riskTone = (r: Assumption["risk"]) =>
  r === "High" ? "red" : r === "Medium" ? "gold" : "green";

export function Assumptions() {
  const counts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  for (const g of GROUPS) {
    for (const a of g.items) counts[a.risk] += 1;
  }

  return (
    <div className="space-y-10">
      <SectionHeader
        part="Cross-Cutting"
        title="Assumptions Register"
        subtitle="Every forecast, persona and strategy in this report rests on a set of stated assumptions. They are gathered here — with their evidence basis and risk rating — so the analysis stays transparent and auditable."
      />

      {/* Risk summary */}
      <div className="grid grid-cols-3 gap-4">
        <RiskTile label="High-risk" count={counts.High ?? 0} tone="red" />
        <RiskTile label="Medium-risk" count={counts.Medium ?? 0} tone="gold" />
        <RiskTile label="Low-risk" count={counts.Low ?? 0} tone="green" />
      </div>

      {/* Grouped assumptions */}
      <div className="grid gap-5 lg:grid-cols-2">
        {GROUPS.map((g) => (
          <Card key={g.area} className="p-6">
            <h3 className="flex items-center gap-2 text-base font-semibold text-text">
              <span className="text-xl">{g.emoji}</span> {g.area}
            </h3>
            <ul className="mt-4 space-y-3">
              {g.items.map((a) => (
                <li
                  key={a.text}
                  className="rounded-xl border border-border-soft bg-surface-2/40 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-text">{a.text}</p>
                    <Pill tone={riskTone(a.risk)}>{a.risk}</Pill>
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted">
                    <span className="text-text-dim">Basis:</span> {a.basis}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Core forecasting assumptions recap */}
      <Card className="bg-gradient-to-br from-gold/[0.06] to-transparent p-6">
        <h3 className="text-base font-semibold text-text">
          Core Forecasting Assumptions (Part 2)
        </h3>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {FORECAST_ASSUMPTIONS.map((a, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-text-muted">
              <span className="text-gold">✓</span>
              <span className="leading-relaxed">{a}</span>
            </li>
          ))}
        </ul>
      </Card>

      <AIGenerator
        part="assumptions"
        title="Pressure-test these assumptions with AI"
        cta="Stress-Test Assumptions"
        placeholder="Optional: e.g. 'which assumption would sink us first?'…"
      />
    </div>
  );
}

function RiskTile({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "red" | "gold" | "green";
}) {
  const color = tone === "red" ? "#e23b3b" : tone === "gold" ? "#d4af37" : "#3ec77a";
  return (
    <Card className="p-5" hover>
      <p className="text-3xl font-bold" style={{ color }}>
        {count}
      </p>
      <p className="mt-1 text-sm text-text-muted">{label} assumptions</p>
    </Card>
  );
}
