import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Hairline-bordered panel on the dark canvas — no radius, no shadow. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border border-line bg-panel", className)}
      {...props}
    />
  );
}
