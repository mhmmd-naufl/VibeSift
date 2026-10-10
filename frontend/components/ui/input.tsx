import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** shadcn-style text input. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900",
        "outline-none transition-colors focus:border-brand",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
