"use client";

import Link from "next/link";
import { getActiveLots } from "@/lib/mock-data";
import { formatPrice, getCountryFlag } from "@/lib/utils";
import { Eye } from "lucide-react";

export default function WatchlistPage() {
  const watchedLots = getActiveLots().slice(0, 2);

  if (watchedLots.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-serif font-bold mb-8">Your Watchlist</h1>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Eye className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-muted">No items in watchlist</p>
          <Link
            href="/auctions"
            className="mt-4 inline-block text-sm text-primary font-medium hover:underline"
          >
            Browse auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-bold mb-8">Your Watchlist</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {watchedLots.map((lot) => (
          <Link
            key={lot.id}
            href={`/auctions/${lot.id}`}
            className="block bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-muted mb-1">{lot.lot_number}</p>
            <h3 className="font-semibold mb-2 line-clamp-1">{lot.title}</h3>
            <p className="text-sm text-muted mb-3">
              {getCountryFlag(lot.origin_country)} {lot.origin_country} /{" "}
              {lot.origin_region}
            </p>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-primary tabular-nums">
                {formatPrice(lot.current_high_bid ?? lot.starting_price_per_kg)}
                <span className="text-sm font-normal text-muted">/kg</span>
              </span>
              <span className="text-xs text-accent font-medium">
                {lot.bid_count} bids
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
