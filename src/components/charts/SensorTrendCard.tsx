"use client";

import { Activity } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { SensorChart } from "@/components/charts/SensorChart";
import { Card, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { Ambang, Parameter } from "@/types";
import { LABEL_PARAMETER, SATUAN_PARAMETER } from "@/types";

interface Titik {
  t: number;
  kelembapanTanah: number;
  suhu: number;
  ph: number;
}

const PARAM: { kunci: Parameter; field: keyof Omit<Titik, "t"> }[] = [
  { kunci: "KELEMBAPAN_TANAH", field: "kelembapanTanah" },
  { kunci: "PH", field: "ph" },
  { kunci: "SUHU", field: "suhu" },
];

/** Tren sensor ringkas di dashboard: pilih parameter & rentang (24 jam / 7 hari). */
export function SensorTrendCard({ titik, ambang, lahanId }: { titik: Titik[]; ambang: Ambang[]; lahanId: string }) {
  const [param, setParam] = useState<Parameter>("KELEMBAPAN_TANAH");
  const [rentang, setRentang] = useState<"24j" | "7h">("24j");

  const data = useMemo(() => {
    // Relatif terhadap titik terakhir agar hasil render server & browser identik.
    const akhir = titik.at(-1)?.t ?? 0;
    const batas = akhir - (rentang === "24j" ? 24 : 168) * 3_600_000;
    const field = PARAM.find((p) => p.kunci === param)!.field;
    return titik.filter((x) => x.t >= batas).map((x) => ({ t: x.t, nilai: x[field] }));
  }, [titik, param, rentang]);
  const a = ambang.find((x) => x.parameter === param);

  return (
    <Card className="h-full">
      <CardHeader
        icon={<Activity />}
        title="Tren sensor"
        description={`${LABEL_PARAMETER[param]} · pita hijau = batas aman`}
        action={
          <Link href={`/monitoring?lahan=${lahanId}`} className="text-sm font-semibold text-primary hover:underline">
            Detail
          </Link>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 pt-4">
        <div className="flex gap-1 rounded-xl bg-bg/60 p-1" role="group" aria-label="Parameter">
          {PARAM.map((p) => (
            <button
              key={p.kunci}
              onClick={() => setParam(p.kunci)}
              aria-pressed={param === p.kunci}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
                param === p.kunci ? "bg-card-2 text-fg ring-1 ring-inset ring-primary/40" : "text-muted hover:text-fg",
              )}
            >
              {p.kunci === "KELEMBAPAN_TANAH" ? "Kelembapan" : LABEL_PARAMETER[p.kunci]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-xl bg-bg/60 p-1" role="group" aria-label="Rentang waktu">
          {(["24j", "7h"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRentang(r)}
              aria-pressed={rentang === r}
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold transition-colors",
                rentang === r ? "bg-primary text-white" : "text-muted hover:text-fg",
              )}
            >
              {r === "24j" ? "24 jam" : "7 hari"}
            </button>
          ))}
        </div>
      </div>
      <div className="px-3 pb-4 pt-2">
        {data.length === 0 ? (
          <p className="grid h-[220px] place-items-center text-sm text-muted">Belum ada data pada rentang ini.</p>
        ) : (
          <SensorChart
            data={data}
            label={LABEL_PARAMETER[param]}
            satuan={SATUAN_PARAMETER[param]}
            amanMin={a?.min}
            amanMaks={a?.maks}
            harian={rentang === "7h"}
          />
        )}
      </div>
    </Card>
  );
}
