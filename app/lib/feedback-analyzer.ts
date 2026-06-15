/**
 * Zaiqa Sense — an on-device (offline) feedback-intelligence model.
 *
 * No network, no API key: a lexicon-driven, aspect-based sentiment analyzer
 * purpose-built for Safar-e-Zaiqa customer reviews. Given a free-text review
 * (and an optional 1–5 star rating) it "reads" the comment and reports:
 *
 *   • overall sentiment (positive / neutral / negative) + a confidence score
 *   • a 0–100 score for each of the 4 quality pillars — Taste, Service,
 *     Value and Hygiene (the "bar of 4 qualities")
 *   • what went wrong (issues) and what went well (highlights)
 *   • a one-line, human-readable summary of how the feedback reads
 *
 * It understands English plus common Roman-Urdu food vocabulary, and handles
 * negation ("not good"), intensifiers ("bohat tasty") and diminishers
 * ("thoda slow") with a short look-back window.
 *
 * Pure & isomorphic — no server-only imports — so it can run on the server
 * (to persist analysis the moment feedback is submitted) or in the browser
 * (for a live, instant preview). This is deliberately a transparent, rules-
 * based model: every score it produces can be traced back to the words that
 * caused it, which is exactly what an operator wants from a review triage tool.
 */

/* ------------------------------ Public types ----------------------------- */

export type QualityKey = "taste" | "service" | "value" | "hygiene";

export type Sentiment = "positive" | "neutral" | "negative";

export type QualityScore = {
  key: QualityKey;
  label: string;
  icon: string;
  score: number; // 0–100
  mentioned: boolean; // did the review actually touch this pillar?
  polarity: number; // raw signed signal (for debugging / transparency)
};

export type FeedbackAnalysis = {
  sentiment: Sentiment;
  sentimentScore: number; // -1 … 1
  confidence: number; // 0 … 1
  summary: string; // "how was the feedback"
  qualities: QualityScore[]; // always 4, in QUALITY_ORDER
  issues: string[]; // "what was bad"
  highlights: string[]; // what was good
  keywords: string[]; // notable matched terms
  tagged: QualityKey[]; // pillars the customer explicitly selected
  model: string; // model identifier, for display
};

/* ----------------------------- Pillar metadata --------------------------- */

export const QUALITY_ORDER: QualityKey[] = ["taste", "service", "value", "hygiene"];

export const QUALITY_LABELS: Record<QualityKey, string> = {
  taste: "Taste & Food",
  service: "Service & Speed",
  value: "Value for Money",
  hygiene: "Hygiene & Cleanliness",
};

export const QUALITY_ICONS: Record<QualityKey, string> = {
  taste: "🍛",
  service: "🤝",
  value: "💸",
  hygiene: "🧼",
};

const QUALITY_SHORT: Record<QualityKey, string> = {
  taste: "taste",
  service: "service & speed",
  value: "value for money",
  hygiene: "hygiene",
};

export const MODEL_NAME = "Zaiqa Sense v1 · on-device";

/* -------------------------------- Lexicons ------------------------------- */

// Keyword → quality pillar. A word maps to a single pillar (last one wins on
// the rare overlap). Includes Roman-Urdu terms common in Lahore reviews.
const ASPECT_KEYWORDS: Record<QualityKey, string[]> = {
  taste: [
    "taste", "tasty", "flavour", "flavor", "flavours", "flavors", "delicious", "yummy", "yum",
    "biryani", "pulao", "food", "dish", "dishes", "meal", "masala", "spice", "spices", "spicy",
    "rice", "meat", "chicken", "beef", "mutton", "aroma", "cooked", "undercooked", "overcooked",
    "raw", "bland", "salty", "oily", "greasy", "stale", "delish", "zaiqa", "mazedaar", "mazaydaar",
    "lazeez", "lajawab", "khana", "namak", "mirch", "degh", "daig",
  ],
  service: [
    "service", "staff", "waiter", "crew", "team", "behaviour", "behavior", "rude", "polite",
    "friendly", "helpful", "attitude", "slow", "fast", "quick", "wait", "waiting", "waited",
    "late", "delay", "delayed", "queue", "served", "serving", "prompt", "speed", "rider",
    "delivery", "response", "responsive", "mannered",
  ],
  value: [
    "price", "priced", "pricing", "expensive", "cheap", "value", "worth", "money", "cost",
    "costly", "affordable", "overpriced", "pricey", "portion", "portions", "quantity", "size",
    "amount", "deal", "combo", "budget", "mehnga", "mehanga", "sasta", "paisa", "paise", "daam",
  ],
  hygiene: [
    "clean", "cleanliness", "hygiene", "hygienic", "unhygienic", "dirty", "filthy", "gloves",
    "mask", "cap", "uniform", "neat", "tidy", "smell", "smelly", "odour", "odor", "packaging",
    "packing", "wrapped", "saaf", "safai", "ganda", "gandi", "gandagi", "makhi", "fly", "flies",
  ],
};

// Word → polarity. +2 / -2 are "strong", +1 / -1 are "mild", 0 is explicitly
// neutral (e.g. "ok"). Several of these double as aspect keywords on purpose,
// so a single word can both locate a pillar and score it.
const SENTIMENT: Record<string, number> = {
  // strong positive
  amazing: 2, awesome: 2, excellent: 2, outstanding: 2, perfect: 2, best: 2, love: 2, loved: 2,
  loving: 2, delicious: 2, superb: 2, fantastic: 2, wonderful: 2, incredible: 2, brilliant: 2,
  delish: 2, mazedaar: 2, mazaydaar: 2, lazeez: 2, lajawab: 2, zabardast: 2, shandaar: 2,
  behtareen: 2, kamaal: 2, kamal: 2,
  // mild positive
  good: 1, great: 1, nice: 1, tasty: 1, yummy: 1, yum: 1, fresh: 1, friendly: 1, polite: 1,
  helpful: 1, fast: 1, quick: 1, prompt: 1, clean: 1, hygienic: 1, neat: 1, tidy: 1,
  affordable: 1, cheap: 1, worth: 1, reasonable: 1, recommend: 1, recommended: 1, satisfied: 1,
  happy: 1, hot: 1, warm: 1, generous: 1, filling: 1, soft: 1, juicy: 1, decent: 1, enjoyed: 1,
  acha: 1, accha: 1, badhiya: 1, theek: 1, sasta: 1, saaf: 1,
  // neutral
  ok: 0, okay: 0, fine: 0, normal: 0,
  // mild negative
  bad: -1, poor: -1, slow: -1, late: -1, delayed: -1, cold: -1, small: -1, bland: -1, salty: -1,
  oily: -1, greasy: -1, expensive: -1, costly: -1, overpriced: -1, pricey: -1, dry: -1, hard: -1,
  average: -1, mediocre: -1, meh: -1, smelly: -1, undercooked: -1, overcooked: -1,
  mehnga: -1, mehanga: -1, thanda: -1, kam: -1,
  // strong negative
  worst: -2, terrible: -2, awful: -2, horrible: -2, disgusting: -2, hate: -2, hated: -2, rude: -2,
  dirty: -2, filthy: -2, stale: -2, rotten: -2, unhygienic: -2, raw: -2, disappointed: -2,
  disappointing: -2, pathetic: -2, nasty: -2, inedible: -2, bakwaas: -2, ganda: -2, gandi: -2,
  kharab: -2, bura: -2, bekar: -2, bekaar: -2, faltu: -2,
};

const INTENSIFIERS = new Set([
  "very", "really", "so", "too", "extremely", "super", "absolutely", "totally", "highly",
  "quite", "bohat", "bahut", "boht", "bht", "buht", "zyada", "ziada", "bilkul",
]);

const DIMINISHERS = new Set([
  "slightly", "somewhat", "kinda", "bit", "little", "barely", "thoda", "thori", "thora",
]);

const NEGATORS = new Set([
  "not", "no", "never", "none", "without", "hardly", "cannot", "cant", "dont", "didnt",
  "doesnt", "wasnt", "werent", "isnt", "arent", "nahi", "nahin", "na",
]);

// Build a flat word → pillar lookup once.
const ASPECT_LOOKUP: Record<string, QualityKey> = (() => {
  const map: Record<string, QualityKey> = {};
  for (const key of QUALITY_ORDER) for (const w of ASPECT_KEYWORDS[key]) map[w] = key;
  return map;
})();

/* ------------------------------- Utilities ------------------------------- */

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Split a review into clauses so we can attribute sentiment per pillar. */
function toSegments(text: string): string[] {
  return text
    .split(/[.!?;\n]+|,|\b(?:but|however|though|although|lekin|laikin|magar|aur)\b/gi)
    .map((s) => (s ? s.trim() : ""))
    .filter(Boolean);
}

function words(segment: string): string[] {
  return segment
    .toLowerCase()
    .replace(/['’`]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Score one clause, applying negation / intensifier / diminisher look-back. */
function scoreSegment(tokens: string[]): { polarity: number; signals: number } {
  let polarity = 0;
  let signals = 0;
  for (let i = 0; i < tokens.length; i++) {
    const base = SENTIMENT[tokens[i]];
    if (base === undefined) continue;
    signals++;
    if (base === 0) continue;
    let mult = 1;
    let negated = false;
    for (let j = Math.max(0, i - 3); j < i; j++) {
      const w = tokens[j];
      if (NEGATORS.has(w)) negated = true;
      else if (INTENSIFIERS.has(w)) mult *= 1.5;
      else if (DIMINISHERS.has(w)) mult *= 0.5;
    }
    let val = base * mult;
    if (negated) val = -val * 0.9; // "not great" leans negative but softer than "terrible"
    polarity += val;
  }
  return { polarity, signals };
}

function aspectsIn(tokens: string[]): QualityKey[] {
  const found = new Set<QualityKey>();
  for (const t of tokens) {
    const a = ASPECT_LOOKUP[t];
    if (a) found.add(a);
  }
  return [...found];
}

function humanize(segment: string): string {
  const s = segment.trim().replace(/\s+/g, " ");
  if (!s) return "";
  const capped = s.length > 90 ? s.slice(0, 87).trimEnd() + "…" : s;
  return capped.charAt(0).toUpperCase() + capped.slice(1);
}

/** Map a raw signed pillar signal to a 0–100 score via a smooth S-curve. */
function polarityToScore(polarity: number): number {
  return clamp(Math.round(50 + 50 * Math.tanh(polarity / 2.5)), 3, 100);
}

/** Map a 1–5 star rating to a 0–100 baseline used when text is sparse. */
function ratingToScore(rating: number): number {
  return Math.round(((clamp(rating, 1, 5) - 1) / 4) * 90) + 5; // 1★→5 … 5★→95
}

/* ------------------------------ Main entry ------------------------------- */

export function analyzeFeedback(
  rawMessage: string,
  rating?: number,
  selectedPillars?: QualityKey[],
): FeedbackAnalysis {
  const message = (rawMessage || "").trim();
  const hasRating = typeof rating === "number" && rating >= 1 && rating <= 5;
  const ratingScore = hasRating ? ratingToScore(rating!) : null;
  const tagged = (selectedPillars ?? []).filter((p) => QUALITY_ORDER.includes(p));
  const taggedSet = new Set<QualityKey>(tagged);

  const segments = toSegments(message);

  let overall = 0;
  let totalSignals = 0;
  const aspectPol: Record<QualityKey, number> = { taste: 0, service: 0, value: 0, hygiene: 0 };
  const aspectSignals: Record<QualityKey, number> = { taste: 0, service: 0, value: 0, hygiene: 0 };
  const issues: string[] = [];
  const highlights: string[] = [];
  const keywords = new Set<string>();

  for (const seg of segments) {
    const toks = words(seg);
    const { polarity, signals } = scoreSegment(toks);
    const segAspects = aspectsIn(toks);

    overall += polarity;
    totalSignals += signals;

    for (const t of toks) {
      const s = SENTIMENT[t];
      if (s !== undefined && s !== 0) keywords.add(t);
    }

    for (const a of segAspects) {
      aspectPol[a] += polarity;
      aspectSignals[a] += signals;
    }

    if (signals > 0) {
      const phrase = humanize(seg);
      if (!phrase) continue;
      const tag = segAspects[0] ? `${QUALITY_LABELS[segAspects[0]]} — ` : "";
      if (polarity <= -0.8) issues.push(tag + phrase);
      else if (polarity >= 1) highlights.push(tag + phrase);
    }
  }

  // ---- Overall sentiment: blend text signal with the star rating. ----
  const textScore = totalSignals > 0 ? Math.tanh(overall / 4) : 0; // -1 … 1
  const ratingSent = hasRating ? (rating! - 3) / 2 : 0; // 1★→-1 … 5★→1
  let sentimentScore: number;
  if (totalSignals > 0 && hasRating) sentimentScore = textScore * 0.65 + ratingSent * 0.35;
  else if (totalSignals > 0) sentimentScore = textScore;
  else sentimentScore = ratingSent;
  sentimentScore = Number(clamp(sentimentScore, -1, 1).toFixed(3));

  const sentiment: Sentiment =
    sentimentScore > 0.15 ? "positive" : sentimentScore < -0.15 ? "negative" : "neutral";

  // ---- Per-pillar 0–100 scores. ----
  // A pillar counts as "mentioned" if the text discussed it OR the customer
  // explicitly tagged it. Text is the richer signal, so it wins; a tagged-only
  // pillar inherits the review's overall sentiment / star rating.
  const taggedScore = ratingScore ?? Math.round(clamp(50 + 50 * sentimentScore, 3, 100));
  const qualities: QualityScore[] = QUALITY_ORDER.map((key) => {
    const fromText = aspectSignals[key] > 0;
    const fromCustomer = taggedSet.has(key);
    const mentioned = fromText || fromCustomer;
    const score = fromText
      ? polarityToScore(aspectPol[key])
      : fromCustomer
        ? taggedScore
        : ratingScore ?? 50; // soft prior when neither discussed nor tagged
    return {
      key,
      label: QUALITY_LABELS[key],
      icon: QUALITY_ICONS[key],
      score,
      mentioned,
      polarity: Number(aspectPol[key].toFixed(2)),
    };
  });

  // Surface every weak pillar in "what went wrong" (and strong ones in "what
  // they loved") without duplicating a phrase already pulled from the prose —
  // so a low rating + a tagged pillar is never silently empty.
  for (const q of qualities) {
    if (!q.mentioned) continue;
    if (q.score < 45 && !issues.some((i) => i.startsWith(q.label))) {
      issues.push(`${q.label} could be better.`);
    } else if (q.score >= 65 && !highlights.some((h) => h.startsWith(q.label))) {
      highlights.push(`${q.label} — well rated.`);
    }
  }

  // ---- Confidence: more signals + a rating + explicit tags ⇒ more trustworthy. ----
  const confidence = Number(
    clamp(
      0.25 + Math.min(0.5, totalSignals * 0.12) + (hasRating ? 0.2 : 0) + (tagged.length ? 0.1 : 0),
      0,
      1,
    ).toFixed(2),
  );

  const summary = buildSummary(sentiment, qualities, hasRating ? rating! : null, message.length > 0);

  return {
    sentiment,
    sentimentScore,
    confidence,
    summary,
    qualities,
    issues: dedupe(issues).slice(0, 5),
    highlights: dedupe(highlights).slice(0, 5),
    keywords: [...keywords].slice(0, 8),
    tagged,
    model: MODEL_NAME,
  };
}

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function buildSummary(
  sentiment: Sentiment,
  qualities: QualityScore[],
  rating: number | null,
  hasText: boolean,
): string {
  const mentioned = qualities.filter((q) => q.mentioned);
  const star = rating ? ` (rated ${rating}★)` : "";

  // Whenever a pillar is in play — from prose or a customer tag — name it.
  if (mentioned.length > 0) {
    const best = [...mentioned].sort((a, b) => b.score - a.score)[0];
    const worst = [...mentioned].sort((a, b) => a.score - b.score)[0];

    if (sentiment === "positive") {
      const praise = best.score >= 60 ? ` — praised the ${QUALITY_SHORT[best.key]}` : "";
      const caveat = worst.score < 50 ? `, though ${QUALITY_SHORT[worst.key]} needs attention` : "";
      return `Largely positive${praise}${caveat}${star}.`;
    }
    if (sentiment === "negative") {
      return `Mostly negative — ${QUALITY_SHORT[worst.key]} is the main concern${star}.`;
    }
    const lead = worst.score < 50 ? `${QUALITY_SHORT[worst.key]} dragged it down` : "feedback is split";
    return `Mixed — ${lead}${star}.`;
  }

  // No pillar signal at all — distinguish a rating-only review from a vague one.
  if (!hasText && rating) {
    return sentiment === "positive"
      ? `Happy customer${star} — no written comment left.`
      : sentiment === "negative"
        ? `Unhappy customer${star} — no written comment to explain why.`
        : `Neutral rating${star} — no written comment left.`;
  }
  return sentiment === "positive"
    ? `Positive overall${star}, but no specific pillar was called out.`
    : sentiment === "negative"
      ? `Negative overall${star}, but no specific pillar was named.`
      : `Neutral / mixed${star} with no clear signal.`;
}

/* --------------------------- List-level rollups -------------------------- */

export type FeedbackAggregate = {
  count: number;
  avgRating: number;
  ratedCount: number;
  sentiment: Record<Sentiment, number>;
  positivePct: number;
  qualities: { key: QualityKey; label: string; icon: string; avg: number; count: number }[];
  topIssues: { text: string; count: number }[];
};

type AnalyzedRow = {
  rating?: number;
  sentiment?: string;
  analysis?: Pick<FeedbackAnalysis, "qualities" | "issues"> | null;
};

/**
 * Roll a batch of analysed reviews up into the numbers the admin dashboard
 * shows: average pillar scores (only over reviews that mentioned the pillar),
 * sentiment split, and the most frequently recurring issues.
 */
export function aggregateFeedback(rows: AnalyzedRow[]): FeedbackAggregate {
  const sentiment: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  const sums: Record<QualityKey, number> = { taste: 0, service: 0, value: 0, hygiene: 0 };
  const counts: Record<QualityKey, number> = { taste: 0, service: 0, value: 0, hygiene: 0 };
  const issueTally = new Map<string, number>();

  let ratingSum = 0;
  let ratedCount = 0;

  for (const r of rows) {
    if (r.sentiment === "positive" || r.sentiment === "neutral" || r.sentiment === "negative") {
      sentiment[r.sentiment]++;
    }
    if (typeof r.rating === "number" && r.rating >= 1) {
      ratingSum += r.rating;
      ratedCount++;
    }
    const qs = r.analysis?.qualities ?? [];
    for (const q of qs) {
      if (!q.mentioned) continue;
      sums[q.key] += q.score;
      counts[q.key]++;
    }
    for (const issue of r.analysis?.issues ?? []) {
      // Tally by the pillar tag (before the em dash) so wording variations group.
      const key = issue.includes(" — ") ? issue.split(" — ")[0] : issue;
      issueTally.set(key, (issueTally.get(key) ?? 0) + 1);
    }
  }

  const count = rows.length;
  const qualities = QUALITY_ORDER.map((key) => ({
    key,
    label: QUALITY_LABELS[key],
    icon: QUALITY_ICONS[key],
    avg: counts[key] ? Math.round(sums[key] / counts[key]) : 0,
    count: counts[key],
  }));

  const topIssues = [...issueTally.entries()]
    .map(([text, c]) => ({ text, count: c }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    count,
    avgRating: ratedCount ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
    ratedCount,
    sentiment,
    positivePct: count ? Math.round((sentiment.positive / count) * 100) : 0,
    qualities,
    topIssues,
  };
}

/** Shared colour ramp for 0–100 quality scores (kept here so UI stays in sync). */
export function scoreColor(score: number): string {
  if (score >= 75) return "#3ec77a"; // green
  if (score >= 55) return "#d4af37"; // gold
  if (score >= 40) return "#f0a830"; // amber
  return "#e23b3b"; // red
}
