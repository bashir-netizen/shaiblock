"use client";

import { useEffect, useRef, useState } from "react";
import type { Bid } from "@/lib/types";
import type { SimulatedBid } from "@/hooks/use-simulated-bidding";
import { formatPrice, timeAgo, cn } from "@/lib/utils";

interface BidHistoryProps {
  bids: (Bid | SimulatedBid)[];
  max?: number;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return (
    (parts[0]?.[0] || "?") + (parts[1]?.[0] || "")
  ).toUpperCase();
}

function isSimulatedBid(b: Bid | SimulatedBid): b is SimulatedBid {
  return (b as SimulatedBid).buyer_display_name !== undefined;
}

export function BidHistory({ bids, max = 8 }: BidHistoryProps) {
  const visible = bids.slice(0, max);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const prevTopIdRef = useRef<string | null>(null);

  useEffect(() => {
    const topId = visible[0]?.id ?? null;
    if (topId && topId !== prevTopIdRef.current) {
      prevTopIdRef.current = topId;
      setFreshIds((prev) => {
        const next = new Set(prev);
        next.add(topId);
        return next;
      });
      const t = setTimeout(() => {
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.delete(topId);
          return next;
        });
      }, 2000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible[0]?.id]);

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted text-sm">
        No bids yet. Be the first to bid!
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-foreground">
            Live Orders
          </span>
        </div>
        <span className="text-xs text-muted font-semibold">
          {bids.length} bid{bids.length !== 1 ? "s" : ""} total
        </span>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
        {visible.map((bid, i) => {
          const isNewest = i === 0;
          const isFresh = freshIds.has(bid.id);
          const sim = isSimulatedBid(bid) ? bid : null;
          const displayName = sim?.buyer_display_name || `Bidder #${i + 1}`;
          const city = sim?.buyer_city || "";
          const initials = getInitials(displayName);

          return (
            <div
              key={bid.id}
              className={cn(
                "flex items-center justify-between gap-3 px-5 py-3 transition-all duration-500",
                isNewest && "border-l-2 border-[var(--color-success)]",
                isFresh
                  ? "opacity-100 translate-y-0"
                  : "opacity-100 translate-y-0"
              )}
              style={
                isFresh
                  ? {
                      animation: "slideInBid 0.5s ease-out",
                    }
                  : undefined
              }
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isNewest
                      ? "bg-success text-white"
                      : "bg-border/60 text-muted"
                  )}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {displayName}
                  </p>
                  {city && (
                    <p className="text-[11px] text-muted truncate">{city}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono tabular-nums font-bold text-sm text-foreground">
                  <span className="text-[var(--color-success)] text-[10px] mr-0.5">▲</span>
                  {formatPrice(bid.amount_per_kg)}<span className="text-[10px] font-normal text-muted">/kg</span>
                </p>
                <p className="text-[10px] text-muted">{timeAgo(bid.placed_at)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes slideInBid {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
