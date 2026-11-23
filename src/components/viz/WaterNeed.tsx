import { formatAngka } from "@/lib/format";

/**
 * Kolom tanah: tinggi air = kelembapan saat ini, garis putus = rentang aman.
 * Bila kurang air, aliran air beranimasi menuju target.
 */
export function WaterNeed({ kelembapan, min, maks }: { kelembapan: number; min: number; maks: number }) {
  const kurang = kelembapan < min;
  const y = (v: number) => 108 - (Math.min(100, Math.max(0, v)) / 100) * 100;
  const kekurangan = Math.max(0, min - kelembapan);

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 56 116" className="h-24 w-12 shrink-0" role="img" aria-label={`Kelembapan ${kelembapan}%, target ${min}–${maks}%`}>
        <defs>
          <linearGradient id="wn-air" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#60A5FA" stopOpacity="0.95" />
            <stop offset="1" stopColor="#2563EB" stopOpacity="0.8" />
          </linearGradient>
          <pattern id="wn-tanah" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="#718078" opacity="0.25" />
          </pattern>
          <clipPath id="wn-clip">
            <rect x="10" y="8" width="36" height="100" rx="8" />
          </clipPath>
        </defs>
        <rect x="10" y="8" width="36" height="100" rx="8" fill="#F5F8F5" stroke="#718078" strokeOpacity="0.25" />
        <g clipPath="url(#wn-clip)">
          <rect x="10" y="8" width="36" height="100" fill="url(#wn-tanah)" />
          <rect x="10" y={y(kelembapan)} width="36" height={108 - y(kelembapan)} fill="url(#wn-air)" />
          <rect x="10" y={y(maks)} width="36" height={y(min) - y(maks)} fill="#16834A" fillOpacity="0.1" />
        </g>
        <line x1="4" x2="52" y1={y(min)} y2={y(min)} stroke="#16834A" strokeDasharray="3 3" />
        <line x1="4" x2="52" y1={y(maks)} y2={y(maks)} stroke="#16834A" strokeOpacity="0.5" strokeDasharray="3 3" />
        {kurang && (
          <path
            d={`M 28 2 L 28 ${y(kelembapan) - 2}`}
            stroke="#2563EB"
            strokeWidth="2"
            strokeDasharray="4 6"
            className="anim-flow"
          />
        )}
      </svg>
      <div className="text-sm leading-snug">
        <p className="text-muted">Kelembapan saat ini</p>
        <p className="text-lg font-bold num">{formatAngka(kelembapan)}%</p>
        <p className="mt-1 text-xs text-muted">
          Target {min}–{maks}%
          {kurang && (
            <>
              {" · "}
              <span className="font-semibold text-data">kurang {formatAngka(kekurangan)}%</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
