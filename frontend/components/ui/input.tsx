import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Hairline-bordered input for dark surfaces. */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "focus-ring w-full border border-line bg-panel px-3.5 py-2.5 text-sm text-ink",
        "placeholder:text-faint transition-colors",
        "focus:border-white/40",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
