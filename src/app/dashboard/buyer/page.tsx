"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers";
import {
  bids,
  lots,
  orders,
  counterOffers,
} from "@/lib/mock-data";
import { formatPrice, timeAgo } from "@/lib/utils";
import {
  Gavel,
  Trophy,
  ArrowLeftRight,
  Package,
} from "lucide-react";

const statusBadge: Record<string, string> = {
  winning: "bg-success/10 text-success",
  outbid: "bg-danger/10 text-danger",
  active: "bg-primary/10 text-primary",
  won: "bg-success/10 text-success",
  lost: "bg-muted/20 text-muted",
};

const fulfillmentBadge: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  processing: "bg-accent/10 text-accent",
  shipped: "bg-primary/10 text-primary",
  in_transit: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  confirmed: "bg-success/10 text-success",
  disputed: "bg-danger/10 text-danger",
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const buyerId = user?.id ?? "b1";

  const myBids = bids.filter((b) => b.buyer_id === buyerId);
  const activeBids = myBids.filter((b) => b.status === "active");
  const wonBids = myBids.filter((b) => b.status === "won");
  const myCounterOffers = counterOffers.filter(
    (co) => co.buyer_id === buyerId && co.status === "sent"
  );
  const myOrders = orders.filter((o) => o.buyer_id === buyerId);

  const getLot = (lotId: string) => lots.find((l) => l.id === lotId);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-bold mb-8">Buyer Dashboard</h1>

      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            icon: Gavel,
            label: "Active Bids",
            value: activeBids.length,
            color: "text-primary",
          },
          {
            icon: Trophy,
            label: "Won",
            value: wonBids.length,
            color: "text-success",
          },
          {
            icon: ArrowLeftRight,
            label: "Pending Counter-Offers",
            value: myCounterOffers.length,
            color: "text-accent",
          },
          {
            icon: Package,
            label: "Orders",
            value: myOrders.length,
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

      {/* ── Active Bids ── */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Your Active Bids</h2>
        {activeBids.length === 0 ? (
          <p className="text-muted text-sm">You have no active bids.</p>
        ) : (
          <div className="space-y-3">
            {activeBids.map((bid) => {
              const lot = getLot(bid.lot_id);
              if (!lot) return null;
              const winning = bid.is_winning;
              return (
                <Link
                  key={bid.id}
                  href={`/auctions/${bid.lot_id}`}
                  className="flex items-center justify-between bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <p className="font-medium">{lot.title}</p>
                    <p className="text-sm text-muted mt-1">
                      Your bid: {formatPrice(bid.amount_per_kg)}/kg
                      {" | "}
                      Current high: {formatPrice(lot.current_high_bid ?? 0)}/kg
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      winning
                        ? statusBadge.winning
                        : statusBadge.outbid
                    }`}
                  >
                    {winning ? "Winning" : "Outbid"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Pending Counter-Offers ── */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Pending Counter-Offers</h2>
        {myCounterOffers.length === 0 ? (
          <p className="text-muted text-sm">No pending counter-offers.</p>
        ) : (
          <div className="space-y-3">
            {myCounterOffers.map((co) => {
              const lot = getLot(co.lot_id);
              return (
                <div
                  key={co.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">
                        {lot?.title ?? co.lot_id}
                      </p>
                      <p className="text-sm text-muted mt-1">
                        Your bid: {formatPrice(co.highest_bid_amount)}/kg
                        {" | "}
                        Seller counter: {formatPrice(co.seller_counter_price)}/kg
                      </p>
                    </div>
                    <span className="text-xs text-accent font-medium whitespace-nowrap">
                      Expires {timeAgo(co.expires_at)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert("Counter-offer accepted!")}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-success text-white hover:bg-success/90 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => alert("Counter-offer declined.")}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-danger text-white hover:bg-danger/90 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Recent Orders ── */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {myOrders.length === 0 ? (
          <p className="text-muted text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {myOrders.map((order) => {
              const lot = getLot(order.lot_id);
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-card border border-border rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {lot?.title ?? order.lot_id} &mdash;{" "}
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                      fulfillmentBadge[order.fulfillment_status] ??
                      "bg-muted/20 text-muted"
                    }`}
                  >
                    {order.fulfillment_status.replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
