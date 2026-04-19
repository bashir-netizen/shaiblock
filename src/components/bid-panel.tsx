"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronUp, Gavel, ShoppingCart } from "lucide-react";
import type { Lot } from "@/lib/types";
import { BID_INCREMENTS } from "@/lib/constants";
import { cn, formatPrice, formatCountdown, getCountdownColor } from "@/lib/utils";
import { useToast } from "@/components/toast-system";
import { PriceDisplay } from "@/components/price-display";

interface BidPanelProps {
  lot: Lot;
  currentHigh: number;
  newBidFlash: boolean;
  onPlaceInvestorBid?: (amount: number, kgRequested?: number) => void;
}

export function BidPanel({
  lot,
  currentHigh,
  newBidFlash,
  onPlaceInvestorBid,
}: BidPanelProps) {
  const { showToast } = useToast();
  const [customBid, setCustomBid] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

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

  // Close the sheet when the user clicks outside it (but not when clicking
  // on the compact bar itself — that's where the chevron lives).
  useEffect(() => {
    if (!sheetOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sheetRef.current?.contains(target)) return;
      if (barRef.current?.contains(target)) return;
      setSheetOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [sheetOpen]);

  const handleBid = (amount: number) => {
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
    setSheetOpen(false);
  };

  const handleBuyNow = () => {
    if (!lot.buy_now_price_per_kg) return;
    showToast({
      type: "success",
      title: "Buy Now initiated",
      body: `Locking lot at ${formatPrice(lot.buy_now_price_per_kg)}/kg`,
    });
    setSheetOpen(false);
  };

  const minNextBid = currentHigh + lot.bid_increment;

  return (
    <>
      {sheetOpen && (
        <div
          ref={sheetRef}
          className="fixed inset-x-0 bottom-[96px] z-40 bg-card border-t border-border shadow-2xl animate-slide-up-in"
        >
          <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
            <input
              type="number"
              step="0.01"
              placeholder={`Min ${formatPrice(minNextBid)}`}
              value={customBid}
              onChange={(e) => setCustomBid(e.target.value)}
              aria-label="Custom bid amount per kilogram"
              className="w-full border-2 border-border rounded-xl px-4 py-2 text-lg tabular-nums font-mono bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />

            <button
              onClick={handleCustomBid}
              className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hot)] text-white rounded-xl py-2.5 text-base font-bold shadow-lg shadow-accent/20 transition-all duration-200 flex items-center justify-center gap-2 min-h-11"
            >
              <Gavel className="w-5 h-5" />
              PLACE BID
            </button>

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
      )}

      <div
        ref={barRef}
        className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border shadow-2xl animate-slide-up-in"
      >
        <div className="max-w-3xl mx-auto px-4 pt-2 pb-3 space-y-2">
          {/* Row 1: price + countdown */}
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

          {/* Row 2: quick-bid pills + expand chevron */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 min-w-0 gap-1.5">
              {BID_INCREMENTS.map((inc) => (
                <button
                  key={inc}
                  onClick={() => handleBid(currentHigh + inc)}
                  className="flex-1 min-w-0 min-h-10 py-2.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-[#dcfce7] text-sm font-bold transition-all duration-200"
                >
                  +{formatPrice(inc)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSheetOpen((v) => !v)}
              aria-label={sheetOpen ? "Hide advanced bid options" : "Show advanced bid options"}
              aria-expanded={sheetOpen}
              className="shrink-0 w-10 h-10 rounded-full border border-border text-muted hover:text-foreground hover:border-foreground/40 transition-colors flex items-center justify-center"
            >
              <ChevronUp
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  sheetOpen && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
