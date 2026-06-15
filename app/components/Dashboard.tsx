"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BRAND } from "@/app/lib/content";
import type { SafeUser } from "@/app/lib/auth";
import { AdminHome } from "@/app/components/admin/AdminHome";
import { CustomerIntelligence } from "@/app/components/sections/CustomerIntelligence";
import { SalesForecasting } from "@/app/components/sections/SalesForecasting";
import { CompetitiveIntelligence } from "@/app/components/sections/CompetitiveIntelligence";
import { ExecutiveChallenge } from "@/app/components/sections/ExecutiveChallenge";
import { MenuManager } from "@/app/components/admin/MenuManager";
import { OrdersPanel } from "@/app/components/admin/OrdersPanel";
import { FeedbackPanel } from "@/app/components/admin/FeedbackPanel";
import { LocationSettings } from "@/app/components/admin/LocationSettings";

type Group = "home" | "ops" | "intel";
type Tab = {
  id: string;
  label: string;
  short: string;
  icon: string;
  group: Group;
  render: (nav: (id: string) => void, user: SafeUser) => React.ReactNode;
};

const TABS: Tab[] = [
  { id: "home", label: "Dashboard", short: "Home", icon: "🏠", group: "home", render: (nav, user) => <AdminHome user={user} onNavigate={nav} /> },
  { id: "menu", label: "Menu Manager", short: "Menu", icon: "🍛", group: "ops", render: () => <MenuManager /> },
  { id: "orders", label: "Orders", short: "Orders", icon: "🧾", group: "ops", render: () => <OrdersPanel /> },
  { id: "feedback", label: "Customer Feedback", short: "Feedback", icon: "💬", group: "ops", render: () => <FeedbackPanel /> },
  { id: "location", label: "Location & Contact", short: "Location", icon: "📍", group: "ops", render: () => <LocationSettings /> },
  { id: "part1", label: "Customer Intelligence", short: "Customers", icon: "👥", group: "intel", render: () => <CustomerIntelligence /> },
  { id: "part2", label: "Sales Forecasting", short: "Forecast", icon: "📊", group: "intel", render: () => <SalesForecasting /> },
  { id: "part3", label: "Competitive Intelligence", short: "Competitors", icon: "⚔️", group: "intel", render: () => <CompetitiveIntelligence /> },
  { id: "part5", label: "Executive War-Room", short: "War-room", icon: "🎯", group: "intel", render: () => <ExecutiveChallenge /> },
];

const GROUP_LABELS: Record<Group, string | null> = {
  home: null,
  ops: "Operations",
  intel: "AI Intelligence",
};

export function Dashboard({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [active, setActive] = useState("home");
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

  const groups: Group[] = ["home", "ops", "intel"];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="no-print sticky top-0 z-30 shrink-0 border-b border-border bg-bg-soft/90 backdrop-blur-xl lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-soft to-gold-deep text-lg font-black text-[#1a1505] shadow-[0_0_20px_-4px_rgba(212,175,55,0.6)]">
            S
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-gradient-gold">{BRAND.name}</p>
            <p className="text-[11px] text-text-dim">Admin Portal</p>
          </div>
        </div>

        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          {groups.map((grp) => (
            <div key={grp} className="contents lg:block">
              {GROUP_LABELS[grp] && (
                <p className="mt-3 hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-dim lg:block">
                  {GROUP_LABELS[grp]}
                </p>
              )}
              {TABS.filter((t) => t.group === grp).map((t) => (
                <NavButton key={t.id} t={t} active={active === t.id} onClick={() => go(t.id)} />
              ))}
            </div>
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
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold-deep text-xs font-black text-[#1a1505]">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-text">{user.name}</p>
                <p className="truncate text-[11px] text-text-dim">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 w-full rounded-lg border border-red/30 px-3 py-1.5 text-xs text-red transition hover:bg-red/10"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Topbar */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-border bg-bg/70 px-5 py-3 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-2">
            <span className="text-base">{current.icon}</span>
            <h2 className="text-sm font-semibold text-text">{current.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank" className="hidden text-xs text-text-muted hover:text-text sm:block">
              ↗ Customer site
            </Link>
            <button onClick={logout} className="rounded-lg border border-red/30 px-3 py-1.5 text-xs text-red transition hover:bg-red/10 lg:hidden">
              Log out
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          <div key={active} className="animate-fade-up">
            {current.render(go, user)}
          </div>

          <footer className="mt-16 border-t border-border pt-6 text-center text-xs text-text-dim">
            <p>{BRAND.name} — {BRAND.course}</p>
            <p className="mt-1">Admin Portal · Operations + AI Intelligence</p>
          </footer>
        </div>
      </main>
    </div>
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
