"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = mode === "login" ? { email, password } : { name, email, password };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-border bg-bg/60 px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-soft to-gold-deep text-2xl font-black text-[#1a1505]">
            S
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gradient-gold">Safar-e-Zaiqa</h1>
          <p className="text-sm text-text-dim">Admin Dashboard Access</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface/70 p-6 backdrop-blur">
          <div className="mb-5 flex rounded-lg border border-border bg-bg/40 p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`flex-1 rounded-md py-2 text-sm font-medium capitalize transition ${
                  mode === m ? "bg-gold/15 text-gold-soft" : "text-text-muted hover:text-text"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <input
                className={field}
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input
              className={field}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className={field}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-lg border border-red/40 bg-red/10 px-3 py-2 text-sm text-red">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-3 text-sm font-semibold text-[#1a1505] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-text-dim">
          <Link href="/" className="hover:text-gold-soft">
            ← Back to customer site
          </Link>
        </p>
      </div>
    </div>
  );
}
