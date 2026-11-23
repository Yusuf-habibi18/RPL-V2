import type { ReactNode } from "react";
import { TONE_TEKS, type Tone } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const AKSEN: Record<Tone, string> = {
  success: "from-success/15 text-success ring-success/25",
  warning: "from-warning/15 text-warning ring-warning/25",
  danger: "from-danger/15 text-danger ring-danger/25",
  info: "from-data/15 text-data ring-data/20",
  primary: "from-primary/15 text-primary ring-primary/25",
  neutral: "from-fg/5 text-muted ring-line",
};

/** Kartu angka ringkas: ikon, label, nilai besar, keterangan. */
export function StatCard({
  label,
  nilai,
  satuan,
  ikon,
  tone = "info",
  keterangan,
  keteranganTone,
  className,
}: {
  label: string;
  nilai: ReactNode;
  satuan?: string;
  ikon: ReactNode;
  tone?: Tone;
  keterangan?: ReactNode;
  keteranganTone?: Tone;
  className?: string;
}) {
  return (
    <div className={cn("panel group relative overflow-hidden rounded-2xl p-4 transition-colors hover:border-primary/30", className)}>
      <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-emerald/10 blur-2xl transition-colors group-hover:bg-lime/25" />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        <span className={cn("grid size-8 place-items-center rounded-lg bg-gradient-to-br to-transparent ring-1 ring-inset [&>svg]:size-4", AKSEN[tone])}>
          {ikon}
        </span>
      </div>
      <p className="mt-2 text-[1.65rem] font-bold leading-none tracking-tight num">
        {nilai}
        {satuan && <span className="ml-1 text-sm font-semibold text-muted">{satuan}</span>}
      </p>
      {keterangan && (
        <p className={cn("mt-2 text-xs", keteranganTone ? TONE_TEKS[keteranganTone] : "text-muted")}>{keterangan}</p>
      )}
    </div>
  );
}
