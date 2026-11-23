import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "success" | "warning" | "danger" | "info" | "primary" | "neutral";

export const TONE_TEKS: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-data",
  primary: "text-primary",
  neutral: "text-muted",
};

const TONE: Record<Tone, string> = {
  success: "bg-[#e6f4ea] text-success ring-success/25",
  warning: "bg-[#fdf3e2] text-warning ring-warning/25",
  danger: "bg-[#fdecec] text-danger ring-danger/25",
  info: "bg-[#eaf1fe] text-data ring-data/25",
  primary: "bg-soft text-primary ring-primary/30",
  neutral: "bg-[#f1f4f2] text-muted ring-line",
};

interface Props {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md";
}

/** Label status. Selalu berisi teks (status tidak disampaikan hanya lewat warna). */
export function Badge({ tone = "neutral", icon, children, className, size = "sm" }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ring-inset",
        size === "sm" ? "px-2.5 py-0.5 text-xs [&_svg]:size-3.5" : "px-3 py-1 text-sm [&_svg]:size-4",
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
