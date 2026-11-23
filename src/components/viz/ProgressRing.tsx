import type { ReactNode } from "react";

/** Cincin progres (mis. progres menuju panen). */
export function ProgressRing({
  nilai,
  ukuran = 96,
  tebal = 9,
  warna = "#20B66A",
  children,
  label,
}: {
  nilai: number; // 0..1
  ukuran?: number;
  tebal?: number;
  warna?: string;
  children?: ReactNode;
  label: string;
}) {
  const r = (ukuran - tebal) / 2;
  const keliling = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, nilai));
  return (
    <div className="relative shrink-0" style={{ width: ukuran, height: ukuran }} role="img" aria-label={label}>
      <svg width={ukuran} height={ukuran} className="-rotate-90">
        <circle cx={ukuran / 2} cy={ukuran / 2} r={r} stroke="#E8F5EC" strokeWidth={tebal} fill="none" />
        <circle
          cx={ukuran / 2}
          cy={ukuran / 2}
          r={r}
          stroke={warna}
          strokeWidth={tebal}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={keliling}
          strokeDashoffset={keliling * (1 - v)}
          style={{ transition: "stroke-dashoffset 0.8s ease-out", filter: `drop-shadow(0 0 6px ${warna}66)` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
