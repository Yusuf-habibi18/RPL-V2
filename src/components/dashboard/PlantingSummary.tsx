import { CalendarDays } from "lucide-react";
import { ProgressRing } from "@/components/viz/ProgressRing";
import { GrowthTimeline } from "@/components/viz/GrowthTimeline";
import type { TanamAktif } from "@/lib/data/lahan";
import { formatTanggal, judulKata } from "@/lib/format";

/** Ringkasan tanaman aktif: HST, fase, linimasa tumbuh, estimasi & progres panen (FR-18). */
export function PlantingSummary({ tanam, lahan }: { tanam: TanamAktif; lahan: string }) {
  const progres = tanam.hst / tanam.umurPanenHst;
  const sisa = tanam.estimasiPanen ? Math.ceil((tanam.estimasiPanen.getTime() - Date.now()) / 86_400_000) : null;

  return (
    <div>
      <div className="flex items-center gap-4">
        <ProgressRing nilai={progres} label={`Progres menuju panen ${Math.round(Math.min(progres, 1) * 100)}%`} warna={progres >= 1 ? "#D97706" : "#20B66A"}>
          <div>
            <p className="text-lg font-bold leading-none num">{Math.round(Math.min(progres, 1) * 100)}%</p>
            <p className="mt-0.5 text-[10px] text-muted">menuju panen</p>
          </div>
        </ProgressRing>
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{lahan}</p>
          <p className="font-bold">
            {tanam.komoditas} · {tanam.varietas}
          </p>
          <p className="text-sm text-muted">
            Fase <span className="font-semibold text-primary">{judulKata(tanam.fase)}</span> · HST {tanam.hst}
          </p>
          {tanam.estimasiPanen && (
            <p className="flex items-center gap-1.5 text-sm">
              <CalendarDays className="size-4 text-warning" aria-hidden />
              Panen ±<span className="font-semibold">{formatTanggal(tanam.estimasiPanen, "long")}</span>
              {sisa !== null && <span className="text-muted">({sisa > 0 ? `${sisa} hari lagi` : "sudah waktunya"})</span>}
            </p>
          )}
        </div>
      </div>
      <div className="mt-5">
        <GrowthTimeline fases={tanam.fases} hst={tanam.hst} umurPanenHst={tanam.umurPanenHst} />
      </div>
    </div>
  );
}
