"use client";

import { useState, useEffect } from "react";
import { ChevronUp, Eye, Users, Gavel, ShoppingCart, Zap } from "lucide-react";
import type { Lot } from "@/lib/types";
import { BID_INCREMENTS, BUYER_PREMIUM_PCT } from "@/lib/constants";
import { cn, formatPrice, formatCountdown, getCountdownColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/toast-system";
import { PriceDisplay } from "@/components/price-display";

interface BidPanelProps {
  lot: Lot;
  initialHighBid: number;
  currentHigh: number;
  newBidFlash: boolean;
  bidCount: number;
  /**
   * Callback invoked when the user places a bid via quick-bid pill or
   * custom-bid button. Wired into useSimulatedBidding.placeInvestorBid
   * in the parent. If omitted, bidding is toast-only (demo preview mode).
   */
  onPlaceInvestorBid?: (amount: number, kgRequested?: number) => void;
  /**
   * Mobile display mode.
   * - 'collapsible' (default): legacy collapsed-row + tap-to-expand sheet.
   * - 'pinned': always-expanded compact layout, fixed to bottom. Used on
   *   the lot detail page (sandwich layout) so bidding is one tap away
   *   without the user having to tap-to-expand first.
   * Desktop layout is unaffected by this prop.
   */
  mobileMode?: "collapsible" | "pinned";
}

export function BidPanel({
  lot,
  initialHighBid,
  currentHigh,
  newBidFlash,
  bidCount,
  onPlaceInvestorBid,
  mobileMode = "collapsible",
}: BidPanelProps) {
  const { showToast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [customBid, setCustomBid] = useState("");
  // Compute countdown on the client only (post-hydration) to avoid
  // server/client clock mismatch warnings.
  const [countdown, setCountdown] = useState<string>("--:--");
  const [countdownColor, setCountdownColor] = useState<string>("text-success");
  useEffect(() => {
    const update = () => {
      setCountdown(formatCountdown(lot.auction_end));
      setCountdownColor(getCountdownColor(lot.auction_end));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lot.auction_end]);

  const handleBid = (amount: number) => {
    // Actually place the bid via the parent's useSimulatedBidding callback.
    onPlaceInvestorBid?.(amount);
    showToast({
      type: "success",
      title: "Bid placed!",
      body: `${formatPrice(amount)}/kg — you're the high bidder`,
    });
  };

  const handleCustomBid = () => {
    const val = parseFloat(customBid);
    if (!isNaN(val) && val > currentHigh) {
      handleBid(val);
      setCustomBid("");
    } else {
      handleBid(currentHigh + lot.bid_increment);
    }
  };

  const handleBuyNow = () => {
    if (!lot.buy_now_price_per_kg) return;
    showToast({
      type: "success",
      title: "Buy Now initiated",
      body: `Locking lot at ${formatPrice(lot.buy_now_price_per_kg)}/kg`,
    });
  };

  const minNextBid = currentHigh + lot.bid_increment;

  // ============================================================
  // PINNED MOBILE MODE — compact always-expanded layout
  // Used on the lot detail sandwich layout. No collapse/expand toggle.
  // Desktop rendering falls through to the legacy block below (unchanged).
  // ============================================================
  if (mobileMode === "pinned") {
    return (
      <>
        {/* Fixed bottom, always expanded, compact */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-2xl">
          <div className="max-w-3xl mx-auto px-4 pt-2.5 pb-3 space-y-2">
            {/* Row 1: price + countdown (labels dropped; values self-explanatory) */}
            <div className="flex items-end justify-between gap-3">
              <PriceDisplay
                amountUSD={currentHigh}
                size="lg"
                perKg
                className={cn(
                  "text-primary transition-colors rounded-md px-1 -mx-1",
                  newBidFlash && "animate-flash-green"
                )}
              />
              <p
                className={cn(
                  "font-mono tabular-nums font-bold text-3xl leading-none text-[var(--color-primary)]",
                  countdownColor
                )}
              >
                {countdown}
              </p>
            </div>

            {/* Row 2: quick-bid pills */}
            <div className="flex gap-2">
              {BID_INCREMENTS.map((inc) => (
                <button
                  key={inc}
                  onClick={() => handleBid(currentHigh + inc)}
                  className="flex-1 min-h-10 py-2.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-[#dcfce7] text-sm font-bold transition-all duration-200"
                >
                  +{formatPrice(inc)}
                </button>
              ))}
            </div>

            {/* Row 3: custom bid input */}
            <input
              type="number"
              step="0.01"
              placeholder={`Min ${formatPrice(minNextBid)}`}
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              className="w-full border-2 border-border rounded-xl px-4 py-2 text-lg tabular-nums font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />

            {/* Row 4: place bid */}
            <button
              onClick={handleCustomBid}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hot)] text-white rounded-xl py-2.5 text-base font-bold shadow-lg shadow-accent/20 transition-all duration-200 flex items-center justify-center gap-2 min-h-11"
            >
              <Gavel className="w-5 h-5" />
              PLACE BID
            </button>

            {/* Row 5: buy now (only if price set) */}
            {lot.buy_now_price_per_kg && (
              <button
                onClick={handleBuyNow}
                className="w-full bg-success/10 hover:bg-success hover:text-white text-success border border-success/30 rounded-xl py-1.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now {formatPrice(lot.buy_now_price_per_kg)}/kg
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ============================================================
  // LEGACY COLLAPSIBLE MODE — used when mobileMode !== 'pinned'
  // Keeps the old collapsed-row + tap-to-expand behavior.
  // ============================================================
  return (
    <div className="sticky bottom-0 bg-card border-t border-border shadow-2xl z-30 md:relative md:border md:border-border md:rounded-2xl md:shadow-lg md:shadow-primary/5">
      {/* Collapsed state (mobile only) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 md:hidden"
      >
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">
              Current bid
            </p>
            <PriceDisplay
              amountUSD={currentHigh}
              size="md"
              perKg
              className={cn(
                "text-primary transition-colors rounded-md px-1 -mx-1",
                newBidFlash && "animate-flash-green"
              )}
            />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">
              Ends in
            </p>
            <p className={cn("font-mono text-lg font-bold tabular-nums", countdownColor)}>
              {countdown}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/10 text-accent px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Zap className="w-3 h-3" /> Tap to bid
          </span>
          <ChevronUp
            className={cn(
              "w-5 h-5 text-muted transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 md:max-h-none md:opacity-100",
          expanded
            ? "max-h-[640px] opacity-100"
            : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
        )}
      >
        <div className="p-5 md:p-6 space-y-5">
          {/* Stats row (top) */}
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{bidCount}</span>
                <span>bids</span>
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-semibold text-foreground">{lot.watch_count}</span>
                <span>watching</span>
              </span>
              <span className="hidden sm:flex items-center gap-1">
                <span className="font-semibold text-foreground">{lot.view_count}</span>
                <span>views</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 text-success font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              LIVE
            </span>
          </div>

          {/* Price + countdown (desktop) */}
          <div className="hidden md:flex items-end justify-between gap-4 pb-4 border-b border-border">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-1">
                Current high bid
              </p>
              <PriceDisplay
                amountUSD={currentHigh}
                size="xl"
                perKg
                className={cn(
                  "text-primary transition-colors rounded-lg px-1 -mx-1",
                  newBidFlash && "animate-flash-green"
                )}
              />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">
                Ends in
              </p>
              <p
                className={cn(
                  "font-mono tabular-nums font-bold text-3xl md:text-4xl leading-none",
                  countdownColor
                )}
              >
                {countdown}
              </p>
            </div>
          </div>

          {/* Mobile inline price flash */}
          <div className="md:hidden flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-1">
                Current high bid
              </p>
              <PriceDisplay
                amountUSD={currentHigh}
                size="lg"
                perKg
                className={cn(
                  "text-primary transition-colors rounded-lg px-1 -mx-1",
                  newBidFlash && "animate-flash-green"
                )}
              />
            </div>
            <p className={cn("font-mono text-2xl font-bold tabular-nums", countdownColor)}>
              {countdown}
            </p>
          </div>

          {/* User status */}
          <div>
            {lot.user_is_winning ? (
              <Badge variant="success" size="md">
                YOU&apos;RE WINNING
              </Badge>
            ) : (
              <Badge variant="outline" size="md">
                Place your first bid
              </Badge>
            )}
          </div>

          {/* Quick bid pills — min-h-11 hits the 44px iOS touch-target floor */}
          <div className="flex gap-2">
            {BID_INCREMENTS.map((inc) => (
              <button
                key={inc}
                onClick={() => handleBid(currentHigh + inc)}
                className="flex-1 min-h-11 py-3 rounded-full bg-accent/10 hover:bg-accent hover:text-white text-accent border border-accent/30 text-sm font-bold transition-all duration-200"
              >
                +{formatPrice(inc)}
              </button>
            ))}
          </div>

          {/* Custom bid input */}
          <div>
            <label className="text-[10px] text-muted uppercase tracking-widest font-semibold">
              Custom bid
            </label>
            <input
              type="number"
              step="0.01"
              placeholder={`Min ${formatPrice(minNextBid)}`}
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              className="mt-1 w-full border-2 border-border rounded-xl px-4 py-3 text-xl tabular-nums font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Place bid */}
          <button
            onClick={handleCustomBid}
            className="w-full bg-accent hover:bg-accent-light text-white rounded-xl py-4 text-lg font-bold shadow-lg shadow-accent/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Gavel className="w-5 h-5" />
            PLACE BID
          </button>

          {/* Buy now */}
          {lot.buy_now_price_per_kg && (
            <button
              onClick={handleBuyNow}
              className="w-full bg-success hover:opacity-90 text-white rounded-xl py-4 text-lg font-bold shadow-lg shadow-success/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              BUY NOW at {formatPrice(lot.buy_now_price_per_kg)}/kg
            </button>
          )}

          <p className="text-[10px] text-muted text-center">
            A {BUYER_PREMIUM_PCT}% buyer premium will apply at checkout
          </p>
        </div>
      </div>
    </div>
  );
}
