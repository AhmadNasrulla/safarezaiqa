import { JOURNEY, CHATBOT_FLOW, LOYALTY_TIERS } from "@/app/lib/content";
import { Card, SectionHeader, Pill } from "@/app/components/ui";
import { AIGenerator } from "@/app/components/AIGenerator";

export function MarketingAutomation() {
  return (
    <div className="space-y-10">
      <SectionHeader
        part="Part 4"
        marks={20}
        title="AI Marketing Automation Design"
        subtitle="An AI-enabled customer journey across all five lifecycle stages, an end-to-end WhatsApp chatbot flow, and a tiered Zaiqa Points loyalty program — built to convert students into repeat advocates."
      />

      {/* AARRR journey */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-text">
          AI-Enabled Customer Journey (AARRR)
        </h3>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {JOURNEY.map((s, i) => (
            <Card key={s.stage} className="relative flex flex-col p-5" hover>
              <div className="absolute right-3 top-3 text-xs font-bold text-text-dim">
                0{i + 1}
              </div>
              <div className="text-2xl">{s.emoji}</div>
              <h4 className="mt-2 text-base font-bold text-gold-soft">{s.stage}</h4>
              <p className="mt-1 text-xs font-medium text-text">{s.goal}</p>
              <ul className="mt-3 space-y-1.5">
                {s.aiActions.map((a) => (
                  <li key={a} className="flex gap-1.5 text-xs text-text-muted">
                    <span className="text-gold">✦</span>
                    <span className="leading-snug">{a}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 border-t border-border pt-2">
                <p className="text-[10px] uppercase tracking-wide text-text-dim">KPI</p>
                <p className="text-xs text-text-muted">{s.kpi}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Chatbot flow */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text">WhatsApp Chatbot Flow</h3>
            <Pill tone="green">🟢 Automated</Pill>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Greeting → menu → customise → order → fulfilment → payment → feedback.
          </p>
          <div className="mt-5 space-y-3">
            {CHATBOT_FLOW.map((node, i) => (
              <div
                key={i}
                className={`flex ${node.speaker === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%]">
                  {node.branch && node.speaker === "bot" && (
                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-text-dim">
                      {node.branch}
                    </p>
                  )}
                  <div
                    className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      node.speaker === "user"
                        ? "rounded-br-sm bg-gradient-to-br from-gold-soft to-gold-deep text-[#1a1505]"
                        : "rounded-bl-sm border border-border bg-surface-2 text-text-muted"
                    }`}
                  >
                    {node.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Loyalty program */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text">Zaiqa Points — Loyalty Program</h3>
          <p className="mt-1 text-sm text-text-muted">
            Earn 1 point per PKR 100 spent. Three tiers turn first-timers into Gold advocates.
          </p>
          <div className="mt-5 space-y-4">
            {LOYALTY_TIERS.map((t) => (
              <div
                key={t.tier}
                className="rounded-xl border p-4"
                style={{ borderColor: `${t.color}55`, background: `${t.color}0d` }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold" style={{ color: t.color }}>
                    {t.tier}
                  </h4>
                  <span className="text-xs font-medium text-text-dim">{t.threshold}</span>
                </div>
                <ul className="mt-2.5 space-y-1">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2 text-xs text-text-muted">
                      <span style={{ color: t.color }}>◆</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <AIGenerator
        part="marketing-automation"
        title="Design more automation flows with AI"
        cta="Generate Flows"
        placeholder="Optional: e.g. 'design a cart-abandonment win-back sequence'…"
      />
    </div>
  );
}
