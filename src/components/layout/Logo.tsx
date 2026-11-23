import { cn } from "@/lib/cn";

/** Logo: daun digital dengan gelombang sinyal sensor. */
export function LogoMark({ className }: { className?: string }) {
  return (
    // Warna solid (tanpa gradien ber-id): logo muncul di beberapa tempat sekaligus, termasuk
    // sidebar desktop yang disembunyikan di ponsel — referensi id ke elemen tersembunyi tidak ter-render.
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#123B28" stroke="#20B66A" strokeOpacity="0.7" />
      <path d="M12 29c0-9 6-16 17-17-1 11-8 17-17 17Z" fill="#20B66A" />
      <path d="M29 12c-1 6-3.5 10.5-7.5 13.5" stroke="#A3E635" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M12 29 24 17" stroke="#123B28" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 24h4M20 21h3" stroke="#123B28" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M27 27a5 5 0 0 0 3-3" stroke="#A3E635" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M27 31a9 9 0 0 0 7-7" stroke="#A3E635" strokeOpacity="0.55" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** `terang` = teks putih untuk latar gelap (sidebar, panel login). */
export function Logo({ className, terang = false }: { className?: string; terang?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-none">
        <p className={cn("text-[15px] font-bold tracking-tight", terang ? "text-white" : "text-fg")}>
          Agri<span className={terang ? "text-lime" : "text-emerald"}>-</span>Analytics
        </p>
        <p className={cn("mt-1 text-[10px] font-semibold uppercase tracking-[0.18em]", terang ? "text-white/55" : "text-muted")}>
          Smart Farming
        </p>
      </div>
    </div>
  );
}
