"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lot } from "@/lib/types";
import type { AuctionPhase, SimulatedBid } from "./use-simulated-bidding";
import { DEMO_BUYER_NAMES, DEMO_BUYER_CITIES } from "@/lib/photos";

// ============================================================
// useAuctionClock — phase state machine + closing round opponent AI
// ----------------------------------------------------------------
// Phase walk:
//   live → main_ended → [pending_review] → closing_round → hammered → sold
//
// Owned here: phase state, msRemaining, topTwo snapshot, winner, opponent AI
// for the closing round.
//
// Wiring (from lot-detail-client.tsx):
//   1. Call useAuctionClock({ lot }) — owns phase
//   2. Call useSimulatedBidding({ ..., phase: clock.phase }) — sim bids
//      stop scheduling when phase leaves 'live'
//   3. After main_ended fires, call clock.setTopTwo(computeTopTwo(bids))
//      so the closing round knows who's fighting
//   4. Render <ClosingRoundSheet> when phase === 'closing_round'
//   5. Render <HammeredStamp> when phase === 'hammered'
// ============================================================

const MAIN_ENDED_TRANSITION_MS = 1500;
const PENDING_REVIEW_MS = 3000;
const CLOSING_ROUND_DURATION_MS = 60_000;
const CLOSING_ROUND_EXTENSION_MS = 15_000;
const CLOSING_ROUND_MAX_EXTENSIONS = 3;
const HAMMERED_STAMP_MS = 3000;
// Probability the investor wins the closing round (for opponent AI tuning).
const CLOSING_ROUND_INVESTOR_WIN_PROBABILITY = 0.6;

interface UseAuctionClockOpts {
  lot: Lot;
}

export interface UseAuctionClockResult {
  phase: AuctionPhase;
  msRemaining: number;
  extendedCount: number;
  topTwo: [investor: SimulatedBid, opponent: SimulatedBid] | null;
  winner: SimulatedBid | null;
  reserveMet: boolean;
  closingRoundBids: SimulatedBid[];
  /** Called by parent at main_ended with the snapshotted top two bids. */
  setTopTwo: (
    pair: [investor: SimulatedBid, opponent: SimulatedBid]
  ) => void;
  /** Called by ClosingRoundSheet when investor confirms a raise. */
  placeClosingRoundBid: (amount: number) => void;
  /** Called by ClosingRoundSheet's "Let it go" button. */
  concede: () => void;
}

function buyerHandle(name: string): string {
  const [first, last] = name.split(" ");
  return `${first} ${last?.[0] ?? ""}.`;
}

function randomOpponent() {
  const name =
    DEMO_BUYER_NAMES[Math.floor(Math.random() * DEMO_BUYER_NAMES.length)];
  const city =
    DEMO_BUYER_CITIES[Math.floor(Math.random() * DEMO_BUYER_CITIES.length)];
  return { name: buyerHandle(name), city };
}

export function useAuctionClock({
  lot,
}: UseAuctionClockOpts): UseAuctionClockResult {
  const [phase, setPhase] = useState<AuctionPhase>("live");
  const [msRemaining, setMsRemaining] = useState<number>(() => {
    const end = new Date(lot.auction_end).getTime();
    return Math.max(0, end - Date.now());
  });
  const [topTwo, setTopTwoState] = useState<
    [SimulatedBid, SimulatedBid] | null
  >(null);
  const [winner, setWinner] = useState<SimulatedBid | null>(null);
  const [reserveMet, setReserveMet] = useState<boolean>(false);
  const [closingRoundBids, setClosingRoundBids] = useState<SimulatedBid[]>([]);
  const [extendedCount, setExtendedCount] = useState<number>(0);

  // Single ref bag for all timers so unmount cleanup can clear everything.
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRoundEndAtRef = useRef<number>(0);
  const investorWinsRef = useRef<boolean>(false);
  const opponentIdentityRef = useRef<{ name: string; city: string } | null>(
    null
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
    };
  }, []);

  // ── PHASE: live — countdown to auction_end ──────────────────────
  useEffect(() => {
    if (phase !== "live") {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }
    const tick = () => {
      const end = new Date(lot.auction_end).getTime();
      const remaining = Math.max(0, end - Date.now());
      setMsRemaining(remaining);
      if (remaining <= 0) {
        setPhase("main_ended");
      }
    };
    tick();
    countdownIntervalRef.current = setInterval(tick, 250);
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [phase, lot.auction_end]);

  // ── PHASE: main_ended → pending_review or closing_round ────────
  useEffect(() => {
    if (phase !== "main_ended") return;
    phaseTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      // Determine reserve. If topTwo not yet set, default to "not met"
      // for the dramatic pending_review path.
      const investorHigh = topTwo?.[0]?.amount_per_kg ?? 0;
      const opponentHigh = topTwo?.[1]?.amount_per_kg ?? 0;
      const highest = Math.max(investorHigh, opponentHigh);
      const met = highest >= lot.reserve_price_per_kg;
      setReserveMet(met);
      setPhase(met ? "closing_round" : "pending_review");
    }, MAIN_ENDED_TRANSITION_MS);
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [phase, topTwo, lot.reserve_price_per_kg]);

  // ── PHASE: pending_review → closing_round ──────────────────────
  useEffect(() => {
    if (phase !== "pending_review") return;
    phaseTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase("closing_round");
    }, PENDING_REVIEW_MS);
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [phase]);

  // ── PHASE: closing_round — opponent AI + countdown ─────────────
  useEffect(() => {
    if (phase !== "closing_round" || !topTwo) return;

    // Seed opponent identity (use the topTwo opponent name/city)
    opponentIdentityRef.current = {
      name: topTwo[1].buyer_display_name,
      city: topTwo[1].buyer_city,
    };
    investorWinsRef.current =
      Math.random() < CLOSING_ROUND_INVESTOR_WIN_PROBABILITY;

    setClosingRoundBids([topTwo[0], topTwo[1]]);
    closingRoundEndAtRef.current = Date.now() + CLOSING_ROUND_DURATION_MS;
    setMsRemaining(CLOSING_ROUND_DURATION_MS);
    setExtendedCount(0);

    // Countdown interval
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, closingRoundEndAtRef.current - Date.now());
      setMsRemaining(remaining);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        // Determine winner from current closingRoundBids
        setClosingRoundBids((current) => {
          if (current.length === 0) return current;
          const highestBid = current.reduce((hi, b) =>
            b.amount_per_kg > hi.amount_per_kg ? b : hi
          );
          setWinner(highestBid);
          return current;
        });
        setPhase("hammered");
      }
    }, 250);

    // Schedule first opponent action
    scheduleOpponentBid();

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      if (opponentTimerRef.current) {
        clearTimeout(opponentTimerRef.current);
        opponentTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, topTwo]);

  // ── PHASE: hammered → sold ─────────────────────────────────────
  useEffect(() => {
    if (phase !== "hammered") return;
    phaseTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      setPhase("sold");
    }, HAMMERED_STAMP_MS);
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [phase]);

  // ── Opponent AI ────────────────────────────────────────────────
  function scheduleOpponentBid() {
    if (!mountedRef.current) return;
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);

    const delay = 2000 + Math.random() * 4000; // 2-6s
    opponentTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      const remaining = Math.max(0, closingRoundEndAtRef.current - Date.now());
      // Concede in the final 5s if not currently winning.
      if (remaining < 5000) return;

      setClosingRoundBids((current) => {
        if (current.length === 0) return current;
        const highest = current.reduce((hi, b) =>
          b.amount_per_kg > hi.amount_per_kg ? b : hi
        );
        if (!highest.is_investor) {
          // Opponent already winning — wait for investor.
          return current;
        }

        // Decide whether to bid based on win probability.
        const willBid = investorWinsRef.current
          ? Math.random() < 0.4
          : Math.random() < 0.9;

        if (!willBid) return current;

        const opp =
          opponentIdentityRef.current ?? randomOpponent();
        const newAmount = +(highest.amount_per_kg + lot.bid_increment).toFixed(
          2
        );
        const newBid: SimulatedBid = {
          id: `opp-${Date.now()}-${Math.random()}`,
          lot_id: lot.id,
          buyer_id: "sim-opponent",
          amount_per_kg: newAmount,
          kg_requested: lot.total_kg,
          is_winning: true,
          status: "active",
          bid_source: "manual",
          placed_at: new Date().toISOString(),
          buyer_display_name: opp.name,
          buyer_city: opp.city,
          is_investor: false,
          is_new: true,
        };
        maybeExtend();
        return [newBid, ...current];
      });

      scheduleOpponentBid();
    }, delay);
  }

  function maybeExtend() {
    if (extendedCount >= CLOSING_ROUND_MAX_EXTENSIONS) return;
    const remaining = Math.max(0, closingRoundEndAtRef.current - Date.now());
    if (remaining < CLOSING_ROUND_EXTENSION_MS) {
      closingRoundEndAtRef.current += CLOSING_ROUND_EXTENSION_MS;
      setExtendedCount((c) => c + 1);
    }
  }

  // ── Public callbacks ───────────────────────────────────────────
  const setTopTwo = useCallback(
    (pair: [investor: SimulatedBid, opponent: SimulatedBid]) => {
      setTopTwoState(pair);
    },
    []
  );

  const placeClosingRoundBid = useCallback(
    (amount: number) => {
      if (!mountedRef.current) return;
      setClosingRoundBids((current) => {
        const investor = current.find((b) => b.is_investor) ?? current[0];
        if (!investor) return current;
        const newBid: SimulatedBid = {
          ...investor,
          id: `investor-cr-${Date.now()}`,
          amount_per_kg: amount,
          is_winning: true,
          placed_at: new Date().toISOString(),
          is_investor: true,
          is_new: true,
        };
        maybeExtend();
        return [newBid, ...current];
      });
      // Kick the opponent to respond faster
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = setTimeout(scheduleOpponentBid, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const concede = useCallback(() => {
    if (!mountedRef.current) return;
    setClosingRoundBids((current) => {
      const nonInvestor =
        current.find((b) => !b.is_investor) ?? current[current.length - 1];
      if (nonInvestor) setWinner(nonInvestor);
      return current;
    });
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setPhase("hammered");
  }, []);

  return {
    phase,
    msRemaining,
    extendedCount,
    topTwo,
    winner,
    reserveMet,
    closingRoundBids,
    setTopTwo,
    placeClosingRoundBid,
    concede,
  };
}

// ============================================================
// computeTopTwo — helper for parent to call at main_ended
// Returns [investor, opponent] guaranteed to include the investor.
// ============================================================
export function computeTopTwo(
  bids: SimulatedBid[],
  lot: Lot
): [investor: SimulatedBid, opponent: SimulatedBid] {
  const investorBids = bids.filter((b) => b.is_investor === true);
  let investorBid: SimulatedBid;
  if (investorBids.length > 0) {
    investorBid = investorBids.reduce((hi, b) =>
      b.amount_per_kg > hi.amount_per_kg ? b : hi
    );
  } else {
    // Fabricate a floor investor bid so the closing round always fires
    investorBid = {
      id: `investor-floor-${Date.now()}`,
      lot_id: lot.id,
      buyer_id: "investor",
      amount_per_kg: lot.starting_price_per_kg,
      kg_requested: lot.total_kg,
      is_winning: false,
      status: "active",
      bid_source: "manual",
      placed_at: new Date().toISOString(),
      buyer_display_name: "You",
      buyer_city: "—",
      is_investor: true,
    };
  }

  const nonInvestorBids = bids.filter((b) => !b.is_investor);
  let opponentBid: SimulatedBid;
  if (nonInvestorBids.length > 0) {
    opponentBid = nonInvestorBids.reduce((hi, b) =>
      b.amount_per_kg > hi.amount_per_kg ? b : hi
    );
  } else {
    // Fabricate a plausible opponent
    opponentBid = {
      id: `opponent-floor-${Date.now()}`,
      lot_id: lot.id,
      buyer_id: "sim-opponent",
      amount_per_kg: lot.starting_price_per_kg + lot.bid_increment,
      kg_requested: lot.total_kg,
      is_winning: false,
      status: "active",
      bid_source: "manual",
      placed_at: new Date().toISOString(),
      buyer_display_name: "Khalid H.",
      buyer_city: "Khartoum",
      is_investor: false,
    };
  }

  return [investorBid, opponentBid];
}
