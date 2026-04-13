"use client";

import { useEffect, useRef, useState } from "react";
import type { Bid } from "@/lib/types";
import { DEMO_BUYER_NAMES, DEMO_BUYER_CITIES } from "@/lib/photos";

// ============================================================
// useSimulatedBidding — the core investor-demo magic
// Every 4-12 seconds, a fake bid arrives from a random "buyer"
// Price climbs by bid_increment each time
// ============================================================

export interface SimulatedBid extends Bid {
  buyer_display_name: string;
  buyer_city: string;
  is_new?: boolean;
}

function randomBuyer() {
  const name =
    DEMO_BUYER_NAMES[Math.floor(Math.random() * DEMO_BUYER_NAMES.length)];
  const city =
    DEMO_BUYER_CITIES[Math.floor(Math.random() * DEMO_BUYER_CITIES.length)];
  return { name, city };
}

export function useSimulatedBidding(opts: {
  lotId: string;
  startingPrice: number;
  bidIncrement: number;
  maxPrice?: number;
  initialBids: Bid[];
  enabled?: boolean;
}) {
  const {
    lotId,
    startingPrice,
    bidIncrement,
    maxPrice,
    initialBids,
    enabled = true,
  } = opts;

  // Build initial simulated bids from the seed data
  const [bids, setBids] = useState<SimulatedBid[]>(() =>
    initialBids.map((b, i) => {
      const { name, city } = randomBuyer();
      return {
        ...b,
        buyer_display_name: `${name.split(" ")[0]} ${name.split(" ")[1]?.[0] || ""}.`,
        buyer_city: city,
      };
    })
  );

  const [currentHigh, setCurrentHigh] = useState(
    initialBids.find((b) => b.is_winning)?.amount_per_kg || startingPrice
  );

  const [lastBidTime, setLastBidTime] = useState<number>(Date.now());
  const [newBidFlash, setNewBidFlash] = useState(false);
  const priceRef = useRef(currentHigh);

  useEffect(() => {
    priceRef.current = currentHigh;
  }, [currentHigh]);

  useEffect(() => {
    if (!enabled) return;

    function scheduleNextBid() {
      // Random interval: 4-12 seconds
      const delay = 4000 + Math.random() * 8000;

      return setTimeout(() => {
        const newAmount = +(
          priceRef.current +
          bidIncrement * (Math.random() > 0.7 ? 2 : 1)
        ).toFixed(2);

        // Don't exceed a reasonable max
        if (maxPrice && newAmount > maxPrice) {
          return;
        }

        const { name, city } = randomBuyer();
        const newBid: SimulatedBid = {
          id: `sim-${Date.now()}-${Math.random()}`,
          lot_id: lotId,
          buyer_id: `sim-buyer-${Math.floor(Math.random() * 1000)}`,
          amount_per_kg: newAmount,
          kg_requested: initialBids[0]?.kg_requested || 1,
          is_winning: true,
          status: "active",
          bid_source: "manual",
          placed_at: new Date().toISOString(),
          buyer_display_name: `${name.split(" ")[0]} ${name.split(" ")[1]?.[0] || ""}.`,
          buyer_city: city,
          is_new: true,
        };

        setBids((prev) => {
          const updated = prev.map((b) => ({
            ...b,
            is_winning: false,
            status: "outbid" as const,
          }));
          return [newBid, ...updated];
        });
        setCurrentHigh(newAmount);
        setLastBidTime(Date.now());
        setNewBidFlash(true);
        setTimeout(() => setNewBidFlash(false), 800);

        scheduleNextBid();
      }, delay);
    }

    const timeoutId = scheduleNextBid();
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, lotId, bidIncrement, maxPrice]);

  return {
    bids,
    currentHigh,
    lastBidTime,
    newBidFlash,
    bidCount: bids.length,
  };
}

// ============================================================
// Global live activity — for the landing page / feed ticker
// Generates fake "someone bid X on Y" events across all lots
// ============================================================

export interface LiveActivityEvent {
  id: string;
  buyer_name: string;
  buyer_city: string;
  action: "bid" | "won" | "listed" | "watched";
  lot_title: string;
  amount?: number;
  timestamp: number;
}

export function useLiveActivityFeed(lotTitles: string[], enabled = true) {
  const [events, setEvents] = useState<LiveActivityEvent[]>(() => {
    // Seed with 5 initial events
    return Array.from({ length: 5 }, (_, i) => {
      const { name, city } = randomBuyer();
      return {
        id: `seed-${i}`,
        buyer_name: name,
        buyer_city: city,
        action: "bid" as const,
        lot_title: lotTitles[Math.floor(Math.random() * lotTitles.length)] || "Tea Lot",
        amount: +(2 + Math.random() * 20).toFixed(2),
        timestamp: Date.now() - i * 1000 * 60,
      };
    });
  });

  useEffect(() => {
    if (!enabled || lotTitles.length === 0) return;

    const interval = setInterval(
      () => {
        const { name, city } = randomBuyer();
        const actions: LiveActivityEvent["action"][] = [
          "bid",
          "bid",
          "bid",
          "watched",
          "won",
        ];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const lot = lotTitles[Math.floor(Math.random() * lotTitles.length)];

        const newEvent: LiveActivityEvent = {
          id: `${Date.now()}-${Math.random()}`,
          buyer_name: name,
          buyer_city: city,
          action,
          lot_title: lot,
          amount: action !== "watched" ? +(2 + Math.random() * 25).toFixed(2) : undefined,
          timestamp: Date.now(),
        };

        setEvents((prev) => [newEvent, ...prev].slice(0, 15));
      },
      3000 + Math.random() * 3000
    );

    return () => clearInterval(interval);
  }, [enabled, lotTitles]);

  return events;
}
