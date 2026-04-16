"use client";

import { useMemo } from "react";
import type { TickerItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface MarketTickerProps {
  items: TickerItem[];
}

export function MarketTicker({ items }: MarketTickerProps) {
  const doubled = useMemo(() => [...items, ...items], [items]);

  if (items.length === 0) return null;

  return (
    <div className="md:hidden bg-[var(--color-bg)] border-b border-[var(--color-rule)] overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="flex items-center gap-6 py-1.5 px-2 whitespace-nowrap animate-ticker-scroll">
        {doubled.map((item, i) => (
          <span key={`${item.symbol}-${i}`} className="inline-flex items-center gap-1.5 text-[10px] font-mono tabular-nums">
            <span className="text-[var(--color-ink-muted)] font-semibold">{item.symbol}</span>
            <span className="text-foreground font-bold">{formatPrice(item.price)}</span>
            <span className={item.direction === "up" ? "text-[var(--color-success)] font-bold" : "text-[var(--color-danger)] font-bold"}>
              {item.direction === "up" ? "▲" : "▼"}{formatPrice(item.change)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
