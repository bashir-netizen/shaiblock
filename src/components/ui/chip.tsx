import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Chip — pill with optional leading icon
// Variants: neutral, liquor-tinted, status, wax
// ============================================================

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium select-none transition-colors",
  {
    variants: {
      variant: {
        neutral:
          "bg-card border-border text-foreground hover:bg-[var(--color-inset)]",
        "liquor-tinted": "border-transparent text-foreground",
        status:
          "bg-[var(--color-primary-50)] border-[var(--color-primary-700)]/20 text-[var(--color-primary-700)]",
        wax:
          "bg-[var(--color-wax)] border-[var(--color-wax)] text-white shadow-[var(--shadow-stamp)]",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

const liquorBackgrounds: Record<string, string> = {
  black: "rgba(107, 52, 16, 0.12)",
  green: "rgba(127, 166, 80, 0.12)",
  oolong: "rgba(181, 107, 27, 0.12)",
  white: "rgba(232, 214, 144, 0.25)",
  puerh: "rgba(74, 35, 22, 0.12)",
  herbal: "rgba(195, 59, 46, 0.12)",
  blend: "rgba(138, 106, 61, 0.12)",
};

export type LiquorType =
  | "black"
  | "green"
  | "oolong"
  | "white"
  | "puerh"
  | "herbal"
  | "blend";

export interface ChipProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  leadingIcon?: ReactNode;
  liquor?: LiquorType;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ variant, size, leadingIcon, liquor, className, style, children, ...rest }, ref) => {
    const tintedStyle =
      variant === "liquor-tinted" && liquor
        ? { backgroundColor: liquorBackgrounds[liquor], ...style }
        : style;
    return (
      <span
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        style={tintedStyle}
        {...rest}
      >
        {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
        {children}
      </span>
    );
  }
);
Chip.displayName = "Chip";
