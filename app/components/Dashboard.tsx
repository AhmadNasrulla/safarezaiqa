"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRAND } from "@/app/lib/content";
import type { SafeUser } from "@/app/lib/auth";
import { Overview } from "@/app/components/sections/Overview";
import { CustomerIntelligence } from "@/app/components/sections/CustomerIntelligence";
import { SalesForecasting } from "@/app/components/sections/SalesForecasting";
import { CompetitiveIntelligence } from "@/app/components/sections/CompetitiveIntelligence";
import { MarketingAutomation } from "@/app/components/sections/MarketingAutomation";
import { ExecutiveChallenge } from "@/app/components/sections/ExecutiveChallenge";
import { Assumptions } from "@/app/components/sections/Assumptions";
import { MenuManager } from "@/app/components/admin/MenuManager";
import { OrdersPanel } from "@/app/components/admin/OrdersPanel";
import { LocationSettings } from "@/app/components/admin/LocationSettings";

type Tab = {
  id: string;
  label: string;
  short: string;
  icon: string;
  group: "ops" | "intel";
  render: () => React.ReactNode;
};

const TABS: Tab[] = [
  // Operations
  { id: "menu", label: "Menu Manager", short: "Menu", icon: "🍛", group: "ops", render: () => <MenuManager /> },
  { id: "orders", label: "Orders", short: "Orders", icon: "🧾", group: "ops", render: () => <OrdersPanel /> },
  { id: "location", label: "Location & Contact", short: "Location", icon: "📍", group: "ops", render: () => <LocationSettings /> },
  // Marketing intelligence (Assignment 2)
  { id: "overview", label: "Overview", short: "Home", icon: "◈", group: "intel", render: () => <Overview /> },
  { id: "part1", label: "1 · Customer Intelligence", short: "Customers", icon: "👥", group: "intel", render: () => <CustomerIntelligence /> },
  { id: "part2", label: "2 · Sales Forecasting", short: "Forecast", icon: "📊", group: "intel", render: () => <SalesForecasting /> },
  { id: "part3", label: "3 · Competitive Intelligence", short: "Competitors", icon: "⚔️", group: "intel", render: () => <CompetitiveIntelligence /> },
  { id: "part4", label: "4 · Marketing Automation", short: "Automation", icon: "🤖", group: "intel", render: () => <MarketingAutomation /> },
  { id: "part5", label: "5 · Executive Challenge", short: "Crisis", icon: "🎯", group: "intel", render: () => <ExecutiveChallenge /> },
  { id: "assumptions", label: "Assumptions", short: "Assumptions", icon: "📋", group: "intel", render: () => <Assumptions /> },
];

export function Dashboard({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [active, setActive] = useState("menu");
  const current = TABS.find((t) => t.id === active) ?? TABS[0];

  function go(id: string) {
    setActive(id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const ops = TABS.filter((t) => t.group === "ops");
  const intel = TABS.filter((t) => t.group === "intel");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="no-print sticky top-0 z-30 shrink-0 border-b border-border bg-bg-soft/90 backdrop-blur lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft to-gold-deep text-lg font-black text-[#1a1505]">
            S
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-gradient-gold">{BRAND.name}</p>
            <p className="text-[11px] text-text-dim">Admin Dashboard</p>
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          <NavGroup label="Operations" />
          {ops.map((t) => (
            <NavButton key={t.id} t={t} active={active === t.id} onClick={() => go(t.id)} />
          ))}
          <NavGroup label="Marketing Intelligence" />
          {intel.map((t) => (
            <NavButton key={t.id} t={t} active={active === t.id} onClick={() => go(t.id)} />
          ))}
        </nav>

        <div className="hidden px-5 py-4 lg:block">
          <Link
            href="/"
            target="_blank"
            className="block rounded-lg border border-border bg-surface px-3 py-2 text-center text-xs font-medium text-text-muted transition hover:border-gold/40 hover:text-text"
          >
            ↗ View customer site
          </Link>
          <div className="mt-4 rounded-xl border border-border bg-surface/60 p-3">
            <p className="text-xs font-medium text-text">{user.name}</p>
            <p className="truncate text-[11px] text-text-dim">{user.email}</p>
            <button
              onClick={logout}
              className="mt-2 w-full rounded-lg border border-red/30 px-3 py-1.5 text-xs text-red transition hover:bg-red/10"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile top bar with logout */}
        <div className="no-print flex items-center justify-between px-5 py-3 lg:hidden">
          <Link href="/" target="_blank" className="text-xs text-text-muted">
            ↗ Customer site
          </Link>
          <button onClick={logout} className="rounded-lg border border-red/30 px-3 py-1 text-xs text-red">
            Log out
          </button>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
          <div key={active} className="animate-fade-up">
            {current.render()}
          </div>

          <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-text-dim">
            <p>
              {BRAND.name} — {BRAND.course}
            </p>
            <p className="mt-1">Admin Dashboard · Operations + AI Marketing Intelligence</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

function NavGroup({ label }: { label: string }) {
  return (
    <p className="mt-3 hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-dim lg:block">
      {label}
    </p>
  );
}

function NavButton({ t, active, onClick }: { t: Tab; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm font-medium transition lg:w-full ${
        active ? "bg-gold/15 text-gold-soft" : "text-text-muted hover:bg-surface hover:text-text"
      }`}
    >
      <span className="text-base">{t.icon}</span>
      <span className="hidden lg:inline">{t.label}</span>
      <span className="lg:hidden">{t.short}</span>
      {active && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-gold lg:block" />}
    </button>
  );
}
