"use client";

import { useEffect, useState } from "react";
import type { PublicSettings } from "@/app/lib/types";
import { Card, SectionHeader } from "@/app/components/ui";

const empty: PublicSettings = {
  truck_label: "",
  address: "",
  truck_lat: "",
  truck_lng: "",
  maps_url: "",
  whatsapp_number: "",
  truck_status: "Open",
  hours: "",
};

export function LocationSettings() {
  const [s, setS] = useState<PublicSettings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setS({ ...empty, ...data.settings });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setSaving(false);
    setMsg(res.ok ? "✓ Saved. The customer site is updated." : "⚠️ Could not save.");
  }

  // Capture the admin's current GPS position (they stand at the truck and tap).
  // Fills lat/lng + map link, then best-effort reverse-geocodes the address.
  function useCurrentLocation() {
    setGeoMsg("");
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoMsg("⚠️ This browser doesn’t support location.");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGeoMsg("⚠️ Location needs an https connection (works on localhost in dev).");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const acc = Math.round(pos.coords.accuracy);
        setS((prev) => ({
          ...prev,
          truck_lat: lat,
          truck_lng: lng,
          // keep a custom share link if one exists; otherwise point to the coords
          maps_url: prev.maps_url || `https://www.google.com/maps?q=${lat},${lng}`,
        }));

        // Best-effort street address (only fills the field if it's empty so we
        // never clobber a curated address). Coordinates are the source of truth.
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          );
          if (r.ok) {
            const d = await r.json();
            const where: string = d?.display_name ?? "";
            if (where) setS((prev) => ({ ...prev, address: prev.address || where }));
          }
        } catch {
          /* ignore — the coordinates alone are enough */
        }

        setLocating(false);
        setGeoMsg(`✓ Pinned to your location (±${acc} m). Check the preview, then Save to go live.`);
      },
      (err) => {
        setLocating(false);
        const m =
          err.code === err.PERMISSION_DENIED
            ? "Permission denied — allow location access in your browser, then try again."
            : err.code === err.POSITION_UNAVAILABLE
              ? "Location unavailable. Try again outdoors or check that GPS is on."
              : "Timed out getting your location. Please try again.";
        setGeoMsg(`⚠️ ${m}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  const field =
    "w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm text-text outline-none placeholder:text-text-dim focus:border-gold/50";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-dim";

  const embed =
    s.truck_lat && s.truck_lng
      ? `https://www.google.com/maps?q=${encodeURIComponent(`${s.truck_lat},${s.truck_lng}`)}&z=16&output=embed`
      : "";

  if (loading) return <p className="text-sm text-text-muted">Loading settings…</p>;

  return (
    <div className="space-y-8">
      <SectionHeader
        part="Operations"
        title="Location & Contact"
        subtitle="Update where the truck is parked, opening hours, status and the WhatsApp number customers use to order. Changes go live on the customer site immediately."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div>
            <label className={label}>Truck label</label>
            <input className={field} value={s.truck_label} onChange={(e) => setS({ ...s, truck_label: e.target.value })} />
          </div>
          <div>
            <label className={label}>Address / area</label>
            <input className={field} value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} />
          </div>
          <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-3">
            <button
              type="button"
              onClick={useCurrentLocation}
              disabled={locating}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-gold-soft transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {locating ? "📡 Locating…" : "📍 Use my current location"}
            </button>
            <p className="mt-2 text-[11px] text-text-dim">
              Stand at the truck and tap to capture exact GPS coordinates — or enter them manually below.
            </p>
            {geoMsg && <p className="mt-1.5 text-xs text-text-muted">{geoMsg}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Latitude</label>
              <input className={field} value={s.truck_lat} onChange={(e) => setS({ ...s, truck_lat: e.target.value })} placeholder="31.4486" />
            </div>
            <div>
              <label className={label}>Longitude</label>
              <input className={field} value={s.truck_lng} onChange={(e) => setS({ ...s, truck_lng: e.target.value })} placeholder="74.2701" />
            </div>
          </div>
          <div>
            <label className={label}>Google Maps share link</label>
            <input className={field} value={s.maps_url} onChange={(e) => setS({ ...s, maps_url: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
          </div>
          <div>
            <label className={label}>
              WhatsApp number <span className="text-text-dim">(with country code, e.g. 923001234567)</span>
            </label>
            <input className={field} value={s.whatsapp_number} onChange={(e) => setS({ ...s, whatsapp_number: e.target.value })} placeholder="923001234567" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Status</label>
              <select className={field} value={s.truck_status} onChange={(e) => setS({ ...s, truck_status: e.target.value })}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className={label}>Hours</label>
              <input className={field} value={s.hours} onChange={(e) => setS({ ...s, hours: e.target.value })} />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-gold-soft to-gold-deep px-5 py-2.5 text-sm font-semibold text-[#1a1505] transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {msg && <span className="text-sm text-text-muted">{msg}</span>}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-text">Live map preview</h3>
            <p className="text-xs text-text-dim">This is exactly what customers see.</p>
          </div>
          {embed ? (
            <iframe
              title="Map preview"
              src={embed}
              className="h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-[360px] items-center justify-center text-sm text-text-dim">
              Enter latitude &amp; longitude to preview the map.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
