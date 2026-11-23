"use client";

import { LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { PenggunaShell } from "@/components/layout/DashboardShell";
import { aktifPada, menuUntuk } from "@/components/layout/nav";
import { SidebarContent } from "@/components/layout/Sidebar";
import { cn } from "@/lib/cn";

/** Navigasi bawah (maks. 4 menu utama + "Menu") dan laci menu lengkap untuk ponsel/tablet. */
export function MobileNavigation({
  user,
  drawerOpen,
  setDrawerOpen,
}: {
  user: PenggunaShell;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const menu = menuUntuk(user.peran);
  const utama = menu.slice(0, 4);

  useEffect(() => {
    if (!drawerOpen) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <>
      <nav
        aria-label="Navigasi cepat"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-16px_rgb(18_59_40/0.3)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {utama.map(({ href, ringkas, ikon: Ikon }) => {
            const on = aktifPada(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold", on ? "text-primary" : "text-muted")}
                >
                  <span className={cn("grid h-7 w-12 place-items-center rounded-full transition-colors", on && "bg-soft")}>
                    <Ikon className="size-5" aria-hidden />
                  </span>
                  {ringkas}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold text-muted"
              aria-label="Buka semua menu"
            >
              <span className="grid h-7 w-12 place-items-center rounded-full">
                <LayoutGrid className="size-5" aria-hidden />
              </span>
              Menu
            </button>
          </li>
        </ul>
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="anim-in absolute inset-0 bg-[#0c2418]/45 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Menu" className="anim-in absolute inset-y-0 left-0 w-[min(84vw,300px)] border-r border-line bg-sidebar">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-5 z-10 grid size-9 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Tutup menu"
            >
              <X className="size-5" />
            </button>
            <SidebarContent user={user} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
