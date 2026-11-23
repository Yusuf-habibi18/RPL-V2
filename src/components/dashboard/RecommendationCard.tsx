"use client";

import { CalendarClock, Check, Droplets, Eye, FlaskConical, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Field";
import { Stat } from "@/components/ui/misc";
import { BadgePrioritas, BadgeRekomendasi } from "@/components/ui/status";
import { useToast } from "@/components/ui/Toast";
import { WaterNeed } from "@/components/viz/WaterNeed";
import { abaikanRekomendasi, konfirmasiRekomendasi } from "@/lib/actions/rekomendasi";
import { cn } from "@/lib/cn";
import { judulKata } from "@/lib/format";
import type { ItemRekomendasi } from "@/lib/data/rekomendasi";

/**
 * Kartu rekomendasi siram/pupuk. Tombol aksi memanggil server action yang memvalidasi
 * kepemilikan lahan dan mencatat KegiatanBudidaya (FR-05, T-07).
 */
export function RecommendationCard({ rek, bisaAksi, ringkas = false }: { rek: ItemRekomendasi; bisaAksi: boolean; ringkas?: boolean }) {
  const [dialog, setDialog] = useState<"konfirmasi" | "abaikan" | "detail" | null>(null);
  const [catatan, setCatatan] = useState("");
  const [pending, mulai] = useTransition();
  const toast = useToast();
  const siram = rek.jenis === "SIRAM";
  const Ikon = siram ? Droplets : FlaskConical;
  const menunggu = rek.status === "MENUNGGU";

  const jalankan = (aksi: () => Promise<{ ok: boolean; pesan: string }>) =>
    mulai(async () => {
      const hasil = await aksi();
      toast(hasil);
      if (hasil.ok) setDialog(null);
    });

  return (
    <article
      className={cn(
        "panel relative overflow-hidden rounded-2xl p-4 transition-colors",
        menunggu && rek.prioritas === "TINGGI" && "border-danger/35",
        !menunggu && "opacity-90",
      )}
    >
      {menunggu && (
        <span
          className={cn(
            "absolute inset-x-0 top-0 h-0.5",
            siram ? "bg-gradient-to-r from-data via-data/40 to-transparent" : "bg-gradient-to-r from-primary via-lime/70 to-transparent",
          )}
          aria-hidden
        />
      )}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
            siram ? "bg-data/10 text-data ring-data/25" : "bg-soft text-primary ring-primary/25",
          )}
        >
          <Ikon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {siram ? "Penyiraman" : "Pemupukan"} · {rek.lahan}
          </p>
          <h3 className="mt-0.5 text-base font-bold leading-snug sm:text-lg">{rek.tindakan}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <BadgeRekomendasi status={rek.status} />
            {menunggu && <BadgePrioritas prioritas={rek.prioritas} />}
          </div>
        </div>
      </div>

      {!ringkas && <p className="mt-3 text-sm text-muted">{rek.alasan}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-4 text-muted" aria-hidden />
          <span className={cn("font-semibold", rek.jadwalLabel === "Sekarang" && menunggu && "text-primary")}>{rek.jadwalLabel}</span>
        </span>
        {rek.dosis && <span className="text-muted">Dosis: <span className="text-fg">{rek.dosis}</span></span>}
        {rek.kegiatanLabel && <span className="text-success">{rek.kegiatanLabel}</span>}
      </div>

      {!ringkas && siram && rek.bacaan && rek.ambangKelembapan && menunggu && (
        <div className="mt-3 rounded-xl border border-line bg-bg/40 p-3">
          <WaterNeed kelembapan={rek.bacaan.kelembapanTanah} min={rek.ambangKelembapan.min} maks={rek.ambangKelembapan.maks} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {menunggu && bisaAksi && (
          <>
            <Button size="md" variant="primary" onClick={() => setDialog("konfirmasi")} className="flex-1 sm:flex-none">
              <Check /> Sudah saya kerjakan
            </Button>
            <Button size="md" variant="ghost" onClick={() => setDialog("abaikan")}>
              <X /> Abaikan
            </Button>
          </>
        )}
        <Button size="md" variant="secondary" onClick={() => setDialog("detail")}>
          <Eye /> Detail
        </Button>
      </div>

      <ConfirmDialog
        open={dialog === "konfirmasi"}
        onClose={() => setDialog(null)}
        onConfirm={() => jalankan(() => konfirmasiRekomendasi(rek.id, catatan))}
        loading={pending}
        title="Tandai sudah dikerjakan?"
        description={`${rek.tindakan} di ${rek.lahan} akan dicatat sebagai kegiatan budidaya hari ini.`}
        confirmLabel="Ya, sudah dikerjakan"
      >
        <label htmlFor={`catatan-${rek.id}`} className="text-sm font-medium">
          Catatan <span className="font-normal text-muted">(opsional)</span>
        </label>
        <Textarea
          id={`catatan-${rek.id}`}
          className="mt-1.5"
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          maxLength={300}
          placeholder={siram ? "Mis. disiram ±30 menit dengan selang" : "Mis. 5 kg dolomit"}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === "abaikan"}
        onClose={() => setDialog(null)}
        onConfirm={() => jalankan(() => abaikanRekomendasi(rek.id))}
        loading={pending}
        variant="danger"
        title="Abaikan rekomendasi ini?"
        description="Rekomendasi akan dipindahkan ke riwayat dan tidak dicatat sebagai kegiatan."
        confirmLabel="Abaikan"
      />

      <Dialog open={dialog === "detail"} onClose={() => setDialog(null)} title={rek.tindakan} description={`${siram ? "Penyiraman" : "Pemupukan"} · ${rek.lahan}`}>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <Stat label="Status"><BadgeRekomendasi status={rek.status} /></Stat>
          <Stat label="Prioritas"><BadgePrioritas prioritas={rek.prioritas} /></Stat>
          <Stat label="Jadwal">{rek.jadwalLabel}</Stat>
          <Stat label="Dibuat">{rek.dibuatLabel}</Stat>
          <Stat label="Fase tanam">{judulKata(rek.fase)}</Stat>
          <Stat label="Dosis">{rek.dosis ?? "–"}</Stat>
          <Stat label="Alasan" className="col-span-2">
            <span className="font-normal">{rek.alasan}</span>
          </Stat>
          {rek.bacaan && (
            <Stat label={`Bacaan sensor pemicu (${rek.bacaan.waktuLabel})`} className="col-span-2">
              <span className="flex flex-wrap gap-x-5 gap-y-1 font-normal num">
                <span>Kelembapan {rek.bacaan.kelembapanTanah}%</span>
                <span>pH {rek.bacaan.ph}</span>
                <span>Suhu {rek.bacaan.suhu}°C</span>
              </span>
            </Stat>
          )}
          <Stat label="Sumber aturan" className="col-span-2">
            <span className="font-normal">{rek.sumberAturan ?? "Aturan penyiraman bawaan sistem (ambang kelembapan & prakiraan hujan)"}</span>
          </Stat>
          {rek.kegiatanLabel && <Stat label="Tindak lanjut" className="col-span-2">{rek.kegiatanLabel}</Stat>}
        </dl>
      </Dialog>
    </article>
  );
}
