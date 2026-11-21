"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { useToastStore, type ToastType } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: "text-brand",
  error: "text-red-400",
  info: "text-sub",
};

/** Fixed-position toast stack — square, hairline, bottom sheet on mobile. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-stretch gap-px sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96 sm:items-end">
      {toasts.map((item, index) => {
        const Icon = ICONS[item.type];
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex animate-toast-in items-start gap-3",
              "border border-line bg-panel px-4 py-3.5",
              "shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]",
            )}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", STYLES[item.type])} />
            <p className="flex-1 text-sm leading-snug text-ink">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="focus-ring -mr-1 shrink-0 p-1 text-faint transition-colors hover:text-ink"
              aria-label="Tutup notifikasi"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
