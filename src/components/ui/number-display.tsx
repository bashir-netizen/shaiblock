import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// NumberDisplay — enforces mono tabular-nums for consistent widths
// Sizes: sm, md, lg, xl
// Optional currency prefix + per-kg suffix
// ============================================================

const numberVariants = cva("font-mono tabular-nums leading-none", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-lg",
      lg: "type-price-xl",
      xl: "text-5xl md:text-6xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "md",
    weight: "medium",
  },
});

export interface NumberDisplayProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof numberVariants> {
  value: number;
  currencyPrefix?: string;
  perKg?: boolean;
}

export function NumberDisplay({
  value,
  currencyPrefix = "$",
  perKg = false,
  size,
  weight,
  className,
  ...rest
}: NumberDisplayProps) {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <span className={cn(numberVariants({ size, weight }), className)} {...rest}>
      {currencyPrefix}
      {formatted}
      {perKg && (
        <span className="text-[var(--color-ink-muted)] font-normal ml-0.5 text-[0.7em]">
          /kg
        </span>
      )}
    </span>
  );
}
