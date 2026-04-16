import { cn, formatPrice, formatSDG } from "@/lib/utils";

// ============================================================
// PriceDisplay — USD primary + SDG secondary (Sudan-localized)
// ============================================================

interface PriceDisplayProps {
  amountUSD: number;
  size?: "sm" | "md" | "lg" | "xl";
  perKg?: boolean;
  showSDG?: boolean;
  className?: string;
  align?: "left" | "right" | "center";
  emphasis?: boolean; // if true, USD is bold
  trend?: "up" | "down";
}

const SIZE_CLASSES = {
  sm: {
    usd: "text-base",
    sdg: "text-[10px]",
  },
  md: {
    usd: "text-xl",
    sdg: "text-xs",
  },
  lg: {
    usd: "text-3xl",
    sdg: "text-xs",
  },
  xl: {
    usd: "text-4xl md:text-5xl",
    sdg: "text-sm",
  },
};

export function PriceDisplay({
  amountUSD,
  size = "md",
  perKg = false,
  showSDG = true,
  className,
  align = "left",
  emphasis = true,
  trend,
}: PriceDisplayProps) {
  const sizes = SIZE_CLASSES[size];
  const alignClass =
    align === "right"
      ? "text-right items-end"
      : align === "center"
        ? "text-center items-center"
        : "text-left items-start";

  return (
    <div className={cn("inline-flex flex-col", alignClass, className)}>
      <div
        className={cn(
          "font-mono tabular-nums leading-tight",
          sizes.usd,
          emphasis && "font-bold",
          trend === "up" && "text-[var(--color-success)]",
          trend === "down" && "text-[var(--color-danger)]",
        )}
      >
        {trend && (
          <span className="text-[0.6em] mr-0.5">
            {trend === "up" ? "▲" : "▼"}
          </span>
        )}
        {formatPrice(amountUSD)}{perKg && <span className="font-sans font-normal text-muted ml-0.5 text-[0.6em]">/kg</span>}
      </div>
      {showSDG && (
        <div
          className={cn(
            "font-mono tabular-nums text-muted leading-tight mt-0.5",
            sizes.sdg
          )}
        >
          {formatSDG(amountUSD)}
          {perKg && <span className="ml-0.5">/kg</span>}
        </div>
      )}
    </div>
  );
}
