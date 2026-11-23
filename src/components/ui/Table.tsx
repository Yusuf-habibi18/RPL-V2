import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Tabel responsif: bergulir horizontal di dalam wadahnya, bukan halaman. */
export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className={cn("w-full min-w-[640px] border-separate border-spacing-0 text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line px-3 pb-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted first:pl-0 last:pr-0",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line/70 px-3 py-3 align-middle first:pl-0 last:pr-0", className)} {...props} />;
}

export function Tr({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-soft/60", className)} {...props} />;
}
