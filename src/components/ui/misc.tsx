import { Info, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </header>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <span className="relative grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/25">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function InfoNote({ children, tone = "info", className }: { children: ReactNode; tone?: "info" | "warning"; className?: string }) {
  return (
    <div
      className={cn(
        "flex gap-2.5 rounded-xl border px-3.5 py-3 text-sm",
        tone === "info" ? "border-data/20 bg-[#f2f6fe] text-fg [&>svg]:text-data" : "border-warning/25 bg-[#fdf6ea] text-fg [&>svg]:text-warning",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

/** Tab berbasis tautan (state di URL, bisa dibagikan & bekerja tanpa JS). */
export function TabLinks({
  tabs,
  aktif,
  className,
}: {
  tabs: { href: string; label: string; kunci: string; jumlah?: number; ikon?: LucideIcon }[];
  aktif: string;
  className?: string;
}) {
  return (
    <nav className={cn("-mx-1 flex gap-1 overflow-x-auto px-1 pb-1", className)} aria-label="Tab">
      {tabs.map(({ href, label, kunci, jumlah, ikon: Ikon }) => {
        const on = kunci === aktif;
        return (
          <Link
            key={kunci}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors",
              on ? "bg-card text-primary shadow-sm ring-1 ring-inset ring-primary/35" : "text-muted hover:bg-soft hover:text-fg",
            )}
          >
            {Ikon && <Ikon className={cn("size-4", on && "text-primary")} aria-hidden />}
            {label}
            {jumlah !== undefined && jumlah > 0 && (
              <span className={cn("rounded-full px-1.5 text-xs num", on ? "bg-primary text-white" : "bg-fg/10 text-fg")}>
                {jumlah}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Label kecil + nilai, untuk baris detail. */
export function Stat({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-fg">{children}</dd>
    </div>
  );
}
