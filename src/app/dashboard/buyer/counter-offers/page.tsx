"use client";

import { useAuth } from "@/components/providers";
import { counterOffers, lots } from "@/lib/mock-data";
import { formatPrice, timeAgo } from "@/lib/utils";
import { BUYER_PREMIUM_PCT } from "@/lib/constants";
import { ArrowLeftRight } from "lucide-react";

export default function CounterOffersPage() {
  const { user } = useAuth();
  const buyerId = user?.id ?? "b1";

  const myOffers = counterOffers.filter(
    (co) => co.buyer_id === buyerId && co.status === "sent"
  );

  const getLot = (lotId: string) => lots.find((l) => l.id === lotId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-bold mb-8">Counter-Offers</h1>

      {myOffers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ArrowLeftRight className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-muted">No pending counter-offers</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOffers.map((co) => {
            const lot = getLot(co.lot_id);
            const totalKg = lot?.total_kg ?? 0;
            const subtotal = co.seller_counter_price * totalKg;
            const premium = subtotal * (BUYER_PREMIUM_PCT / 100);
            const total = subtotal + premium;

            return (
              <div
                key={co.id}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-lg">
                      {lot?.title ?? co.lot_id}
                    </p>
                    <p className="text-sm text-muted mt-0.5">
                      {lot?.lot_number}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full whitespace-nowrap">
                    Expires {timeAgo(co.expires_at)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted">Your Bid</p>
                    <p className="font-semibold">
                      {formatPrice(co.highest_bid_amount)}/kg
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Seller Counter</p>
                    <p className="font-semibold text-accent">
                      {formatPrice(co.seller_counter_price)}/kg
                    </p>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-4 mb-5 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted">
                      {formatPrice(co.seller_counter_price)}/kg x {totalKg} kg
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">
                      Buyer premium ({BUYER_PREMIUM_PCT}%)
                    </span>
                    <span>{formatPrice(premium)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => alert("Counter-offer accepted!")}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => alert("Counter-offer declined.")}
                    className="flex-1 py-2.5 text-sm font-semibold rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
