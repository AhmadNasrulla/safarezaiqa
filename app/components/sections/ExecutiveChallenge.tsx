import {
  CRISIS,
  DIAGNOSED_CAUSES,
  RECOVERY_PLAN,
  EXPECTED_OUTCOMES,
} from "@/app/lib/content";
import { Card, SectionHeader, Pill } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

const pkr = (n: number) => `PKR ${n.toLocaleString()}`;

export function ExecutiveChallenge() {
  return (
    <div className="space-y-10">
      <SectionHeader
        part="Part 5"
        marks={20}
        title="Executive Decision Challenge"
        subtitle="Scenario: after three strong months, monthly sales have suddenly dropped 25%. An AI-driven root-cause diagnosis, a prioritised 30/60/90-day recovery plan, and the expected outcomes that prove the turnaround."
      />

      {/* Crisis banner */}
      <Card className="overflow-hidden border-red/40 bg-gradient-to-br from-red/[0.1] to-transparent p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red/40 bg-red/15 text-2xl">
              📉
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red">
                Code Red · Month 4
              </p>
              <h3 className="text-lg font-bold text-text">Sales dropped 25% overnight</h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Metric label="Baseline" value={pkr(CRISIS.baselineMonthly)} />
            <Metric label="Now" value={pkr(CRISIS.droppedMonthly)} tone="red" />
            <Metric label="Lost / month" value={`-${pkr(CRISIS.lostRevenue)}`} tone="red" />
          </div>
        </div>
      </Card>

      {/* Diagnosis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text">
          🔍 AI Root-Cause Diagnosis
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          AI-assisted analysis ranks the most probable internal, external and market drivers
          behind the decline.
        </p>
        <div className="mt-5 space-y-3">
          {DIAGNOSED_CAUSES.map((c) => (
            <div
              key={c.cause}
              className="flex flex-col gap-2 rounded-xl border border-border-soft bg-surface-2/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Pill
                    tone={c.category === "Internal" ? "gold" : c.category === "External" ? "blue" : "red"}
                  >
                    {c.category}
                  </Pill>
                  <p className="font-medium text-text">{c.cause}</p>
                </div>
                <p className="mt-1.5 text-xs text-text-muted">
                  <span className="text-text-dim">Evidence:</span> {c.evidence}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wide text-text-dim">Likelihood</span>
                <Pill tone={c.likelihood === "High" ? "red" : c.likelihood === "Medium" ? "gold" : "neutral"}>
                  {c.likelihood}
                </Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recovery plan */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text">
          🛠️ Strategic Recovery Plan — 30 / 60 / 90 Days
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          {RECOVERY_PLAN.map((r, i) => (
            <Card key={r.horizon} className="flex flex-col p-6" hover>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold-soft">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-dim">
                  {r.horizon}
                </span>
              </div>
              <h4 className="mt-3 text-base font-bold text-text">{r.title}</h4>
              <ul className="mt-3 flex-1 space-y-2">
                {r.actions.map((a) => (
                  <li key={a} className="flex gap-2 text-sm text-text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span className="leading-snug">{a}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg border border-green/30 bg-green/[0.07] px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-text-dim">Expected outcome</p>
                <p className="text-sm font-medium text-green">{r.expected}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Expected outcomes table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text">📈 Expected Outcomes by Day 90</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-dim">
                <th className="py-2 pr-4 font-medium">Metric</th>
                <th className="py-2 pr-4 font-medium">From</th>
                <th className="py-2 pr-4 font-medium">Target</th>
                <th className="py-2 font-medium">Window</th>
              </tr>
            </thead>
            <tbody>
              {EXPECTED_OUTCOMES.map((o) => (
                <tr key={o.metric} className="border-b border-border-soft">
                  <td className="py-3 pr-4 font-medium text-text">{o.metric}</td>
                  <td className="py-3 pr-4 text-red">{o.from}</td>
                  <td className="py-3 pr-4 font-semibold text-green">{o.to}</td>
                  <td className="py-3 text-text-muted">{o.window}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AIGenerator
        part="executive-challenge"
        title="Run the war-room with AI"
        cta="Generate Recovery Memo"
        placeholder="Optional: e.g. 'assume the cause is a new competitor', 'budget is tight'…"
      />
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red";
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-text-dim">{label}</p>
      <p className={`text-lg font-bold ${tone === "red" ? "text-red" : "text-text"}`}>{value}</p>
    </div>
  );
}
