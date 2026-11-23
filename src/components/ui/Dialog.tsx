"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

/** Dialog modal: tutup dengan Esc / klik latar, fokus dikembalikan ke pemicu. Di ponsel tampil sebagai bottom sheet. */
export function Dialog({ open, onClose, title, description, children, footer, size = "md" }: DialogProps) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const sebelumnya = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const fokus = panel.current?.querySelector<HTMLElement>("[autofocus], input, select, textarea, button");
    fokus?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      sebelumnya?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="anim-in absolute inset-0 bg-[#0c2418]/45 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-judul`}
        className={cn(
          "panel anim-in relative flex max-h-[92vh] w-full flex-col rounded-t-3xl !bg-card sm:rounded-2xl",
          size === "sm" ? "sm:max-w-md" : size === "md" ? "sm:max-w-lg" : "sm:max-w-2xl",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 id={`${id}-judul`} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup" className="-mr-2 -mt-1">
            <X />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  variant?: ButtonVariant;
  loading?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel, variant = "primary", loading, children }: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
