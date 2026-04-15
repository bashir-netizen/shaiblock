"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

// ============================================================
// PendingReviewSheet — 3s "seller reviewing..." overlay
// Only rendered when the main auction's highest bid was below reserve.
// Auto-flips to "approved" state after ~2.2s for visual progression.
// ============================================================

interface PendingReviewSheetProps {
  seller: Profile;
  highestBidUSD: number;
  reserveUSD: number;
}

export function PendingReviewSheet({
  seller,
  highestBidUSD,
  reserveUSD,
}: PendingReviewSheetProps) {
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setApproved(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const initials = (seller.company_name || seller.display_name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 backdrop-blur-md px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Seller is reviewing the lot"
    >
      <div className="bg-card rounded-3xl shadow-[var(--shadow-lift)] max-w-md w-full p-8 text-center border border-border">
        <p className="text-accent type-micro mb-2">Reserve not met</p>
        <h2 className="font-serif text-2xl text-foreground mb-6">
          Seller is reviewing
        </h2>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div>
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
              Highest bid
            </p>
            <p className="font-mono tabular-nums text-xl font-bold text-foreground">
              {formatPrice(highestBidUSD)}
            </p>
          </div>
          <div className="text-[var(--color-ink-muted)] text-sm">vs</div>
          <div>
            <p className="text-[10px] text-[var(--color-ink-muted)] uppercase tracking-wider">
              Reserve
            </p>
            <p className="font-mono tabular-nums text-xl font-bold text-accent">
              {formatPrice(reserveUSD)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground text-sm">
              {seller.company_name || seller.display_name}
            </p>
            <p className="text-[var(--color-ink-muted)] text-xs">
              {approved ? "Approved closing round" : "Reviewing this lot..."}
            </p>
          </div>
        </div>

        {!approved ? (
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <span
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        ) : (
          <p className="text-[var(--color-success)] font-semibold text-sm">
            ✓ Starting closing round
          </p>
        )}
      </div>
    </div>
  );
}
