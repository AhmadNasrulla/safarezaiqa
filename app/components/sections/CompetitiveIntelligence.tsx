import { COMPETITORS, BENCHMARK, SWOT } from "@/app/lib/content";
import { Card, SectionHeader, Pill, ScoreBar } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

export function CompetitiveIntelligence() {
  const direct = COMPETITORS.filter((c) => c.type === "Direct");
  const indirect = COMPETITORS.filter((c) => c.type === "Indirect");

  return (
    <div className="space-y-10">
      <SectionHeader
        part="Part 3"
        marks={20}
        title="AI-Based Competitive Intelligence"
        subtitle="Five direct and three indirect competitors evaluated on pricing, reviews, engagement and USP — distilled into a benchmark matrix and a full SWOT analysis for Safar-e-Zaiqa."
      />

      {/* Competitor tables */}
      <div className="grid gap-5 lg:grid-cols-2">
        <CompetitorTable title="5 Direct Competitors" rows={direct} />
        <CompetitorTable title="3 Indirect Competitors" rows={indirect} />
      </div>

      {/* Benchmark matrix */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text">Competitor Benchmark Matrix</h3>
        <p className="mt-1 text-sm text-text-muted">
          Scored 1–5 across the dimensions students care about most. Safar-e-Zaiqa leads on
          affordability, hygiene and portion size.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="py-2 pr-4 font-medium">Brand</th>
                <th className="py-2 pr-4 font-medium">Affordability</th>
                <th className="py-2 pr-4 font-medium">Hygiene</th>
                <th className="py-2 pr-4 font-medium">Taste</th>
                <th className="py-2 pr-4 font-medium">Portion</th>
                <th className="py-2 font-medium">Digital</th>
              </tr>
            </thead>
            <tbody>
              {BENCHMARK.map((b, i) => (
                <tr
                  key={b.brand}
                  className={`border-b border-border-soft ${
                    i === 0 ? "bg-gold/[0.05]" : ""
                  }`}
                >
                  <td className="py-3 pr-4 font-medium">
                    <span className={i === 0 ? "text-gradient-gold font-bold" : "text-text"}>
                      {b.brand}
                    </span>
                    {i === 0 && <span className="ml-2 text-[10px] text-gold-soft">★ Us</span>}
                  </td>
                  <td className="py-3 pr-4"><ScoreBar score={b.affordability} /></td>
                  <td className="py-3 pr-4"><ScoreBar score={b.hygiene} /></td>
                  <td className="py-3 pr-4"><ScoreBar score={b.taste} /></td>
                  <td className="py-3 pr-4"><ScoreBar score={b.portion} /></td>
                  <td className="py-3"><ScoreBar score={b.digital} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SWOT */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text">SWOT Analysis — Safar-e-Zaiqa</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <SwotCard title="Strengths" tone="green" emoji="💪" items={SWOT.strengths} />
          <SwotCard title="Weaknesses" tone="red" emoji="⚠️" items={SWOT.weaknesses} />
          <SwotCard title="Opportunities" tone="blue" emoji="🚀" items={SWOT.opportunities} />
          <SwotCard title="Threats" tone="amber" emoji="🛡️" items={SWOT.threats} />
        </div>
      </div>

      <AIGenerator
        part="competitive-intelligence"
        title="Get a strategic competitive read from AI"
        cta="Generate Strategy"
        placeholder="Optional: e.g. 'how to beat Student Biryani on delivery'…"
      />
    </div>
  );
}

function CompetitorTable({
  title,
  rows,
}: {
  title: string;
  rows: typeof COMPETITORS;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-text">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((c) => (
          <div
            key={c.name}
            className="rounded-xl border border-border-soft bg-surface-2/40 p-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-text">{c.name}</p>
              <div className="flex items-center gap-1 text-xs text-amber">
                ★ <span className="font-semibold">{c.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-text-muted">{c.usp}</p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <Pill tone="gold">{c.price}</Pill>
              <Pill
                tone={c.engagement === "High" ? "green" : c.engagement === "Medium" ? "blue" : "neutral"}
              >
                {c.engagement} engagement
              </Pill>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SwotCard({
  title,
  emoji,
  items,
  tone,
}: {
  title: string;
  emoji: string;
  items: string[];
  tone: "green" | "red" | "blue" | "amber";
}) {
  const ring: Record<string, string> = {
    green: "border-green/30 from-green/[0.07]",
    red: "border-red/30 from-red/[0.07]",
    blue: "border-blue/30 from-blue/[0.07]",
    amber: "border-amber/30 from-amber/[0.07]",
  };
  const dot: Record<string, string> = {
    green: "bg-green",
    red: "bg-red",
    blue: "bg-blue",
    amber: "bg-amber",
  };
  return (
    <Card className={`bg-gradient-to-br to-transparent p-5 ${ring[tone]}`}>
      <h4 className="flex items-center gap-2 text-base font-semibold text-text">
        <span>{emoji}</span> {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2.5 text-sm text-text-muted">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot[tone]}`} />
            <span className="leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
