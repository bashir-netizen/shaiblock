"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import { lots, counterOffers } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import {
  Radio,
  ClipboardCheck,
  DollarSign,
  BarChart3,
  Plus,
} from "lucide-react";

export default function SellerDashboard() {
  const { user } = useAuth();
  const sellerId = user?.id ?? "s1";

  const myLots = lots.filter((l) => l.seller_id === sellerId);
  const liveLots = myLots.filter((l) => l.status === "active");
  const pendingReview = myLots.filter((l) => l.status === "pending_review");
  const counterOfferLots = myLots.filter(
    (l) => l.status === "counter_offer"
  );
  const myCounterOffers = counterOffers.filter(
    (co) => co.seller_id === sellerId && co.status === "sent"
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Seller Dashboard</h1>
        <Link
          href="/dashboard/seller/lots/new"
          className="inline-flex items-center gap-2 bg-accent text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-accent-light transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Lot
        </Link>
      </div>

      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            icon: Radio,
            label: "Live Lots",
            value: liveLots.length,
            color: "text-success",
          },
          {
            icon: ClipboardCheck,
            label: "Pending Review",
            value: pendingReview.length,
            color: "text-accent",
          },
          {
            icon: BarChart3,
            label: "Total Sold",
            value: 142,
            color: "text-primary",
          },
          {
            icon: DollarSign,
            label: "Revenue This Month",
            value: "$4,280",
            color: "text-primary",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-sm text-muted">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* ── Live Lots ── */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Your Live Lots</h2>
        {liveLots.length === 0 ? (
          <p className="text-muted text-sm">No live lots at the moment.</p>
        ) : (
          <div className="space-y-3">
            {liveLots.map((lot) => (
              <Link
                key={lot.id}
                href={`/auctions/${lot.id}`}
                className="flex items-center justify-between bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="font-medium">{lot.title}</p>
                  <p className="text-sm text-muted mt-1">
                    Current bid: {formatPrice(lot.current_high_bid ?? lot.starting_price_per_kg)}/kg
                    {" | "}
                    {lot.bid_count} bids
                  </p>
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-3 py-1 rounded-full">
                  Live
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Pending Counter-Offers ── */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          Pending Counter-Offers
        </h2>
        {counterOfferLots.length === 0 && myCounterOffers.length === 0 ? (
          <p className="text-muted text-sm">No pending counter-offers.</p>
        ) : (
          <div className="space-y-3">
            {counterOfferLots.map((lot) => (
              <div
                key={lot.id}
                className="flex items-center justify-between bg-card border border-border rounded-lg p-4"
              >
                <div>
                  <p className="font-medium">{lot.title}</p>
                  <p className="text-sm text-muted mt-1">
                    Highest bid: {formatPrice(lot.current_high_bid ?? 0)}/kg
                    {" | "}
                    Reserve: {formatPrice(lot.reserve_price_per_kg)}/kg
                  </p>
                </div>
                <button
                  onClick={() => alert("Counter-offer form coming soon!")}
                  className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-light transition-colors"
                >
                  Send Counter
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
