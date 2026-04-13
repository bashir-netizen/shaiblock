"use client";

import { useLiveActivityFeed } from "@/hooks/use-simulated-bidding";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Radio } from "lucide-react";

interface ActivityTickerProps {
  lotTitles: string[];
}

function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function actionText(action: string): string {
  switch (action) {
    case "bid":
      return "placed a bid";
    case "won":
      return "won";
    case "listed":
      return "listed";
    case "watched":
      return "is watching";
    default:
      return action;
  }
}

export function ActivityTicker({ lotTitles }: ActivityTickerProps) {
  const events = useLiveActivityFeed(lotTitles, true);
  const visible = events.slice(0, 8);

  return (
    <section className="bg-card border-y border-border py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-danger opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-danger" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground">
              <span className="font-bold">Live</span> on ShaiBlock
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 text-danger text-[10px] font-bold uppercase tracking-wider border border-danger/20">
              <Radio className="h-3 w-3" />
              Streaming
            </span>
          </div>
          <p className="text-sm text-muted">Real-time bids from retailers across Sudan</p>
        </div>

        {/* Vertical stream of events — newest at top */}
        <div className="relative rounded-2xl border border-border bg-background/50 backdrop-blur-sm overflow-hidden">
          <div className="divide-y divide-border/60 max-h-[380px] overflow-hidden">
            {visible.map((event, idx) => (
              <div
                key={event.id}
                className="flex items-center gap-4 px-5 py-4 transition-all"
                style={{
                  opacity: idx === 0 ? 1 : Math.max(1 - idx * 0.08, 0.45),
                }}
              >
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-xs font-bold tabular-nums shrink-0 ring-2 ring-white shadow-sm">
                  {initials(event.buyer_name)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="font-semibold">{event.buyer_name}</span>
                    <span className="text-muted"> from </span>
                    <span className="font-medium">{event.buyer_city}</span>
                    <span className="text-muted"> {actionText(event.action)} </span>
                    {event.amount !== undefined && event.action === "bid" && (
                      <>
                        <span className="text-muted">of </span>
                        <span className="font-bold text-primary tabular-nums">
                          {formatPrice(event.amount)}/kg
                        </span>
                        <span className="text-muted"> on </span>
                      </>
                    )}
                    {event.action === "won" && (
                      <span className="text-muted"> </span>
                    )}
                    <span className="font-medium text-foreground/80 truncate">
                      {event.lot_title}
                    </span>
                  </p>
                </div>

                {/* Timestamp */}
                <div className="shrink-0 text-xs text-muted tabular-nums font-mono">
                  {timeAgo(new Date(event.timestamp).toISOString())}
                </div>
              </div>
            ))}
          </div>

          {/* Fade overlay at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      </div>
    </section>
  );
}
