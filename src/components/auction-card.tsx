"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lot } from "@/lib/types";
import { getCountryFlag, getTimeRemaining } from "@/lib/utils";
import { getLotHeroPhoto } from "@/lib/photos";
import { CountdownTimer } from "@/components/countdown-timer";
import { PriceDisplay } from "@/components/price-display";

export function AuctionCard({ lot }: { lot: Lot }) {
  // Re-render every second so the "urgent" state updates live
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const urgent = getTimeRemaining(lot.auction_end).total < 5 * 60 * 1000;

  return (
    <Link href={`/auctions/${lot.id}`} className="group">
      <article className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        {/* Image area */}
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
          <Image
            src={getLotHeroPhoto(lot.id)}
            alt={lot.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* LIVE badge (top-left) */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-danger/90 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>

          {/* Countdown (top-right) */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full text-white font-mono tabular-nums text-sm font-bold">
            <CountdownTimer endTime={lot.auction_end} size="sm" />
          </div>

          {/* Urgency flame (if < 5 min) */}
          {urgent && (
            <div className="absolute top-14 right-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Flame className="h-3 w-3" />
              ENDING SOON
            </div>
          )}

          {/* Tea type + cupping score (bottom-left) */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur px-2 py-1 rounded-full text-white text-xs font-semibold capitalize">
              {lot.tea_type.replace("_", " ")}
            </span>
            <span className="bg-accent px-2 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
              <Star className="h-3 w-3 fill-white" />
              {lot.cupping.overall.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <span>{getCountryFlag(lot.origin_country)}</span>
            <span className="truncate">
              {lot.origin_region || lot.origin_country}
              {lot.estate_name ? ` · ${lot.estate_name}` : ""}
            </span>
          </div>
          <h3 className="font-serif text-lg text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {lot.title}
          </h3>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
                Current bid
              </div>
              <PriceDisplay
                amountUSD={lot.current_high_bid || lot.starting_price_per_kg}
                size="md"
                perKg
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">{lot.bid_count} bids</div>
              <div className="text-xs text-muted">{lot.total_kg} kg</div>
            </div>
          </div>
          {lot.buy_now_price_per_kg && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-sm">
              <span className="text-muted">Buy Now</span>
              <PriceDisplay
                amountUSD={lot.buy_now_price_per_kg}
                size="sm"
                perKg
                align="right"
                className="text-success"
              />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
