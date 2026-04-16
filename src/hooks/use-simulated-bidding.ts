"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Bid } from "@/lib/types";
import { DEMO_BUYER_NAMES, DEMO_BUYER_CITIES } from "@/lib/photos";

// Sim bidders pause for this long after the investor places a bid,
// so the user gets a moment of "I'm winning" before competition resumes.
const INVESTOR_BID_PAUSE_MS = 1_500;

// ============================================================
// useSimulatedBidding — the core investor-demo magic
// Every ~0.8-1.8 seconds, a fake bid arrives from a random "buyer"
// Price climbs by bid_increment each time (55% chance of 2x jumps)
// ============================================================

export interface SimulatedBid extends Bid {
  buyer_display_name: string;
  buyer_city: string;
  is_new?: boolean;
  is_investor?: boolean;
}

function randomBuyer() {
  const name =
    DEMO_BUYER_NAMES[Math.floor(Math.random() * DEMO_BUYER_NAMES.length)];
  const city =
    DEMO_BUYER_CITIES[Math.floor(Math.random() * DEMO_BUYER_CITIES.length)];
  return { name, city };
}

function buyerHandle(fullName: string): string {
  const [first, last] = fullName.split(" ");
  return `${first} ${last?.[0] ?? ""}.`;
}

export type AuctionPhase =
  | "live"
  | "main_ended"
  | "pending_review"
  | "closing_round"
  | "hammered"
  | "sold";

export function useSimulatedBidding(opts: {
  lotId: string;
  startingPrice: number;
  bidIncrement: number;
  maxPrice?: number;
  initialBids: Bid[];
  enabled?: boolean;
  /** Phase from useAuctionClock. Sim bidders only fire during 'live'. */
  phase?: AuctionPhase;
}) {
  const {
    lotId,
    startingPrice,
    bidIncrement,
    maxPrice,
    initialBids,
    enabled = true,
    phase = "live",
  } = opts;

  // Build initial simulated bids from the seed data
  const [bids, setBids] = useState<SimulatedBid[]>(() =>
    initialBids.map((b) => {
      const { name, city } = randomBuyer();
      return {
        ...b,
        buyer_display_name: buyerHandle(name),
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
  const initialKgRef = useRef(initialBids[0]?.kg_requested || 1);
  // Timestamp of the investor's most recent bid. Sim bidders check this
  // ref and skip ticks if we're still inside the pause window.
  const investorJustBidAtRef = useRef<number | null>(null);
  // Shared flash-off timer so placeInvestorBid and sim ticks don't fight.
  const flashOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    priceRef.current = currentHigh;
  }, [currentHigh]);

  useEffect(() => {
    if (!enabled) return;
    // Sim bidders only run during the 'live' phase. When phase transitions
    // to main_ended / pending_review / closing_round / hammered / sold,
    // we want all activity to STOP so useAuctionClock can drive the
    // closing-round opponent AI without sim interference.
    if (phase !== "live") return;

    // Use refs so cleanup can clear whatever timer is pending — including
    // recursive reschedules — without being captured by a stale closure.
    let mounted = true;
    const bidTimerRef: { current: ReturnType<typeof setTimeout> | null } = {
      current: null,
    };
    const flashTimerRef: { current: ReturnType<typeof setTimeout> | null } = {
      current: null,
    };

    function scheduleNextBid() {
      if (!mounted) return;
      // Random interval: 0.8-1.8 seconds — aggressive demo tempo
      const delay = 800 + Math.random() * 1000;

      bidTimerRef.current = setTimeout(() => {
        if (!mounted) return;

        // Investor-aware pause — if the user just placed a bid, skip this
        // tick and retry after the remaining pause window.
        if (investorJustBidAtRef.current !== null) {
          const elapsed = Date.now() - investorJustBidAtRef.current;
          if (elapsed < INVESTOR_BID_PAUSE_MS) {
            const remaining = INVESTOR_BID_PAUSE_MS - elapsed;
            bidTimerRef.current = setTimeout(scheduleNextBid, remaining);
            return;
          }
          investorJustBidAtRef.current = null;
        }

        // Advance price. If the delta would exceed maxPrice, step by a
        // smaller amount so the loop never deadlocks — the point of the
        // cap is to keep the demo number plausible, not to halt bidding.
        let delta = bidIncrement * (Math.random() > 0.45 ? 2 : 1);
        let newAmount = +(priceRef.current + delta).toFixed(2);
        if (maxPrice && newAmount > maxPrice) {
          delta = bidIncrement;
          newAmount = +(priceRef.current + delta).toFixed(2);
          if (newAmount > maxPrice) {
            // Price has genuinely maxed out — keep nudging by the minimum
            // increment so the demo keeps ticking without big jumps.
            newAmount = +(priceRef.current + bidIncrement * 0.5).toFixed(2);
          }
        }

        const { name, city } = randomBuyer();
        const newBid: SimulatedBid = {
          id: `sim-${Date.now()}-${Math.random()}`,
          lot_id: lotId,
          buyer_id: `sim-buyer-${Math.floor(Math.random() * 1000)}`,
          amount_per_kg: newAmount,
          kg_requested: initialKgRef.current,
          is_winning: true,
          status: "active",
          bid_source: "manual",
          placed_at: new Date().toISOString(),
          buyer_display_name: buyerHandle(name),
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

        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => {
          if (mounted) setNewBidFlash(false);
        }, 800);

        scheduleNextBid();
      }, delay);
    }

    scheduleNextBid();

    return () => {
      mounted = false;
      if (bidTimerRef.current) clearTimeout(bidTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, lotId, bidIncrement, maxPrice, phase]);

  // ============================================================
  // placeInvestorBid — the callback the BidPanel fires when the
  // user taps a quick-bid pill or "Place Bid". This is what makes
  // bidding ACTUALLY work (prior version was toast-only).
  // ============================================================
  const placeInvestorBid = useCallback(
    (amount: number, kgRequested?: number) => {
      const kg = kgRequested ?? initialKgRef.current;
      const investorBid: SimulatedBid = {
        id: `investor-${Date.now()}-${Math.random()}`,
        lot_id: lotId,
        buyer_id: "investor",
        amount_per_kg: amount,
        kg_requested: kg,
        is_winning: true,
        status: "active",
        bid_source: "manual",
        placed_at: new Date().toISOString(),
        buyer_display_name: "You",
        buyer_city: "—",
        is_investor: true,
        is_new: true,
      };
      setBids((prev) => {
        const outbid = prev.map((b) => ({
          ...b,
          is_winning: false,
          status: "outbid" as const,
        }));
        return [investorBid, ...outbid];
      });
      setCurrentHigh(amount);
      setLastBidTime(Date.now());
      setNewBidFlash(true);
      // Pause sim bidders briefly so the investor feels like the leader
      investorJustBidAtRef.current = Date.now();
      if (flashOffTimerRef.current) clearTimeout(flashOffTimerRef.current);
      flashOffTimerRef.current = setTimeout(() => setNewBidFlash(false), 800);
    },
    [lotId]
  );

  // Derived flag: is the current high bid the investor's? Used by BidPanel
  // to suppress the outbid toast when currentHigh changes due to the
  // user's own bid rather than a simulated outbid.
  const investorIsHighest = bids[0]?.is_investor === true;

  return {
    bids,
    currentHigh,
    lastBidTime,
    newBidFlash,
    bidCount: bids.length,
    investorIsHighest,
    placeInvestorBid,
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
