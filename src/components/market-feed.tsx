"use client";

import type { Lot } from "@/lib/types";
import { formatPrice, timeAgo, getCountryFlag, cn } from "@/lib/utils";

interface MarketFeedProps {
  soldLots: Lot[];
}

export function MarketFeed({ soldLots }: MarketFeedProps) {
  if (soldLots.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--color-ink-muted)] text-sm">
        No recent market data.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-rule)]">
        <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--color-ink-muted)]">
          Recent Market
        </span>
        <span className="text-[9px] text-[var(--color-ink-muted)]">
          &middot; Sold Today
        </span>
      </div>

      <div className="divide-y divide-[var(--color-rule)]">
        {soldLots.map((lot) => {
          const premium = lot.final_price_per_kg && lot.reserve_price_per_kg
            ? (((lot.final_price_per_kg - lot.reserve_price_per_kg) / lot.reserve_price_per_kg) * 100)
            : 0;
          const direction = premium >= 0 ? "up" : "down";

          return (
            <div key={lot.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-serif text-[10px] font-semibold text-foreground truncate">
                  {getCountryFlag(lot.origin_country)} {lot.title}
                </p>
                <p className="text-[8px] text-[var(--color-ink-muted)] mt-0.5">
                  {lot.origin_region} &middot; Sold {lot.sold_at ? timeAgo(lot.sold_at) : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono tabular-nums font-bold text-[11px] text-foreground">
                  {formatPrice(lot.final_price_per_kg!)}/kg
                </p>
                <p className={cn(
                  "font-mono tabular-nums font-bold text-[9px]",
                  direction === "up" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                )}>
                  {direction === "up" ? "+" : ""}{premium.toFixed(1)}% {direction === "up" ? "▲" : "▼"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
