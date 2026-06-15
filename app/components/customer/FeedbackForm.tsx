"use client";

import { useState } from "react";
import type { CustomerUser } from "@/app/lib/types";
import {
  QUALITY_ORDER,
  QUALITY_LABELS,
  QUALITY_ICONS,
  type QualityKey,
} from "@/app/lib/feedback-analyzer";

const RATING_LABELS = ["", "Terrible", "Poor", "Okay", "Good", "Excellent"];

/**
 * Customer review widget. Collects a 1–5 star rating + a free-text comment and
 * posts to /api/feedback. The admin-side Zaiqa Sense model does the analysis;
 * the customer just shares their honest experience.
 */
export function FeedbackForm({ me }: { me: CustomerUser | null }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState("");
  const [pillars, setPillars] = useState<QualityKey[]>([]);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const shown = hover || rating;

  function togglePillar(k: QualityKey) {
    setPillars((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  }

  async function submit() {
    setError("");
    if (rating < 1 && message.trim().length < 2) {
      setError("Please tap a star rating or write a few words.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, message: message.trim(), name: name.trim(), pillars }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Could not send your feedback.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="feedback" className="mt-16 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-gold/[0.06] to-transparent p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft">Your Opinion</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">How was your Zaiqa?</h2>
          <p className="mt-2 text-sm text-text-muted">
            Tell us about the taste, service, value and cleanliness — it takes 20 seconds and helps us
            cook better, every single day.
          </p>

          {done ? (
            <div className="animate-scale-in mt-8 rounded-2xl border border-green/40 bg-green/10 p-6">
              <p className="text-3xl">🙏</p>
              <p className="mt-2 text-lg font-semibold text-green">Shukria{me?.name ? `, ${me.name.split(" ")[0]}` : ""}!</p>
              <p className="mt-1 text-sm text-text-muted">
                Your feedback reached our team. We read every single review.
              </p>
              <button
                onClick={() => {
                  setDone(false);
                  setRating(0);
                  setMessage("");
                  setPillars([]);
                }}
                className="mt-4 text-xs text-gold-soft underline-offset-2 hover:underline"
              >
                Leave another review
              </button>
            </div>
          ) : (
            <div className="mt-7">
              {/* Stars */}
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className={`text-4xl transition-transform hover:scale-110 ${
                      n <= shown ? "text-gold" : "text-border"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="mt-2 h-5 text-sm font-medium text-gold-soft">{RATING_LABELS[shown]}</p>

              {/* Pillar tags — help us pin down what this is about */}
              <div className="mt-5 text-left">
                <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-text-dim">
                  Which areas is this about? <span className="text-text-dim">(optional)</span>
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUALITY_ORDER.map((k) => {
                    const on = pillars.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={on}
                        onClick={() => togglePillar(k)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          on
                            ? "border-gold/50 bg-gold/15 text-gold-soft"
                            : "border-border bg-surface text-text-muted hover:border-gold/40 hover:text-text"
                        }`}
                      >
                        {QUALITY_ICONS[k]} {QUALITY_LABELS[k]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="What did you love? What could be better? (e.g. 'Biryani was mazedaar but the wait was long')"
                className="mt-3 w-full resize-none rounded-xl border border-border bg-bg/60 px-4 py-3 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50"
              />

              {!me && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="mt-3 w-full rounded-xl border border-border bg-bg/60 px-4 py-2.5 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50"
                />
              )}

              {error && (
                <p className="animate-fade-up mt-3 text-sm text-red">⚠️ {error}</p>
              )}

              <button
                onClick={submit}
                disabled={sending}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-3 text-sm font-bold text-[#1a1505] transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-10"
              >
                {sending ? "Sending…" : "Submit Review"}
              </button>
              <p className="mt-3 text-[11px] text-text-dim">
                {me ? `Posting as ${me.name}` : "You can review as a guest — no account needed."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
