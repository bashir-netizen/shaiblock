import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Divider — 3 variants: hair, leaf-chain, catalog-rule
// ============================================================

const dividerVariants = cva("", {
  variants: {
    variant: {
      hair: "border-t border-border",
      "leaf-chain": "",
      "catalog-rule": "",
    },
    orientation: {
      horizontal: "w-full",
      vertical: "h-full border-l border-t-0",
    },
  },
  defaultVariants: {
    variant: "hair",
    orientation: "horizontal",
  },
});

export interface DividerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {}

export function Divider({ variant, orientation, className, ...rest }: DividerProps) {
  if (variant === "leaf-chain") {
    return (
      <div
        className={cn("flex items-center gap-2 text-border", className)}
        role="separator"
        {...rest}
      >
        <span className="flex-1 border-t border-border" />
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5 1 C 2 3, 2 7, 5 9 C 8 7, 8 3, 5 1 Z" />
          </svg>
        ))}
        <span className="flex-1 border-t border-border" />
      </div>
    );
  }
  if (variant === "catalog-rule") {
    return (
      <div
        className={cn("flex items-center gap-2 text-border", className)}
        role="separator"
        {...rest}
      >
        <span className="flex-1 border-t border-border" />
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
          <path d="M4 0 L 8 4 L 4 8 L 0 4 Z" />
        </svg>
        <span className="flex-1 border-t border-border" />
        <span className="flex-1 border-t border-border" />
      </div>
    );
  }
  return (
    <div
      className={cn(dividerVariants({ variant, orientation }), className)}
      role="separator"
      {...rest}
    />
  );
}
