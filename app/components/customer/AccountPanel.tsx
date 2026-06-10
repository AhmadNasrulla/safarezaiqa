"use client";

import { useState } from "react";
import type { CustomerUser } from "@/app/lib/types";

const field =
  "w-full rounded-lg border border-border bg-bg/60 px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50";

/**
 * Login / Register / Profile modal for customers. Ordering is gated on having
 * an account with a saved phone number and address.
 */
export function AccountPanel({
  me,
  onClose,
  onAuthed,
  onLogout,
}: {
  me: CustomerUser | null;
  onClose: () => void;
  onAuthed: (u: CustomerUser) => void;
  onLogout: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="animate-fade-up relative w-full max-w-md rounded-2xl border border-border bg-bg-soft p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg px-2 py-1 text-text-muted hover:text-text"
        >
          ✕
        </button>
        {me ? (
          <Profile me={me} onAuthed={onAuthed} onLogout={onLogout} />
        ) : (
          <AuthForms onAuthed={onAuthed} />
        )}
      </div>
    </div>
  );
}

function AuthForms({ onAuthed }: { onAuthed: (u: CustomerUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const url = mode === "login" ? "/api/auth/login" : "/api/account/register";
    const payload =
      mode === "login" ? { email, password } : { name, email, password, phone, address };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong.");
      } else {
        onAuthed(data.user);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-text">
        {mode === "login" ? "Welcome back 👋" : "Create your account"}
      </h3>
      <p className="mt-1 text-sm text-text-muted">
        {mode === "login"
          ? "Log in to place your order."
          : "We need your phone & address to prepare and hand over your order."}
      </p>

      <div className="mt-4 mb-4 flex rounded-lg border border-border bg-bg/40 p-1">
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
          <input className={field} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        )}
        <input className={field} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className={field} type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {mode === "register" && (
          <>
            <input className={field} placeholder="Phone number (e.g. 03001234567)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <textarea
              className={`${field} resize-none`}
              rows={2}
              placeholder="Delivery / pickup address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </>
        )}

        {error && (
          <div className="rounded-lg border border-red/40 bg-red/10 px-3 py-2 text-sm text-red">⚠️ {error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-3 text-sm font-semibold text-[#1a1505] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account & continue"}
        </button>
      </form>
    </div>
  );
}

function Profile({
  me,
  onAuthed,
  onLogout,
}: {
  me: CustomerUser;
  onAuthed: (u: CustomerUser) => void;
  onLogout: () => void;
}) {
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [address, setAddress] = useState(me.address);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const incomplete = !me.phone || !me.address;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error ?? "Could not save.");
      } else {
        onAuthed(data.user);
        setMsg("✓ Saved.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    onLogout();
  }

  return (
    <div>
      <h3 className="text-lg font-bold text-text">Your account</h3>
      <p className="mt-1 text-sm text-text-muted">{me.email}</p>

      {incomplete && (
        <div className="mt-3 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-sm text-amber">
          Add your phone number and address to start ordering.
        </div>
      )}

      <form onSubmit={save} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-dim">Name</label>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-dim">Phone</label>
          <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03001234567" required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-dim">Address</label>
          <textarea className={`${field} resize-none`} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>

        {msg && <p className="text-sm text-text-muted">{msg}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-semibold text-[#1a1505] transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-red/30 px-4 py-2.5 text-sm text-red transition hover:bg-red/10"
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  );
}
