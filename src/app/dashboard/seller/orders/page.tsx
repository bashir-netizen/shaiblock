"use client";

import { useAuth } from "@/components/providers";
import { orders, lots } from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import { Package, Truck } from "lucide-react";

const fulfillmentBadge: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  processing: "bg-accent/10 text-accent",
  shipped: "bg-primary/10 text-primary",
  in_transit: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  confirmed: "bg-success/10 text-success",
  disputed: "bg-danger/10 text-danger",
};

const paymentBadge: Record<string, string> = {
  pending: "bg-accent/10 text-accent",
  escrow: "bg-primary/10 text-primary",
  released: "bg-success/10 text-success",
  refunded: "bg-muted/20 text-muted",
  disputed: "bg-danger/10 text-danger",
};

export default function SellerOrdersPage() {
  const { user } = useAuth();
  const sellerId = user?.id ?? "s1";
  const myOrders = orders.filter((o) => o.seller_id === sellerId);

  const getLot = (lotId: string) => lots.find((l) => l.id === lotId);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-bold mb-8">Seller Orders</h1>

      {myOrders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Package className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-muted">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const lot = getLot(order.lot_id);
            const canShip =
              order.fulfillment_status === "pending" ||
              order.fulfillment_status === "processing";
            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.order_number}</p>
                    <p className="text-sm text-muted mt-0.5">
                      {lot?.title ?? order.lot_id}
                    </p>
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    {formatPrice(order.seller_payout)}
                    <span className="text-xs font-normal text-muted ml-1">
                      payout
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm mb-4">
                  <span className="text-muted">
                    {formatPrice(order.price_per_kg)}/kg x {order.total_kg} kg
                  </span>
                  <span className="text-muted">|</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      fulfillmentBadge[order.fulfillment_status] ??
                      "bg-muted/20 text-muted"
                    }`}
                  >
                    {order.fulfillment_status.replace("_", " ")}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      paymentBadge[order.payment_status] ??
                      "bg-muted/20 text-muted"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
                {canShip && (
                  <button
                    onClick={() => alert("Marked as shipped!")}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-light transition-colors"
                  >
                    <Truck className="h-4 w-4" />
                    Mark Shipped
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
