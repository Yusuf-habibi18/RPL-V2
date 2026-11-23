"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SUMBU, TOOLTIP, WARNA, WARNA_SENSOR } from "@/components/charts/tema";
import { formatJam, formatTanggalJam, formatTanggalPendek } from "@/lib/format";

export interface TitikSensor {
  t: number;
  nilai: number;
}

/**
 * Grafik riwayat satu parameter sensor (FR-10): area satu seri (tanpa legenda — judul kartu
 * menamainya), pita hijau = rentang aman, crosshair + tooltip saat hover.
 */
export function SensorChart({
  data,
  label,
  satuan = "",
  amanMin,
  amanMaks,
  domain,
  harian = false,
  tinggi = 220,
  warna = WARNA_SENSOR.kelembapanTanah,
}: {
  data: TitikSensor[];
  label: string;
  satuan?: string;
  amanMin?: number;
  amanMaks?: number;
  domain?: [number, number];
  /** true → sumbu-x menampilkan tanggal; false → jam. */
  harian?: boolean;
  tinggi?: number;
  warna?: string;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tick = (t: number) => (harian ? formatTanggalPendek(t) : formatJam(t));

  return (
    <div style={{ height: tinggi }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={`sc-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={warna} stopOpacity={0.22} />
              <stop offset="100%" stopColor={warna} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={WARNA.grid} vertical={false} />
          {amanMin !== undefined && amanMaks !== undefined && (
            <ReferenceArea
              y1={amanMin}
              y2={amanMaks}
              fill={WARNA.success}
              fillOpacity={0.07}
              stroke={WARNA.success}
              strokeOpacity={0.35}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
          )}
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={tick}
            minTickGap={40}
            {...SUMBU}
          />
          <YAxis domain={domain ?? ["auto", "auto"]} width={42} {...SUMBU} />
          <Tooltip
            {...TOOLTIP}
            cursor={{ stroke: warna, strokeOpacity: 0.5, strokeDasharray: "3 3" }}
            labelFormatter={(t) => formatTanggalJam(Number(t))}
            formatter={(v) => [`${Number(v).toLocaleString("id-ID")}${satuan}`, label]}
          />
          <Area
            type="monotone"
            dataKey="nilai"
            name={label}
            stroke={warna}
            strokeWidth={2}
            fill={`url(#sc-${id})`}
            dot={false}
            activeDot={{ r: 5, fill: warna, stroke: WARNA.surface, strokeWidth: 2 }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
