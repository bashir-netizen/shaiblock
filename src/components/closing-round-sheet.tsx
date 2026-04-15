"use client";

import { Zap } from "lucide-react";
import type { SimulatedBid } from "@/hooks/use-simulated-bidding";
import type { Lot } from "@/lib/types";
import { cn, formatPrice, formatSDG } from "@/lib/utils";
import { BUYER_PREMIUM_PCT } from "@/lib/constants";

// ============================================================
// ClosingRoundSheet — head-to-head bidding overlay
// Shown when useAuctionClock.phase === 'closing_round'
// ============================================================

const ESTIMATED_SHIPPING_USD = 14;

interface ClosingRoundSheetProps {
  lot: Lot;
  topTwo: [investor: SimulatedBid, opponent: SimulatedBid];
  closingRoundBids: SimulatedBid[];
  msRemaining: number;
  extendedCount: number;
  onPlaceBid: (amount: number) => void;
  onConcede: () => void;
}

function formatMMSS(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function BidderColumn({
  bid,
  isWinning,
  isInvestor,
}: {
  bid: SimulatedBid;
  isWinning: boolean;
  isInvestor: boolean;
}) {
  const initials = bid.buyer_display_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex-1 rounded-2xl p-4 md:p-6 border-2 transition-all duration-300",
        isWinning
          ? "bg-[var(--color-success)]/10 border-[var(--color-success)] shadow-lg shadow-[var(--color-success)]/20 scale-[1.02]"
          : "bg-card/50 border-border"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm md:text-base mx-auto mb-3",
          isWinning
            ? "bg-[var(--color-success)] text-white"
            : "bg-muted/30 text-foreground"
        )}
      >
        {initials}
      </div>
      <p className="text-center font-semibold text-sm md:text-base text-foreground truncate">
        {isInvestor ? "YOU" : bid.buyer_display_name}
      </p>
      <p className="text-center text-[10px] md:text-xs text-[var(--color-ink-muted)] mb-3">
        {bid.buyer_city}
      </p>
      <p className="text-center font-serif text-2xl md:text-4xl font-bold text-foreground tabular-nums">
        {formatPrice(bid.amount_per_kg)}
      </p>
      <p className="text-center text-[10px] md:text-xs text-[var(--color-ink-muted)] mt-0.5">
        per kg
      </p>
      <div className="mt-3 text-center">
        <span
          className={cn(
            "inline-block text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            isWinning
              ? "bg-[var(--color-success)] text-white"
              : "bg-muted/20 text-[var(--color-ink-muted)]"
          )}
        >
          {isWinning ? "Winning" : "Outbid"}
        </span>
      </div>
    </div>
  );
}

export function ClosingRoundSheet({
  lot,
  topTwo,
  closingRoundBids,
  msRemaining,
  extendedCount,
  onPlaceBid,
  onConcede,
}: ClosingRoundSheetProps) {
  // Current state from closingRoundBids
  const allBids = closingRoundBids.length > 0 ? closingRoundBids : topTwo;
  const highest = allBids.reduce(
    (hi, b) => (b.amount_per_kg > hi.amount_per_kg ? b : hi),
    allBids[0]
  );
  const investorCurrent =
    allBids
      .filter((b) => b.is_investor)
      .reduce(
        (hi, b) => (b.amount_per_kg > hi.amount_per_kg ? b : hi),
        topTwo[0]
      );
  const opponentCurrent =
    allBids
      .filter((b) => !b.is_investor)
      .reduce(
        (hi, b) => (b.amount_per_kg > hi.amount_per_kg ? b : hi),
        topTwo[1]
      );

  const investorIsWinning = highest.is_investor === true;
  const nextBidAmount = +(highest.amount_per_kg + lot.bid_increment).toFixed(2);

  // Landed cost preview
  const subtotal = +(nextBidAmount * lot.total_kg).toFixed(2);
  const premium = +((subtotal * BUYER_PREMIUM_PCT) / 100).toFixed(2);
  const landed = +(subtotal + premium + ESTIMATED_SHIPPING_USD).toFixed(2);

  const lowSeconds = msRemaining < 10_000;

  return (
    <div
      className="fixed inset-0 z-[220] bg-gradient-to-br from-primary/95 via-primary/85 to-accent/30 backdrop-blur-lg flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Closing round — two bidders remain"
    >
      {/* Header */}
      <div className="pt-8 px-6 text-center shrink-0">
        <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-3 py-1 mb-3">
          <Zap className="w-3.5 h-3.5 text-[var(--color-gold)]" />
          <p className="text-[var(--color-gold)] text-[10px] uppercase tracking-widest font-bold">
            Closing Round
          </p>
          <Zap className="w-3.5 h-3.5 text-[var(--color-gold)]" />
        </div>
        <h2 className="font-serif text-white text-3xl md:text-5xl font-bold leading-tight">
          Two bidders remain
        </h2>
      </div>

      {/* Bidder columns */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-6">
        <div className="w-full max-w-3xl grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-stretch">
          <BidderColumn
            bid={investorCurrent}
            isWinning={investorIsWinning}
            isInvestor={true}
          />
          <div className="flex items-center justify-center text-white font-serif text-xl md:text-3xl italic">
            vs
          </div>
          <BidderColumn
            bid={opponentCurrent}
            isWinning={!investorIsWinning}
            isInvestor={false}
          />
        </div>
      </div>

      {/* Countdown + landed cost */}
      <div className="shrink-0 px-6 pb-4 text-center">
        <p
          className={cn(
            "font-mono tabular-nums font-bold text-5xl md:text-6xl transition-colors",
            lowSeconds
              ? "text-[var(--color-gold)] animate-pulse-danger"
              : "text-white"
          )}
          aria-live="off"
        >
          {formatMMSS(msRemaining)}
        </p>
        {extendedCount > 0 && (
          <p className="text-[var(--color-gold)] text-xs uppercase tracking-widest font-bold mt-1">
            Extended +{extendedCount * 15}s
          </p>
        )}
        <p className="text-white/70 text-xs mt-2">
          Subtotal {formatPrice(subtotal)} + Premium {formatPrice(premium)} +
          Ship {formatPrice(ESTIMATED_SHIPPING_USD)} ={" "}
          <span className="font-bold text-white">{formatPrice(landed)}</span> /{" "}
          <span className="text-white/60">{formatSDG(landed)}</span>
        </p>
      </div>

      {/* Primary CTA */}
      <div className="shrink-0 px-4 md:px-12 pb-6">
        <button
          onClick={() => onPlaceBid(nextBidAmount)}
          disabled={investorIsWinning}
          className={cn(
            "w-full rounded-xl py-5 font-bold text-lg shadow-xl transition-all",
            investorIsWinning
              ? "bg-white/10 text-white/60 cursor-not-allowed"
              : "bg-accent hover:bg-[var(--color-accent-hot)] text-white shadow-accent/30"
          )}
        >
          {investorIsWinning
            ? `You're winning at ${formatPrice(investorCurrent.amount_per_kg)}/kg`
            : `Raise to ${formatPrice(nextBidAmount)}/kg`}
        </button>
        <button
          onClick={onConcede}
          className="w-full text-white/70 hover:text-white text-sm mt-4 underline-offset-2 hover:underline"
        >
          Let it go — concede
        </button>
      </div>
    </div>
  );
}
