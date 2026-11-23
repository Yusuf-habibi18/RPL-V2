"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { Logo } from "@/components/layout/Logo";
import { aktifPada, menuUntuk } from "@/components/layout/nav";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/cn";
import { inisial } from "@/lib/format";
import { LABEL_PERAN } from "@/types";
import type { PenggunaShell } from "@/components/layout/DashboardShell";

/** Dekorasi sidebar: grid tipis + cahaya emerald lembut di latar hijau gelap. */
function PolaSidebar() {
  // id unik: sidebar desktop (tersembunyi di ponsel) dan laci menu ponsel bisa tampil bersamaan.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={`sb-grid-${id}`} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0V24" fill="none" stroke="#A3E635" strokeOpacity="0.06" />
        </pattern>
        <radialGradient id={`sb-glow-${id}`} cx="0.2" cy="0" r="0.9">
          <stop offset="0" stopColor="#20B66A" stopOpacity="0.3" />
          <stop offset="1" stopColor="#20B66A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#sb-grid-${id})`} />
      <rect width="100%" height="45%" fill={`url(#sb-glow-${id})`} className="anim-glow" />
    </svg>
  );
}

/** Isi sidebar (hijau gelap), dipakai di desktop dan di laci (drawer) ponsel. */
export function SidebarContent({ user, onNavigate }: { user: PenggunaShell; onNavigate?: () => void }) {
  const pathname = usePathname();
  const menu = menuUntuk(user.peran);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-sidebar text-white">
      <PolaSidebar />
      <div className="relative px-5 pb-6 pt-5">
        <Link href="/dashboard" onClick={onNavigate} aria-label="Agri-Analytics, ke dashboard">
          <Logo terang />
        </Link>
      </div>

      <p className="relative px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">Menu utama</p>
      <nav aria-label="Navigasi utama" className="relative flex-1 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menu.map(({ href, label, ikon: Ikon }) => {
            const on = aktifPada(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    on ? "bg-white/[0.12] text-white ring-1 ring-inset ring-white/10" : "text-white/70 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-lime shadow-[0_0_10px_#A3E635]" />}
                  <Ikon className={cn("size-[18px]", on ? "text-lime" : "text-white/55 group-hover:text-white")} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative m-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald to-lime text-sm font-bold text-sidebar">
            {inisial(user.nama)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user.nama}</p>
            <p className="truncate text-xs text-white/55">{user.konteks ?? LABEL_PERAN[user.peran]}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="grid size-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Keluar"
              title="Keluar"
            >
              <LogOut className="size-[18px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ user }: { user: PenggunaShell }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 shadow-[4px_0_24px_-12px_rgb(18_59_40/0.35)] lg:block">
      <SidebarContent user={user} />
    </aside>
  );
}
