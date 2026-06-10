"use client";

import { useEffect, useState } from "react";
import { Card, SectionHeader } from "@/app/components/ui";
import { Markdown } from "@/app/components/Markdown";

const STORAGE_KEY = "sez_warroom_v1";

type Case = { id: string; scenario: string; response: string; at: string };

const EXAMPLES = [
  "Sales dropped 25% right after the university exam break started.",
  "A new competitor opened next to campus with a Rs. 250 biryani combo.",
  "Two bad hygiene reviews went viral on Instagram this week.",
  "Food costs jumped 20% and our margins are getting squeezed.",
];

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

export function ExecutiveChallenge() {
  const [scenario, setScenario] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCases(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  }, [cases, loaded]);

  async function generate() {
    const s = scenario.trim();
    if (!s) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: "executive-challenge", input: s }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not generate guidance.");
        return;
      }
      setCases((c) => [{ id: uid(), scenario: s, response: data.text, at: new Date().toLocaleString() }, ...c]);
      setScenario("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function remove(id: string) {
    setCases((c) => c.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Part 5"
        marks={20}
        title="Executive Decision War-Room"
        subtitle="Describe what just happened to the business. The AI advisor diagnoses root causes and returns a prioritised 30/60/90-day recovery plan with expected outcomes. Every case is saved on this device."
      />

      {/* Scenario input */}
      <Card className="p-6">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gold-soft">
          What happened?
        </label>
        <textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          rows={4}
          placeholder="e.g. Our weekday sales fell sharply this month and a competitor just launched a cheaper student combo nearby…"
          className="w-full resize-none rounded-xl border border-border bg-bg/60 px-4 py-3 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setScenario(ex)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted transition hover:border-gold/40 hover:text-text"
            >
              {ex.length > 46 ? ex.slice(0, 44) + "…" : ex}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red">⚠️ {error}</p>}
        <button
          onClick={generate}
          disabled={busy || !scenario.trim()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-semibold text-[#1a1505] transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Analysing…
            </>
          ) : (
            <>✦ Get AI recovery plan</>
          )}
        </button>
      </Card>

      {busy && (
        <Card className="p-6">
          <div className="space-y-2">
            {[80, 92, 70, 85, 60].map((w, i) => (
              <div key={i} className="shimmer h-3 rounded bg-surface-2" style={{ width: `${w}%` }} />
            ))}
          </div>
        </Card>
      )}

      {/* Saved cases */}
      {cases.length > 0 && (
        <div className="space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-dim">
            War-room history ({cases.length})
          </h3>
          {cases.map((c) => (
            <Card key={c.id} className="animate-fade-up p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-lg">🎯</span>
                  <div>
                    <p className="text-sm font-medium text-text">{c.scenario}</p>
                    <p className="text-[11px] text-text-dim">{c.at}</p>
                  </div>
                </div>
                <button onClick={() => remove(c.id)} className="shrink-0 rounded-lg border border-red/30 px-2.5 py-1.5 text-xs text-red hover:bg-red/10">
                  Delete
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-bg/50 p-4">
                <Markdown text={c.response} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
