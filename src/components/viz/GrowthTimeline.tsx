import { Flower2, Leaf, Sprout, Wheat, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { judulKata } from "@/lib/format";

const IKON: LucideIcon[] = [Sprout, Leaf, Flower2, Wheat];

/**
 * Linimasa pertumbuhan tanaman: fase berdasarkan HST, posisi hari ini, dan target panen.
 */
export function GrowthTimeline({
  fases,
  hst,
  umurPanenHst,
}: {
  fases: { nama: string; hstMulai: number; hstSelesai: number }[];
  hst: number;
  umurPanenHst: number;
}) {
  const total = Math.max(umurPanenHst + 10, (fases.at(-1)?.hstMulai ?? umurPanenHst) + 10);
  const pos = Math.min(100, Math.max(0, (hst / total) * 100));
  const panenPos = (umurPanenHst / total) * 100;

  return (
    <div className="w-full" role="img" aria-label={`Hari ke-${hst} setelah tanam dari ${umurPanenHst} hari menuju panen`}>
      <div className="relative h-14">
        {/* penanda hari ini */}
        <div className="absolute top-0 -translate-x-1/2 text-center transition-[left] duration-700" style={{ left: `${pos}%` }}>
          <span className="block whitespace-nowrap rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-bold text-white num">HST {hst}</span>
          <span className="mx-auto block h-7 w-px bg-gradient-to-b from-primary to-transparent" />
        </div>
        {/* penanda panen */}
        <div className="absolute top-3 -translate-x-1/2" style={{ left: `${panenPos}%` }} title={`Umur panen ${umurPanenHst} HST`}>
          <Wheat className="size-4 text-warning" aria-hidden />
        </div>
      </div>
      <div className="flex h-3 gap-1">
        {fases.map((f, i) => {
          const mulai = Math.min(f.hstMulai, total);
          const selesai = Math.min(f.hstSelesai + 1, total);
          const lebar = Math.max(0, selesai - mulai);
          const lewat = hst > f.hstSelesai;
          const kini = hst >= f.hstMulai && hst <= f.hstSelesai;
          return (
            <div key={f.nama} className="relative h-full overflow-hidden rounded-full bg-card-2" style={{ flexGrow: lebar }}>
              <div
                className={cn(
                  "h-full rounded-full",
                  lewat && "bg-gradient-to-r from-primary to-emerald",
                  kini && "bg-gradient-to-r from-emerald to-lime shadow-[0_0_10px_rgb(163_230_53/0.7)]",
                )}
                style={{ width: kini ? `${((hst - f.hstMulai + 1) / (f.hstSelesai - f.hstMulai + 1)) * 100}%` : lewat ? "100%" : "0%" }}
              />
              {i === 0 && null}
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1">
        {fases.map((f, i) => {
          const Ikon = IKON[Math.min(i, IKON.length - 1)];
          const kini = hst >= f.hstMulai && hst <= f.hstSelesai;
          const lebar = Math.max(0, Math.min(f.hstSelesai + 1, total) - Math.min(f.hstMulai, total));
          return (
            <div key={f.nama} className="min-w-0" style={{ flexGrow: lebar, flexBasis: 0 }}>
              <p className={cn("flex items-center gap-1 truncate text-[11px] font-semibold", kini ? "text-primary" : "text-muted")}>
                <Ikon className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{judulKata(f.nama)}</span>
              </p>
              <p className="truncate text-[10px] text-muted/70 num">
                {f.hstMulai}–{f.hstSelesai}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
