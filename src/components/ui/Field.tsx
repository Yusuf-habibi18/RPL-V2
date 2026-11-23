import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const kontrol =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-fg placeholder:text-muted/60 transition-colors hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 aria-[invalid=true]:border-danger/70";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(kontrol, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(kontrol, "min-h-20 py-2.5", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(kontrol, "h-11 cursor-pointer appearance-none pr-9 [&>option]:bg-card", className)} {...props}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-fg/90">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
