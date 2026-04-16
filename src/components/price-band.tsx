"use client";

import { useMemo } from "react";
import type { SimulatedBid } from "@/hooks/use-simulated-bidding";
import { formatPrice, formatSDG, getCountryFlag, cn } from "@/lib/utils";

interface PriceBandProps {
  currentHigh: number;
  openingPrice: number;
  bids: SimulatedBid[];
  originCountry: string;
  originRegion?: string;
  teaType: string;
  grade: string;
}

function Sparkline({ bids, className }: { bids: SimulatedBid[]; className?: string }) {
  const points = useMemo(() => {
    if (bids.length === 0) return [];
    const sorted = [...bids]
      .sort((a, b) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime());
    const minTime = new Date(sorted[0].placed_at).getTime();
    const maxTime = new Date(sorted[sorted.length - 1].placed_at).getTime();
    const timeRange = maxTime - minTime || 1;
    const prices = sorted.map((b) => b.amount_per_kg);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    return sorted.map((b) => ({
      x: ((new Date(b.placed_at).getTime() - minTime) / timeRange) * 280 + 5,
      y: 42 - ((b.amount_per_kg - minPrice) / priceRange) * 36,
    }));
  }, [bids]);

  if (points.length < 4) {
    const y = 24;
    return (
      <svg viewBox="0 0 290 48" preserveAspectRatio="none" className={className}>
        <line x1="5" y1={y} x2="285" y2={y} stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      </svg>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},48 L${points[0].x.toFixed(1)},48 Z`;

  return (
    <svg viewBox="0 0 290 48" preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkGrad)" />
      <path d={linePath} stroke="var(--color-primary)" strokeWidth="1.5" fill="none" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="var(--color-primary)" />
    </svg>
  );
}

export function PriceBand({
  currentHigh,
  openingPrice,
  bids,
  originCountry,
  originRegion,
  teaType,
  grade,
}: PriceBandProps) {
  const change = +(currentHigh - openingPrice).toFixed(2);
  const direction = change >= 0 ? "up" : "down";

  return (
    <div className="md:hidden bg-[var(--color-bg)] border-b-[3px] border-[var(--color-primary)] px-4 py-3">
      <p className="text-[8px] font-bold uppercase tracking-[1.5px] text-[var(--color-ink-muted)] mb-1">
        Current High Bid
      </p>

      <div className="flex items-baseline justify-between">
        <div className="font-mono tabular-nums text-[28px] font-bold text-[var(--color-primary)] leading-none flex items-baseline gap-1">
          <span className={cn("text-[16px]", direction === "up" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]")}>
            {direction === "up" ? "▲" : "▼"}
          </span>
          {formatPrice(currentHigh)}
          <span className="text-[11px] text-[var(--color-ink-muted)] font-normal">/kg</span>
        </div>

        <span className={cn(
          "font-mono tabular-nums text-[9px] font-bold px-2 py-0.5 rounded-full",
          direction === "up"
            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
            : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
        )}>
          {direction === "up" ? "+" : "-"}{formatPrice(Math.abs(change))} {direction === "up" ? "▲" : "▼"}
        </span>
      </div>

      <p className="font-mono tabular-nums text-[9px] text-[var(--color-accent)] mt-0.5">
        {formatSDG(currentHigh)} /kg
      </p>

      <div className="mt-2 h-[48px]">
        <Sparkline bids={bids} className="w-full h-full" />
      </div>

      <div className="flex items-center gap-1 mt-1 text-[9px] text-[var(--color-ink-muted)]">
        <span>{getCountryFlag(originCountry)}</span>
        <span>{originRegion || originCountry}</span>
        <span className="mx-0.5">&middot;</span>
        <span className="capitalize">{teaType.replace("_", " ")}</span>
        <span className="mx-0.5">&middot;</span>
        <span>{grade}</span>
      </div>
    </div>
  );
}
