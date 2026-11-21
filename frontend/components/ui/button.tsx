import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "brand";

const VARIANTS: Record<Variant, string> = {
  default: "bg-ink text-canvas hover:bg-white",
  brand: "bg-brand text-canvas hover:bg-brand-dark",
  outline: "border border-white/25 bg-transparent text-ink hover:border-white/50 hover:bg-white/5",
  ghost: "text-sub hover:bg-white/5 hover:text-ink",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

/** Swiss-style rectangular button with hard-edge press feedback. */
export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 px-5 py-2.5",
        "text-[13px] font-semibold",
        "transition-colors duration-150",
        "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
