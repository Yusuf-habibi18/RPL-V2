"use client";

import { ChevronDown, Phone, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/misc";
import { BadgeKondisi, BadgeSensor } from "@/components/ui/status";
import { cn } from "@/lib/cn";
import { formatAngka, inisial, judulKata } from "@/lib/format";
import type { StatusKondisi, StatusSensor } from "@/types";

export interface AnggotaTampil {
  id: string;
  nama: string;
  email: string;
  noHp: string | null;
  aktif: boolean;
  luasHa: number;
  statusTerburuk: StatusKondisi;
  aktivitasTerakhir: string | null;
  lahan: {
    id: string;
    nama: string;
    luasHa: number;
    status: StatusKondisi;
    kelembapan: number | null;
    ph: number | null;
    suhu: number | null;
    fase: string | null;
    hst: number | null;
    estimasiLabel: string | null;
    sensor: { kode: string; status: StatusSensor }[];
  }[];
}

/** Daftar anggota (FR-20) dengan pencarian, filter kondisi, dan detail lahan yang bisa dibuka. */
export function DaftarAnggota({ anggota }: { anggota: AnggotaTampil[] }) {
  const [cari, setCari] = useState("");
  const [filter, setFilter] = useState<"SEMUA" | "PERHATIAN">("SEMUA");
  const [buka, setBuka] = useState<string | null>(null);

  const tampil = useMemo(
    () =>
      anggota.filter(
        (a) =>
          a.nama.toLowerCase().includes(cari.trim().toLowerCase()) &&
          (filter === "SEMUA" || a.statusTerburuk === "WASPADA" || a.statusTerburuk === "KRITIS"),
      ),
    [anggota, cari, filter],
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama anggota" className="pl-9" aria-label="Cari anggota" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="sm:w-52" aria-label="Filter kondisi">
          <option value="SEMUA">Semua anggota</option>
          <option value="PERHATIAN">Lahan perlu perhatian</option>
        </Select>
      </div>

      {tampil.length === 0 ? (
        <EmptyState icon={Search} title="Tidak ada anggota yang cocok" />
      ) : (
        <ul className="space-y-2.5">
          {tampil.map((a) => {
            const terbuka = buka === a.id;
            return (
              <li key={a.id} className="overflow-hidden rounded-xl border border-line bg-bg/35">
                <button
                  onClick={() => setBuka(terbuka ? null : a.id)}
                  aria-expanded={terbuka}
                  className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-soft/60"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/70 to-emerald/70 text-sm font-bold">
                    {inisial(a.nama)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a.nama}</span>
                      {!a.aktif && <Badge tone="neutral">Akun nonaktif</Badge>}
                    </span>
                    <span className="block text-xs text-muted">
                      {a.lahan.length} lahan · {formatAngka(a.luasHa, 2)} ha · aktivitas {a.aktivitasTerakhir ?? "belum ada"}
                    </span>
                  </span>
                  <BadgeKondisi status={a.statusTerburuk} />
                  <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform", terbuka && "rotate-180")} aria-hidden />
                </button>
                {terbuka && (
                  <div className="anim-in border-t border-line p-3.5">
                    <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                      <span>{a.email}</span>
                      {a.noHp && (
                        <a href={`tel:${a.noHp}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Phone className="size-3.5" aria-hidden /> {a.noHp}
                        </a>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {a.lahan.map((l) => (
                        <Link
                          key={l.id}
                          href={`/monitoring?lahan=${l.id}`}
                          className="block rounded-xl border border-line bg-card/60 p-3.5 transition-colors hover:border-primary/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold">{l.nama}</p>
                            <BadgeKondisi status={l.status} />
                          </div>
                          <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                            {[
                              ["Kelembapan", l.kelembapan != null ? `${formatAngka(l.kelembapan)}%` : "–"],
                              ["pH", l.ph != null ? formatAngka(l.ph, 2) : "–"],
                              ["Suhu", l.suhu != null ? `${formatAngka(l.suhu)}°` : "–"],
                            ].map(([k, v]) => (
                              <div key={k} className="rounded-lg bg-bg/50 py-2">
                                <dd className="text-sm font-bold num">{v}</dd>
                                <dt className="text-muted">{k}</dt>
                              </div>
                            ))}
                          </dl>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                            <span>
                              {l.fase ? `${judulKata(l.fase)} · HST ${l.hst}` : "Tidak ada tanaman"}
                              {l.estimasiLabel && ` · panen ±${l.estimasiLabel}`}
                            </span>
                            {l.sensor[0] && <BadgeSensor status={l.sensor[0].status} />}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
