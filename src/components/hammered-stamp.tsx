"use client";

import { formatPrice, formatSDG } from "@/lib/utils";
import { Gavel } from "@/components/icons/tea";

// ============================================================
// HammeredStamp — full-screen SOLD overlay (3 seconds)
// Fires when useAuctionClock transitions phase → 'hammered'
// ============================================================

interface HammeredStampProps {
  winnerName: string;
  winnerCity: string;
  pricePerKgUSD: number;
  totalKg: number;
  isInvestor: boolean;
}

export function HammeredStamp({
  winnerName,
  winnerCity,
  pricePerKgUSD,
  totalKg,
  isInvestor,
}: HammeredStampProps) {
  const total = +(pricePerKgUSD * totalKg).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-primary/95 backdrop-blur-md"
      role="status"
      aria-live="assertive"
      style={{
        backgroundImage: "url(/textures/wax-noise.svg)",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="text-center px-6 animate-stamp-land">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gavel size={32} className="text-[var(--color-gold)]" />
          <p className="text-[var(--color-gold)] text-xs uppercase tracking-[0.3em] font-bold">
            {isInvestor ? "You won" : "Sold"}
          </p>
          <Gavel size={32} className="text-[var(--color-gold)]" />
        </div>
        <h1
          className="font-serif font-black text-white text-[20vw] md:text-[14rem] leading-none tracking-tight"
          style={{ transform: "rotate(-4deg)" }}
        >
          SOLD
        </h1>
        <p className="font-serif text-white/95 text-3xl md:text-5xl mt-6 tabular-nums">
          {formatPrice(pricePerKgUSD)}
          <span className="text-xl md:text-2xl text-white/70">/kg</span>
        </p>
        <p className="font-sans text-white/80 text-base md:text-lg mt-2">
          × {totalKg} kg = {formatPrice(total)}{" "}
          <span className="text-white/50">/ {formatSDG(total)}</span>
        </p>
        <p className="font-sans text-[var(--color-gold)] text-sm md:text-base mt-6 uppercase tracking-widest font-semibold">
          {winnerName} · {winnerCity}
        </p>
      </div>
    </div>
  );
}
