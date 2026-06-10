"use client";

import { useState } from "react";

/**
 * Reusable AI panel. Posts a `part` key (+ optional analyst focus) to the
 * secure /api/generate route and renders the markdown response. The API key
 * stays on the server; this component never sees it.
 */
export function AIGenerator({
  part,
  title = "Generate live analysis with AI",
  placeholder = "Optional: add a focus, e.g. 'emphasise eco-friendly angle'…",
  cta = "Generate with AI",
}: {
  part: string;
  title?: string;
  placeholder?: string;
  cta?: string;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part, input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
      } else {
        setOutput(data.text);
        setModel(data.model ?? "");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="no-print rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.06] to-transparent p-5">
      <div className="flex items-center gap-2">
        <SparkleIcon />
        <h4 className="text-sm font-semibold text-gold-soft">{title}</h4>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && run()}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-bg/60 px-3 py-2 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50"
        />
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-4 py-2 text-sm font-semibold text-[#1a1505] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Spinner /> Generating…
            </>
          ) : (
            <>
              <SparkleIcon dark /> {cta}
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="mt-4 space-y-2">
          {[90, 75, 82, 60].map((w, i) => (
            <div
              key={i}
              className="shimmer h-3 rounded bg-surface-2"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="animate-fade-up mt-4 rounded-lg border border-red/40 bg-red/10 px-4 py-3 text-sm text-red">
          ⚠️ {error}
        </div>
      )}

      {output && (
        <div className="animate-fade-up mt-4 rounded-xl border border-border bg-bg/50 p-4">
          <Markdown text={output} />
          {model && (
            <p className="mt-3 border-t border-border pt-2 text-right text-[11px] text-text-dim">
              ✦ Generated live by Google {model}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- tiny markdown renderer (no dependency) ---------- */

function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactBlock[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "ul", items: [...list] });
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (/^###\s+/.test(line)) {
      flushList();
      blocks.push({ type: "h3", text: line.replace(/^###\s+/, "") });
    } else if (/^##\s+/.test(line)) {
      flushList();
      blocks.push({ type: "h2", text: line.replace(/^##\s+/, "") });
    } else if (/^#\s+/.test(line)) {
      flushList();
      blocks.push({ type: "h2", text: line.replace(/^#\s+/, "") });
    } else if (line.trim() === "---") {
      flushList();
      blocks.push({ type: "hr" });
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push({ type: "p", text: line });
    }
  }
  flushList();

  return (
    <div className="ai-prose">
      {blocks.map((b, i) => {
        if (b.type === "h2") return <h2 key={i} dangerouslySetInnerHTML={inline(b.text)} />;
        if (b.type === "h3") return <h3 key={i} dangerouslySetInnerHTML={inline(b.text)} />;
        if (b.type === "hr") return <hr key={i} />;
        if (b.type === "ul")
          return (
            <ul key={i}>
              {b.items.map((it, j) => (
                <li key={j} dangerouslySetInnerHTML={inline(it)} />
              ))}
            </ul>
          );
        return <p key={i} dangerouslySetInnerHTML={inline(b.text)} />;
      })}
    </div>
  );
}

type ReactBlock =
  | { type: "h2" | "h3" | "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "hr" };

/** Convert **bold** and `code`, escaping HTML first. */
function inline(text: string): { __html: string } {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+?)`/g, '<code class="text-gold-soft">$1</code>');
  return { __html: html };
}

/* ---------- icons ---------- */

function SparkleIcon({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={dark ? "text-[#1a1505]" : "text-gold"}
    >
      <path
        d="M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5L12 2z"
        fill="currentColor"
      />
      <path d="M19 14l.9 2.6L22 17l-2.1.4L19 20l-.9-2.6L16 17l2.1-.4L19 14z" fill="currentColor" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
