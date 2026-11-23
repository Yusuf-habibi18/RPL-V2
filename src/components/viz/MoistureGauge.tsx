import { WARNA_STATUS } from "@/components/ui/status";
import type { StatusKondisi } from "@/types";

const CX = 100;
const CY = 100;

/** Titik pada busur setengah lingkaran: 0 → kiri, 100 → kanan. */
function titik(persen: number, r: number) {
  const sudut = Math.PI - (Math.min(Math.max(persen, 0), 100) / 100) * Math.PI;
  return { x: CX + r * Math.cos(sudut), y: CY - r * Math.sin(sudut) };
}

function busur(dari: number, ke: number, r: number) {
  const a = titik(dari, r);
  const b = titik(ke, r);
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 0 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

/**
 * Gauge kelembapan tanah (0–100%): pita hijau = rentang aman, busur = nilai saat ini.
 * Nilai juga ditulis sebagai teks, status tidak hanya lewat warna.
 */
export function MoistureGauge({
  nilai,
  min,
  maks,
  status,
  label = "Kelembapan tanah",
}: {
  nilai: number | null;
  min?: number;
  maks?: number;
  status: StatusKondisi;
  label?: string;
}) {
  const warna = WARNA_STATUS[status];
  const ujung = nilai !== null ? titik(nilai, 78) : null;

  return (
    <figure className="relative mx-auto w-full max-w-[220px]">
      <svg viewBox="0 0 200 118" className="w-full" role="img" aria-label={`${label}: ${nilai ?? "tidak ada data"}%. Rentang aman ${min}–${maks}%.`}>
        <defs>
          <filter id="mg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        {/* garis skala */}
        {Array.from({ length: 11 }, (_, i) => {
          const a = titik(i * 10, 92);
          const b = titik(i * 10, i % 5 === 0 ? 86 : 89);
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#718078" strokeOpacity={i % 5 === 0 ? 0.5 : 0.25} />;
        })}
        <path d={busur(0, 100, 78)} stroke="#E8F5EC" strokeWidth="12" fill="none" strokeLinecap="round" />
        {min !== undefined && maks !== undefined && (
          <path d={busur(min, maks, 64)} stroke="#16834A" strokeOpacity="0.55" strokeWidth="3" fill="none" strokeDasharray="2 3" />
        )}
        {nilai !== null && (
          <>
            <path d={busur(0, nilai, 78)} stroke={warna} strokeWidth="12" fill="none" strokeLinecap="round" />
            <circle cx={ujung!.x} cy={ujung!.y} r="9" fill={warna} opacity="0.5" filter="url(#mg-glow)" />
            <circle cx={ujung!.x} cy={ujung!.y} r="5" fill="#FFFFFF" stroke={warna} strokeWidth="3" />
          </>
        )}
        <text x="22" y="116" fontSize="9" fill="#718078">0</text>
        <text x="170" y="116" fontSize="9" fill="#718078">100</text>
      </svg>
      <figcaption className="absolute inset-x-0 bottom-1 text-center">
        <span className="block text-3xl font-bold leading-none num">
          {nilai !== null ? nilai.toLocaleString("id-ID", { maximumFractionDigits: 1 }) : "–"}
          <span className="ml-0.5 text-base font-semibold text-muted">%</span>
        </span>
      </figcaption>
    </figure>
  );
}
