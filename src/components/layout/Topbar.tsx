"use client";

import { Bell, ChevronDown, ChevronRight, Droplets, FlaskConical, LogOut, Menu, Thermometer, UserRound, WifiOff } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PenggunaShell, PeringatanShell } from "@/components/layout/DashboardShell";
import { judulHalaman } from "@/components/layout/nav";
import { Dropdown } from "@/components/ui/Dropdown";
import { logout } from "@/lib/actions/auth";
import { bolehAkses } from "@/lib/akses";
import { cn } from "@/lib/cn";
import { inisial } from "@/lib/format";
import { LABEL_PERAN } from "@/types";

const IKON_PARAM = { KELEMBAPAN_TANAH: Droplets, PH: FlaskConical, SUHU: Thermometer, SENSOR_OFFLINE: WifiOff } as const;

export function Topbar({
  user,
  peringatan,
  jumlahPeringatan,
  tanggal,
  onMenu,
}: {
  user: PenggunaShell;
  peringatan: PeringatanShell[];
  jumlahPeringatan: number;
  tanggal: string;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const judul = judulHalaman(pathname);
  const keMonitoring = bolehAkses(user.peran, "/monitoring");

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="grid size-10 place-items-center rounded-xl text-muted hover:bg-soft hover:text-fg lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-muted sm:block">Agri-Analytics</li>
            <li className="hidden text-muted/50 sm:block" aria-hidden>
              <ChevronRight className="size-4" />
            </li>
            <li className="truncate font-semibold text-fg" aria-current="page">
              {judul}
            </li>
          </ol>
        </nav>

        <span className="hidden items-center gap-2 rounded-full border border-line bg-card/60 px-3 py-1.5 text-xs text-muted xl:inline-flex">
          <span className="anim-pulse inline-block size-1.5 rounded-full bg-success text-success" aria-hidden />
          {tanggal}
        </span>

        {/* Notifikasi peringatan */}
        <Dropdown
          className="w-[min(92vw,380px)]"
          trigger={({ toggle, open }) => (
            <button
              onClick={toggle}
              aria-expanded={open}
              aria-label={`Peringatan aktif: ${jumlahPeringatan}`}
              className={cn(
                "relative grid size-10 place-items-center rounded-xl text-muted transition-colors hover:bg-soft hover:text-fg",
                open && "bg-soft text-fg",
              )}
            >
              <Bell className="size-5" />
              {jumlahPeringatan > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-bg num">
                  {jumlahPeringatan > 9 ? "9+" : jumlahPeringatan}
                </span>
              )}
            </button>
          )}
        >
          {(close) => (
            <div>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="font-semibold">Peringatan aktif</p>
                <span className="text-xs text-muted num">{jumlahPeringatan} peringatan</span>
              </div>
              {peringatan.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">Tidak ada peringatan aktif. Semua lahan aman.</p>
              ) : (
                <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                  {peringatan.map((p) => {
                    const Ikon = IKON_PARAM[p.parameter as keyof typeof IKON_PARAM] ?? Bell;
                    return (
                      <li key={p.id}>
                        <Link
                          href={keMonitoring ? `/monitoring?lahan=${p.lahanId}` : "/dashboard"}
                          onClick={close}
                          className="flex gap-3 px-4 py-3 transition-colors hover:bg-soft/60"
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                              p.tingkat === "BAHAYA" ? "bg-danger/15 text-danger" : "bg-warning/15 text-warning",
                            )}
                          >
                            <Ikon className="size-4" aria-hidden />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm leading-snug">{p.pesan}</span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {p.lahan} · {p.waktuLabel}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </Dropdown>

        {/* Profil */}
        <Dropdown
          className="w-64"
          trigger={({ toggle, open }) => (
            <button
              onClick={toggle}
              aria-expanded={open}
              aria-label="Menu profil"
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-soft"
            >
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-emerald text-xs font-bold text-white">
                {inisial(user.nama)}
              </span>
              <span className="hidden text-left leading-tight md:block">
                <span className="block max-w-36 truncate text-sm font-semibold">{user.nama}</span>
                <span className="block text-xs text-muted">{LABEL_PERAN[user.peran]}</span>
              </span>
              <ChevronDown className={cn("hidden size-4 text-muted transition-transform md:block", open && "rotate-180")} />
            </button>
          )}
        >
          {() => (
            <div className="p-2">
              <div className="flex items-center gap-3 px-2 py-2">
                <UserRound className="size-5 text-primary" aria-hidden />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{user.nama}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
              </div>
              <div className="mx-2 my-1 rounded-lg bg-bg/50 px-3 py-2 text-xs text-muted">
                <p>
                  Peran: <span className="text-fg">{LABEL_PERAN[user.peran]}</span>
                </p>
                {user.konteks && <p className="mt-0.5 truncate">{user.konteks}</p>}
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="mt-1 flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                >
                  <LogOut className="size-4" />
                  Keluar
                </button>
              </form>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}
