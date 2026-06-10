import { PERSONAS, A1_COMPARISON } from "@/app/lib/content";
import { Card, SectionHeader, Pill } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

export function CustomerIntelligence() {
  return (
    <div className="space-y-10">
      <SectionHeader
        part="Part 1"
        marks={20}
        title="AI Customer Intelligence"
        subtitle="Three detailed, AI-generated personas for Safar-e-Zaiqa — each mapped to pain points, purchase triggers, communication channels and buying behaviour — then validated against the Assignment 1 field research."
      />

      {/* Persona cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {PERSONAS.map((p) => (
          <Card key={p.id} className="flex flex-col p-6" hover>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-2xl">
                {p.emoji}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">{p.name}</h3>
                <p className="text-xs font-medium text-gold-soft">{p.archetype}</p>
              </div>
            </div>

            <p className="mt-4 border-l-2 border-gold/40 pl-3 text-sm italic leading-relaxed text-text-muted">
              “{p.quote}”
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <Meta label="Age" value={p.age} />
              <Meta label="Budget/meal" value={p.budget} />
              <Meta label="Occupation" value={p.occupation} />
              <Meta label="Income" value={p.income} />
            </dl>

            <p className="mt-4 text-sm leading-relaxed text-text-muted">{p.bio}</p>

            <PersonaList title="Pain Points" tone="red" items={p.painPoints} />
            <PersonaList title="Purchase Triggers" tone="green" items={p.triggers} />
            <PersonaList title="Buying Behaviour" tone="blue" items={p.behavior} />

            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-dim">
                Channels
              </p>
              <div className="flex flex-wrap gap-1.5">
                {p.channels.map((c) => (
                  <Pill key={c} tone="gold">
                    {c}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-dim">Share of customer base</span>
                <span className="font-semibold text-gold-soft">{p.share}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold-deep"
                  style={{ width: `${p.share}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Comparison with Assignment 1 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text">
          AI Insights vs. Assignment 1 Field Research
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Where the AI personas confirm, deepen, or add net-new understanding to the original
          20-interview study.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="py-2 pr-4 font-medium">Dimension</th>
                <th className="py-2 pr-4 font-medium">Assignment 1 Finding</th>
                <th className="py-2 pr-4 font-medium">AI-Generated Insight</th>
                <th className="py-2 font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {A1_COMPARISON.map((r) => (
                <tr key={r.dimension} className="border-b border-border-soft align-top">
                  <td className="py-3 pr-4 font-medium text-text">{r.dimension}</td>
                  <td className="py-3 pr-4 text-text-muted">{r.assignment1}</td>
                  <td className="py-3 pr-4 text-text-muted">{r.aiInsight}</td>
                  <td className="py-3">
                    <Pill
                      tone={r.verdict === "Confirms" ? "green" : r.verdict === "Deepens" ? "gold" : "blue"}
                    >
                      {r.verdict}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AIGenerator
        part="customer-intelligence"
        title="Discover a 4th persona with AI"
        cta="Generate Persona"
        placeholder="Optional: e.g. 'focus on late-night hostel students'…"
      />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-text-dim">{label}</dt>
      <dd className="font-medium text-text">{value}</dd>
    </div>
  );
}

function PersonaList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "red" | "green" | "blue";
}) {
  const dot = tone === "red" ? "bg-red" : tone === "green" ? "bg-green" : "bg-blue";
  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-dim">
        {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex gap-2 text-sm text-text-muted">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span className="leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
