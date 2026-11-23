import { cn } from "@/lib/cn";

/**
 * Ilustrasi daun wireframe dengan node sensor, cincin HUD, dan akar. Murni dekoratif.
 * `terang` = varian untuk latar gelap (panel login).
 */
export function LeafHologram({ className, terang = false }: { className?: string; terang?: boolean }) {
  const garis = terang ? "#A3E635" : "#16834A";
  const id = terang ? "t" : "g";
  return (
    <svg viewBox="0 0 320 320" className={cn("anim-drift", className)} aria-hidden fill="none">
      <defs>
        <linearGradient id={`lh-g-${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={terang ? "#20B66A" : "#16834A"} />
          <stop offset="1" stopColor="#A3E635" />
        </linearGradient>
        <radialGradient id={`lh-glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#A3E635" stopOpacity={terang ? 0.22 : 0.3} />
          <stop offset="1" stopColor="#A3E635" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="170" cy="140" r="130" fill={`url(#lh-glow-${id})`} />
      {/* cincin HUD */}
      <circle cx="170" cy="140" r="112" stroke={garis} strokeOpacity="0.22" strokeDasharray="2 6" />
      <circle cx="170" cy="140" r="86" stroke={garis} strokeOpacity="0.18" />
      <path d="M170 22v14M170 244v14M52 140h14M274 140h14" stroke={garis} strokeOpacity="0.35" />
      {/* daun */}
      <path
        d="M96 222C96 140 150 70 248 60c-6 98-66 160-152 162Z"
        fill={`url(#lh-g-${id})`}
        fillOpacity="0.12"
        stroke={`url(#lh-g-${id})`}
        strokeWidth="1.8"
      />
      <path d="M96 222 228 82" stroke={`url(#lh-g-${id})`} strokeWidth="1.4" />
      {[
        [120, 196, 118, 160],
        [142, 172, 150, 136],
        [164, 149, 182, 110],
        [186, 126, 210, 92],
        [134, 184, 168, 186],
        [158, 159, 194, 160],
        [182, 134, 220, 128],
      ].map(([x1, y1, x2, y2], i) => (
        <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={garis} strokeOpacity="0.5" />
      ))}
      {/* node sensor */}
      {[
        [118, 160],
        [150, 136],
        [182, 110],
        [168, 186],
        [194, 160],
        [220, 128],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="5.5" fill="#A3E635" fillOpacity="0.28" />
          <circle cx={cx} cy={cy} r="2.2" fill={terang ? "#A3E635" : "#16834A"} />
        </g>
      ))}
      {/* akar */}
      <path
        d="M96 222c-4 20-16 34-30 44M96 222c6 22 2 40-6 58M96 222c14 14 30 22 50 24"
        stroke={garis}
        strokeOpacity="0.4"
        strokeDasharray="3 4"
      />
      {/* lapisan tanah */}
      <path d="M30 236h250" stroke={garis} strokeOpacity="0.25" />
      <path d="M50 250h200M70 264h150" stroke={garis} strokeOpacity="0.12" />
    </svg>
  );
}
