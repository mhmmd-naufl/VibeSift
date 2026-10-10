import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost";

const VARIANTS: Record<Variant, string> = {
  default: "bg-brand text-white hover:bg-brand-dark",
  outline: "border border-slate-300 text-slate-800 hover:bg-slate-100",
  ghost: "text-slate-700 hover:bg-slate-100",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

/** shadcn-style button. */
export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
        "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
