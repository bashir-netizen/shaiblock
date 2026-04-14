import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Badge — backward-compat + new FE-1 variants
// ------------------------------------------------------------
// Existing variants (PRESERVED for current consumers):
//   default, success, danger, warning, outline
// NEW FE-1 variants:
//   live (with pulse animation)
//   winning (emerald solid)
//   outbid (copper solid)
//   ending-soon (accent-hot with pulse)
// Sizes: sm, md (unchanged from prior API)
// ============================================================

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Backward-compat
        default: "bg-primary text-white",
        success: "bg-[var(--color-success)] text-white",
        danger: "bg-[var(--color-danger)] text-white",
        warning: "bg-accent text-white",
        outline: "border border-border text-foreground",
        // New FE-1 variants
        live: "bg-[var(--color-live)] text-white",
        winning: "bg-[var(--color-winning)] text-white",
        outbid: "bg-[var(--color-outbid)] text-white",
        "ending-soon": "bg-[var(--color-accent-hot)] text-white animate-pulse-danger",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ variant, size, className, children, ...rest }: BadgeProps) {
  const showLiveDot = variant === "live";
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...rest}
    >
      {showLiveDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
      )}
      {children}
    </span>
  );
}
