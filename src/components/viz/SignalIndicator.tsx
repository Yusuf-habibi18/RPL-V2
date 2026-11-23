import { BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";
import { STATUS_SENSOR } from "@/components/ui/status";
import { cn } from "@/lib/cn";
import type { StatusSensor } from "@/types";

/** Status koneksi sensor IoT: titik berdenyut + bar sinyal + baterai. */
export function SignalIndicator({
  status,
  kode,
  terakhir,
  baterai,
  ringkas = false,
}: {
  status: StatusSensor;
  kode: string;
  terakhir: string;
  baterai?: number | null;
  ringkas?: boolean;
}) {
  const on = status === "AKTIF";
  const warna = on ? "text-success" : status === "OFFLINE" ? "text-warning" : "text-muted";
  const Baterai = baterai == null ? null : baterai < 25 ? BatteryLow : baterai < 70 ? BatteryMedium : BatteryFull;

  return (
    <div className="flex items-center gap-3">
      <span className={cn("relative inline-flex size-2.5 shrink-0 rounded-full bg-current", warna, on && "anim-pulse")} aria-hidden />
      <span className="flex h-4 items-end gap-[2px]" aria-hidden>
        {[0.35, 0.55, 0.78, 1].map((h, i) => (
          <span
            key={i}
            className={cn("w-[3px] rounded-sm", on ? "bg-data" : "bg-muted/30", on && i === 3 && "opacity-70")}
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </span>
      <div className="min-w-0 text-sm leading-tight">
        <p className="font-mono text-xs text-muted">{kode}</p>
        <p className={cn("font-semibold", warna)}>
          {STATUS_SENSOR[status].label}
          {!ringkas && <span className="font-normal text-muted"> · data {terakhir}</span>}
        </p>
      </div>
      {Baterai && !ringkas && (
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted num" title="Level baterai sensor">
          <Baterai className={cn("size-4", baterai! < 25 ? "text-danger" : "text-muted")} aria-hidden />
          {baterai}%
        </span>
      )}
    </div>
  );
}
