"use client";

import { CircleCheck, OctagonAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ItemToast {
  id: number;
  ok: boolean;
  pesan: string;
}

const Konteks = createContext<(hasil: { ok: boolean; pesan: string }) => void>(() => {});

/** Umpan balik singkat setelah aksi (berhasil / gagal). */
export function useToast() {
  return useContext(Konteks);
}

let urutan = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [daftar, setDaftar] = useState<ItemToast[]>([]);

  const tutup = useCallback((id: number) => setDaftar((d) => d.filter((t) => t.id !== id)), []);
  const tampil = useCallback(
    ({ ok, pesan }: { ok: boolean; pesan: string }) => {
      const id = ++urutan;
      setDaftar((d) => [...d.slice(-2), { id, ok, pesan }]);
      setTimeout(() => tutup(id), ok ? 4000 : 7000);
    },
    [tutup],
  );

  return (
    <Konteks.Provider value={tampil}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-24 z-[60] flex flex-col items-end gap-2 lg:bottom-6 lg:left-auto lg:right-6">
        {daftar.map((t) => (
          <div
            key={t.id}
            role={t.ok ? "status" : "alert"}
            className={cn(
              "panel anim-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl !bg-card p-3.5 shadow-lg text-sm",
              t.ok ? "border-success/40" : "border-danger/40",
            )}
          >
            {t.ok ? (
              <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
            ) : (
              <OctagonAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
            )}
            <p className="flex-1 text-fg">{t.pesan}</p>
            <button onClick={() => tutup(t.id)} className="text-muted hover:text-fg" aria-label="Tutup notifikasi">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Konteks.Provider>
  );
}
