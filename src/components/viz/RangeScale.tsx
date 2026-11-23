import { cn } from "@/lib/cn";

const GRADIEN = {
  ph: "linear-gradient(90deg,#DC2626 0%,#F59E0B 28%,#22A55A 48%,#0EA5A4 70%,#2563EB 100%)",
  suhu: "linear-gradient(90deg,#2563EB 0%,#0EA5A4 25%,#22A55A 45%,#F59E0B 72%,#DC2626 100%)",
} as const;

/**
 * Skala horizontal dengan pita rentang aman dan penanda nilai saat ini.
 * Dipakai untuk pH tanah (0–14, asam–basa) dan suhu.
 */
export function RangeScale({
  nilai,
  skalaMin,
  skalaMaks,
  amanMin,
  amanMaks,
  satuan = "",
  jenis,
  labelKiri,
  labelTengah,
  labelKanan,
  desimal = 1,
}: {
  nilai: number | null;
  skalaMin: number;
  skalaMaks: number;
  amanMin?: number;
  amanMaks?: number;
  satuan?: string;
  jenis: keyof typeof GRADIEN;
  labelKiri: string;
  labelTengah?: string;
  labelKanan: string;
  desimal?: number;
}) {
  const persen = (v: number) => Math.min(100, Math.max(0, ((v - skalaMin) / (skalaMaks - skalaMin)) * 100));
  const diLuar = nilai !== null && amanMin !== undefined && amanMaks !== undefined && (nilai < amanMin || nilai > amanMaks);

  return (
    <div className="w-full">
      <div className="relative pt-9">
        {nilai !== null && (
          <div className="absolute top-0 -translate-x-1/2 transition-[left] duration-500" style={{ left: `${persen(nilai)}%` }}>
            <span
              className={cn(
                "block whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-bold num",
                diLuar ? "bg-warning text-bg" : "bg-fg text-bg",
              )}
            >
              {nilai.toLocaleString("id-ID", { maximumFractionDigits: desimal })}
              {satuan}
            </span>
            <span className={cn("mx-auto block size-0 border-x-4 border-t-[5px] border-x-transparent", diLuar ? "border-t-warning" : "border-t-fg")} />
          </div>
        )}
        <div className="relative h-2.5 rounded-full opacity-90" style={{ background: GRADIEN[jenis] }}>
          {amanMin !== undefined && amanMaks !== undefined && (
            <div
              className="absolute -inset-y-1.5 rounded-md border-2 border-primary bg-white/35 shadow-sm"
              style={{ left: `${persen(amanMin)}%`, width: `${persen(amanMaks) - persen(amanMin)}%` }}
              title={`Rentang aman ${amanMin}–${amanMaks}${satuan}`}
            />
          )}
        </div>
      </div>
      <div className="mt-2.5 flex justify-between text-[11px] text-muted">
        <span>{labelKiri}</span>
        {labelTengah && <span>{labelTengah}</span>}
        <span>{labelKanan}</span>
      </div>
    </div>
  );
}
