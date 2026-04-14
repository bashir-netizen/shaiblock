import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Stamp — circular wax-seal wrapper for lot numbers + status labels
// Uses shadow-stamp + wax-noise.svg as background image overlay.
// ============================================================

const stampVariants = cva(
  "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider rounded-full select-none relative overflow-hidden",
  {
    variants: {
      color: {
        wax: "bg-[var(--color-wax)] text-white border-2 border-[var(--color-wax)]",
        primary: "bg-primary text-white border-2 border-primary",
        accent: "bg-accent text-white border-2 border-accent",
        gold: "bg-[var(--color-gold)] text-white border-2 border-[var(--color-gold)]",
      },
      size: {
        xs: "w-5 h-5 text-[9px] px-1",
        sm: "w-7 h-7 text-[10px] px-1.5",
        md: "h-9 px-3 text-xs min-w-9",
        lg: "h-12 px-4 text-sm min-w-12",
      },
    },
    defaultVariants: {
      color: "wax",
      size: "md",
    },
  }
);

export interface StampProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof stampVariants> {
  label: string;
}

export const Stamp = forwardRef<HTMLSpanElement, StampProps>(
  ({ color, size, label, className, style, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(stampVariants({ color, size }), className)}
        style={{
          backgroundImage: "url(/textures/wax-noise.svg)",
          backgroundBlendMode: "overlay",
          boxShadow: "var(--shadow-stamp)",
          ...style,
        }}
        aria-label={label}
        {...rest}
      >
        <span className="relative z-10">{label}</span>
      </span>
    );
  }
);
Stamp.displayName = "Stamp";
