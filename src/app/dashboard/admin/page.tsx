"use client";

import {
  Radio,
  CheckCircle2,
  Scale,
  DollarSign,
  Coins,
  ArrowLeftRight,
  AlertTriangle,
  Users,
  Activity,
} from "lucide-react";

const overviewCards = [
  { icon: Radio, label: "Live Auctions", value: 8, color: "text-success" },
  { icon: CheckCircle2, label: "Settled Today", value: 3, color: "text-primary" },
  { icon: Scale, label: "Kg Sold Today", value: 450, color: "text-primary" },
  { icon: DollarSign, label: "GMV Today", value: "$2,840", color: "text-primary" },
  { icon: Coins, label: "Platform Revenue", value: "$213", color: "text-success" },
  { icon: ArrowLeftRight, label: "Active Counter-Offers", value: 1, color: "text-accent" },
  { icon: AlertTriangle, label: "Open Disputes", value: 0, color: "text-danger" },
  { icon: Users, label: "Registered Users", value: 26, color: "text-primary" },
];

const recentActivity = [
  { id: 1, text: "Lot SB-2026-00142 went live", time: "3 min ago" },
  { id: 2, text: "Khartoum Shai House won lot SB-2026-00130", time: "5 hours ago" },
  { id: 3, text: "Counter-offer sent on lot SB-2026-00131", time: "10 min ago" },
  { id: 4, text: "Wholesaler KYC approved: Kassala Premium Tea", time: "1 day ago" },
  { id: 5, text: "Order ORD-2026-00089 delivery confirmed in Omdurman", time: "1 day ago" },
];

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-bold mb-8">Admin Dashboard</h1>

      {/* ── Overview Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {overviewCards.map((card) => (
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

      {/* ── Lot Review Queue ── */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Lot Review Queue</h2>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <CheckCircle2 className="h-10 w-10 text-success mx-auto mb-3" />
          <p className="text-muted">No lots pending review</p>
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {recentActivity.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 px-5 py-4"
            >
              <Activity className="h-4 w-4 text-muted shrink-0" />
              <p className="text-sm flex-1">{event.text}</p>
              <span className="text-xs text-muted whitespace-nowrap">
                {event.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
