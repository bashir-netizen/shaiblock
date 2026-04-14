"use client";

import {
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Tooltip — neutral tooltip with cream paper + hairline border
// Hover-triggered on desktop, tap-triggered on mobile (via focus).
// ============================================================

interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  side = "top",
  className,
  children,
  ...rest
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  const sideClass = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[side];

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...rest}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-[300] px-2.5 py-1.5 rounded-md bg-card border border-border shadow-[var(--shadow-card)] text-xs text-foreground whitespace-nowrap pointer-events-none",
            sideClass
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
