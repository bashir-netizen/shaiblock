# Live Auction Engine + Closing Round Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ShaiBlock's non-interactive demo into a hold-to-confirm, investor-aware, closing-round-capable live auction experience for a Sudan tea auction investor pitch.

**Architecture:** New `useAuctionClock` hook drives a phase state machine (`live → main_ended → pending_review? → closing_round → hammered → sold`). Updated `useSimulatedBidding` accepts the phase and exposes a `placeInvestorBid` callback plus a new `is_investor` flag on bids. New UI components handle each phase transition (`BidConfirmationSheet`, `MainEndedOverlay`, `PendingReviewSheet`, `ClosingRoundSheet`, `HammeredStamp`). The existing `BidPanel` is rewired to route all bids through the confirmation sheet.

**Tech Stack:** Next.js 16.2.3 (App Router), React 19, TypeScript, Tailwind CSS v4, `lucide-react` icons. No new dependencies.

**Tests:** NONE by design. This is a mock-data investor demo with no test harness. Verification is manual per spec §8 checklist.

**Spec (read first):** `docs/superpowers/specs/2026-04-13-live-auction-engine-design.md`

---

## Context before starting

**Read in this order:**
1. The spec (`docs/superpowers/specs/2026-04-13-live-auction-engine-design.md`)
2. `src/hooks/use-simulated-bidding.ts` — existing hook you'll extend
3. `src/components/bid-panel.tsx` — existing bid UI you'll rewire
4. `src/app/auctions/[id]/lot-detail-client.tsx` — parent that wires everything together
5. `src/lib/mock-data.ts` (just the `ACTIVE_LOT_TIMING` section near the bottom)
6. `src/lib/constants.ts` — where new constants go
7. `src/components/toast-system.tsx` — existing pattern for ref-based timer cleanup (reference only; we reuse the same pattern)

**Build command:** `cd ~/Desktop/chaiblock && npx next build`
- **Expected output:** "Compiled successfully", 14 routes, 3 dynamic (`/`, `/auctions`, `/auctions/[id]`), 11 static.
- **If build fails:** STOP. Fix the error before proceeding to the next task.

**Dev cycle:** The production server should be running in the background. After each task that changes runtime behavior, restart the production server:
```bash
lsof -ti :3000 | xargs kill 2>/dev/null; sleep 1
cd ~/Desktop/chaiblock && npm run start &
```

**Tunnel:** Already live at `https://trio-assistant-essentials-mod.trycloudflare.com`. After the final task, verify it still serves.

**Commit discipline:** One logical task = one commit. Use Conventional Commits format (`feat(auction): ...`, `refactor(auction): ...`). Use `git -c user.email="bashir@local" -c user.name="Bashir"` if the environment doesn't have git config set.

**Rollback:** If a task breaks something unfixable, `git reset --hard HEAD~1` and re-plan that task only. Earlier tasks stay intact.

---

## File Structure

| File | Purpose | Status |
|------|---------|--------|
| `src/lib/constants.ts` | Named timing constants for phase durations + demo-fast lot ID | MODIFY |
| `src/lib/mock-data.ts` | Update `ACTIVE_LOT_TIMING.lot5` to 3-minute demo-fast window | MODIFY |
| `src/hooks/use-simulated-bidding.ts` | Add `is_investor` flag, phase prop, `placeInvestorBid` callback, `computeTopTwo` helper | MODIFY |
| `src/hooks/use-auction-clock.ts` | **NEW.** Phase state machine, closing round opponent AI, timer ref cleanup | CREATE |
| `src/components/bid-confirmation-sheet.tsx` | **NEW.** Hold-to-confirm modal with landed-cost breakdown | CREATE |
| `src/components/main-ended-overlay.tsx` | **NEW.** 1.5s "MAIN AUCTION ENDED" transition banner | CREATE |
| `src/components/pending-review-sheet.tsx` | **NEW.** 3s "Seller reviewing..." spinner (only fires when reserve not met) | CREATE |
| `src/components/closing-round-sheet.tsx` | **NEW.** Head-to-head bidder overlay with shared countdown | CREATE |
| `src/components/hammered-stamp.tsx` | **NEW.** 3s full-screen Playfair "SOLD" overlay | CREATE |
| `src/components/bid-panel.tsx` | Accept `phase` + `onPlaceInvestorBid`, route bids through confirmation sheet, hide when phase ≠ `live` | MODIFY |
| `src/app/auctions/[id]/lot-detail-client.tsx` | Wire `useAuctionClock` + phase overlays + bid plumbing | MODIFY |

**Total:** 6 new files, 5 modified files.

---

## Task 1 — Constants + demo-fast lot timing

**Files:**
- Modify: `src/lib/constants.ts` (append to end of file)
- Modify: `src/lib/mock-data.ts` (one line in `ACTIVE_LOT_TIMING.lot5`)

**Purpose:** Pure data changes. Lowest-risk first task. Adds every named constant used by the rest of the plan so later tasks never need to invent magic numbers.

**- [ ] Step 1.1: Read current constants.ts**

Run: `cat src/lib/constants.ts | tail -20`

Confirm you see the existing `BUYER_PREMIUM_PCT`, `BUY_NOW_PREMIUM_PCT`, `BID_INCREMENTS` constants. You'll append after them.

**- [ ] Step 1.2: Append new constants to `src/lib/constants.ts`**

Append this block to the end of the file:

```ts

// ============================================================
// Live auction engine phase timings (milliseconds)
// ============================================================
export const MAIN_ENDED_TRANSITION_MS = 1500;
export const PENDING_REVIEW_MS = 3000;
export const CLOSING_ROUND_DURATION_MS = 60_000;
export const CLOSING_ROUND_EXTENSION_MS = 15_000;
export const CLOSING_ROUND_MAX_EXTENSIONS = 3;
export const HAMMERED_STAMP_MS = 3000;

// Soft-close during main auction — late bids extend the window
export const SOFT_CLOSE_THRESHOLD_MS = 120_000; // last 2 minutes
export const SOFT_CLOSE_EXTENSION_MS = 120_000; // extend by 2 minutes

// Investor-aware pause — sim bidders go quiet after the investor bids
export const INVESTOR_BID_PAUSE_MS = 10_000;

// Closing round opponent AI — probability the INVESTOR wins head-to-head.
// Tune down for a tougher demo. 0.6 = investor wins 60% of sessions.
export const CLOSING_ROUND_WIN_PROBABILITY = 0.6;

// Demo-mode fast lot — one specific lot gets a 3-minute main auction so
// the investor can reach the closing round during the pitch window.
export const DEMO_FAST_LOT_ID = "lot5";

// Estimated shipping cost for landed-cost disclosure in bid confirmation.
// In production this would come from a shipping API.
export const ESTIMATED_SHIPPING_USD = 14;
```

**- [ ] Step 1.3: Locate `ACTIVE_LOT_TIMING` in mock-data.ts**

Run: `grep -n "ACTIVE_LOT_TIMING" src/lib/mock-data.ts`

Expected: one line around 1040-1050 defining the Record.

**- [ ] Step 1.4: Update lot5's timing**

In `src/lib/mock-data.ts`, find the exact line:
```ts
  lot5: { startOffsetMin: -5, durationMin: 30 },
```

Replace it with:
```ts
  // lot5 is the DEMO_FAST_LOT_ID — 3-minute main auction so the pitch
  // reaches the closing round in under 30 seconds. Other lots stay at
  // realistic timings so the feed still looks authentic.
  lot5: { startOffsetMin: -2.5, durationMin: 3 },
```

**- [ ] Step 1.5: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -20`

Expected: "Compiled successfully", 14 routes listed, no TypeScript errors.

**- [ ] Step 1.6: Restart production server**

```bash
lsof -ti :3000 | xargs kill 2>/dev/null; sleep 1
cd ~/Desktop/chaiblock && npm run start &
sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/auctions/lot5
```

Expected: `200`

**- [ ] Step 1.7: Manual verify in browser**

Open `http://localhost:3000/auctions/lot5`. The countdown on the BidPanel should show around `02:30` or less (down from ~24 minutes). Everything else on the page should look identical.

**- [ ] Step 1.8: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/lib/constants.ts src/lib/mock-data.ts
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): add phase timing constants + 3min demo-fast lot5"
```

---

## Task 2 — `is_investor` flag on SimulatedBid + computeTopTwo helper

**Files:**
- Modify: `src/hooks/use-simulated-bidding.ts` (extend `SimulatedBid` interface, export helper)

**Purpose:** Data layer change. Adds the `is_investor: true` marker that Task 4's `useAuctionClock` uses to snapshot the investor into `topTwo` when the main auction ends. Also adds the exported `computeTopTwo` helper that the parent component will call at phase transition time. No behavior changes yet.

**- [ ] Step 2.1: Read the current `SimulatedBid` interface**

Run: `grep -n "SimulatedBid" src/hooks/use-simulated-bidding.ts | head -5`

Expected: interface definition around line 13.

**- [ ] Step 2.2: Extend `SimulatedBid` with `is_investor?`**

Find this block in `src/hooks/use-simulated-bidding.ts`:
```ts
export interface SimulatedBid extends Bid {
  buyer_display_name: string;
  buyer_city: string;
  is_new?: boolean;
}
```

Replace it with:
```ts
export interface SimulatedBid extends Bid {
  buyer_display_name: string;
  buyer_city: string;
  is_new?: boolean;
  // True when the bid came from the investor driving the demo (placed via
  // placeInvestorBid). Used by useAuctionClock to guarantee the investor
  // is one of the top two at main_ended.
  is_investor?: boolean;
}
```

**- [ ] Step 2.3: Add `computeTopTwo` helper + imports**

At the TOP of `src/hooks/use-simulated-bidding.ts`, find the imports section. You'll need to import `Lot` from types. The existing import is:
```ts
import type { Bid } from "@/lib/types";
```

Replace it with:
```ts
import type { Bid, Lot } from "@/lib/types";
```

Then at the BOTTOM of `src/hooks/use-simulated-bidding.ts` (below the `useLiveActivityFeed` export), append:

```ts

// ============================================================
// computeTopTwo — snapshot helper for closing round entry
// ----------------------------------------------------------------
// Called by the parent component (lot-detail-client) at the exact
// moment useAuctionClock transitions phase to 'main_ended'. Returns
// [investorBid, opponentBid] — investor is ALWAYS index 0.
//
// If the investor has not placed any bid, fabricates a minimum bid
// at starting_price_per_kg so the closing round always fires with
// the investor participating. This is a demo artifice.
// ============================================================
export function computeTopTwo(
  bids: SimulatedBid[],
  lot: Lot,
  investorDisplayName: string
): [investor: SimulatedBid, opponent: SimulatedBid] {
  // Find investor's highest bid.
  const investorBids = bids.filter((b) => b.is_investor === true);
  let investorBid: SimulatedBid;
  if (investorBids.length > 0) {
    investorBid = investorBids.reduce((hi, b) =>
      b.amount_per_kg > hi.amount_per_kg ? b : hi
    );
  } else {
    // Fabricate a floor bid so the closing round can fire.
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
      buyer_display_name: investorDisplayName,
      buyer_city: "You",
      is_investor: true,
    };
  }

  // Find the highest non-investor bid.
  const nonInvestorBids = bids.filter((b) => !b.is_investor);
  let opponentBid: SimulatedBid;
  if (nonInvestorBids.length > 0) {
    opponentBid = nonInvestorBids.reduce((hi, b) =>
      b.amount_per_kg > hi.amount_per_kg ? b : hi
    );
  } else {
    // Fabricate a plausible opponent at starting price + one increment.
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
```

**- [ ] Step 2.4: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully", no TypeScript errors.

**- [ ] Step 2.5: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/hooks/use-simulated-bidding.ts
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): add is_investor flag + computeTopTwo helper"
```

---

## Task 3 — `BidConfirmationSheet` with hold-to-confirm

**Files:**
- Create: `src/components/bid-confirmation-sheet.tsx`

**Purpose:** The hold-to-confirm modal that all investor bids will flow through. Shows the landed-cost breakdown (price × kg + 7.5% premium + shipping) in USD + SDG. Press-and-hold for 500ms on mobile, Enter key on desktop. Used by both `BidPanel` (Task 10) and `ClosingRoundSheet` (Task 7).

**- [ ] Step 3.1: Create the file**

Create `src/components/bid-confirmation-sheet.tsx` with this exact content:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Gavel, Lock, Shield, X } from "lucide-react";
import { cn, formatPrice, formatSDG } from "@/lib/utils";
import { BUYER_PREMIUM_PCT, ESTIMATED_SHIPPING_USD } from "@/lib/constants";

// ============================================================
// BidConfirmationSheet — the hold-to-confirm modal
// ----------------------------------------------------------------
// Shown when the investor intends to place a bid, in either the
// live phase (via BidPanel) or the closing round (via ClosingRoundSheet).
//
// Behavior:
// - Full-screen overlay on mobile, centered card on desktop
// - Big Playfair price + itemized landed-cost breakdown
// - Primary action: HOLD to confirm (500ms)
//   - Mobile: pointerdown → fill progress → pointerup fires on release
//     only if the full duration was reached
//   - Desktop: Enter key triggers instant confirm (accessibility fallback)
// - Cancel = single tap, no hold
// ============================================================

const HOLD_DURATION_MS = 500;

interface BidConfirmationSheetProps {
  open: boolean;
  amountUSD: number;
  kgRequested: number;
  labelOverride?: string; // e.g. "RAISE TO $5.30/kg"
  onConfirm: () => void;
  onCancel: () => void;
}

export function BidConfirmationSheet({
  open,
  amountUSD,
  kgRequested,
  labelOverride,
  onConfirm,
  onCancel,
}: BidConfirmationSheetProps) {
  const [holdProgress, setHoldProgress] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const confirmedRef = useRef(false);

  const subtotal = +(amountUSD * kgRequested).toFixed(2);
  const premium = +((subtotal * BUYER_PREMIUM_PCT) / 100).toFixed(2);
  const shipping = ESTIMATED_SHIPPING_USD;
  const total = +(subtotal + premium + shipping).toFixed(2);

  // Cancel hold progress and clear rAF if the sheet closes.
  useEffect(() => {
    if (!open) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      holdStartRef.current = null;
      confirmedRef.current = false;
      setHoldProgress(0);
    }
  }, [open]);

  // Keyboard fallback: Enter = instant confirm (desktop accessibility path).
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onConfirm, onCancel]);

  const startHold = useCallback(() => {
    if (confirmedRef.current) return;
    holdStartRef.current = performance.now();
    const tick = () => {
      if (holdStartRef.current === null) return;
      const elapsed = performance.now() - holdStartRef.current;
      const pct = Math.min(elapsed / HOLD_DURATION_MS, 1);
      setHoldProgress(pct);
      if (pct >= 1) {
        confirmedRef.current = true;
        rafRef.current = null;
        holdStartRef.current = null;
        onConfirm();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onConfirm]);

  const cancelHold = useCallback(() => {
    if (confirmedRef.current) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    holdStartRef.current = null;
    setHoldProgress(0);
  }, []);

  if (!open) return null;

  const buttonLabel = labelOverride ?? `Confirm ${formatPrice(amountUSD)}/kg`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm your bid"
    >
      <div className="w-full md:max-w-md bg-card rounded-t-3xl md:rounded-2xl shadow-2xl p-6 md:p-8 animate-[slideUp_300ms_ease-out]">
        {/* Close button */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              Confirm your bid
            </p>
            <h2 className="font-serif text-2xl text-foreground mt-1">
              Review and hold to confirm
            </h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cancel"
            className="text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big price */}
        <div className="text-center py-4 border-y border-border mb-6">
          <p className="font-serif text-5xl font-bold text-foreground tabular-nums">
            {formatPrice(amountUSD)}
            <span className="text-2xl font-normal text-muted">/kg</span>
          </p>
          <p className="text-sm text-muted mt-1">
            × {kgRequested} kg = {formatPrice(subtotal)}
          </p>
        </div>

        {/* Landed-cost breakdown */}
        <dl className="space-y-2 mb-6 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {formatPrice(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Buyer premium ({BUYER_PREMIUM_PCT}%)</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {formatPrice(premium)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Est. shipping</dt>
            <dd className="font-mono tabular-nums text-foreground">
              {formatPrice(shipping)}
            </dd>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <dt className="font-semibold text-foreground">Landed total</dt>
            <dd className="font-mono tabular-nums font-bold text-foreground text-base">
              {formatPrice(total)}
            </dd>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <dt></dt>
            <dd className="font-mono tabular-nums">{formatSDG(total)}</dd>
          </div>
        </dl>

        {/* Trust strip */}
        <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-foreground leading-relaxed">
            Funds are held in escrow and released only when you confirm
            delivery matches the Tea Condition Report.
          </p>
        </div>

        {/* Hold-to-confirm button */}
        <button
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          className="relative w-full overflow-hidden rounded-xl bg-accent text-white font-bold text-lg py-4 shadow-lg shadow-accent/25 select-none touch-none"
          aria-label={`Hold to ${buttonLabel}`}
        >
          {/* Fill progress */}
          <span
            className="absolute inset-y-0 left-0 bg-primary transition-none"
            style={{ width: `${holdProgress * 100}%` }}
          />
          {/* Label */}
          <span className="relative flex items-center justify-center gap-2">
            <Gavel className="w-5 h-5" />
            {holdProgress > 0 && holdProgress < 1
              ? "Hold..."
              : buttonLabel}
          </span>
        </button>

        {/* Helper text */}
        <p className="text-[10px] text-center text-muted mt-3 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Press and hold • Press Enter on desktop
        </p>
      </div>

      {/* Tailwind slide-up keyframe */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(24px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
```

**- [ ] Step 3.2: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully", no TypeScript errors.

**- [ ] Step 3.3: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/bid-confirmation-sheet.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): hold-to-confirm bid sheet with landed-cost breakdown"
```

---

## Task 4 — `useAuctionClock` hook (phase state machine)

**Files:**
- Create: `src/hooks/use-auction-clock.ts`

**Purpose:** The core phase state machine. Owns `phase`, `msRemaining`, `topTwo`, `winner`, `closingRoundBids`, `extendedCount`. Drives transitions via a single tracked timer ref (same pattern as the existing `toast-system.tsx` cleanup). Contains the opponent AI for the closing round. No UI yet — the next tasks consume this.

**- [ ] Step 4.1: Create the file**

Create `src/hooks/use-auction-clock.ts` with this exact content:

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lot } from "@/lib/types";
import type { SimulatedBid } from "./use-simulated-bidding";
import {
  MAIN_ENDED_TRANSITION_MS,
  PENDING_REVIEW_MS,
  CLOSING_ROUND_DURATION_MS,
  CLOSING_ROUND_EXTENSION_MS,
  CLOSING_ROUND_MAX_EXTENSIONS,
  HAMMERED_STAMP_MS,
  CLOSING_ROUND_WIN_PROBABILITY,
} from "@/lib/constants";
import { DEMO_BUYER_NAMES, DEMO_BUYER_CITIES } from "@/lib/photos";

// ============================================================
// useAuctionClock — phase state machine for a single lot
// ============================================================

export type AuctionPhase =
  | "live"
  | "main_ended"
  | "pending_review"
  | "closing_round"
  | "hammered"
  | "sold";

interface AuctionClockState {
  phase: AuctionPhase;
  msRemaining: number;
  extendedCount: number;
  topTwo: [investor: SimulatedBid, opponent: SimulatedBid] | null;
  winner: SimulatedBid | null;
  reserveMet: boolean;
  closingRoundBids: SimulatedBid[];
}

interface UseAuctionClockOpts {
  lot: Lot;
}

export interface UseAuctionClockResult extends AuctionClockState {
  setTopTwo: (pair: [investor: SimulatedBid, opponent: SimulatedBid]) => void;
  placeClosingRoundBid: (amount: number) => void;
  concede: () => void;
}

function randomSudaneseBuyer() {
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

  // Single ref for all phase transition timers so unmount cleanup clears
  // whichever is currently pending — same pattern as toast-system.tsx.
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRoundEndAtRef = useRef<number>(0);
  const mountedRef = useRef(true);

  // Initialize closing round end-at when we enter that phase.
  // Opponent AI state:
  const opponentNameRef = useRef<{ name: string; city: string } | null>(null);
  const investorWinsRef = useRef<boolean>(false);

  // Live countdown tick during 'live' phase only.
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
        // Transition to main_ended — timer cleared by the next render.
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

  // main_ended → (pending_review | closing_round) transition
  useEffect(() => {
    if (phase !== "main_ended") return;
    phaseTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      // Decide whether reserve was met based on current topTwo. If topTwo
      // hasn't been set yet (parent hasn't fired setTopTwo), default to
      // reserve NOT met to show the pending_review path for drama.
      const investorHigh = topTwo?.[0]?.amount_per_kg ?? 0;
      const opponentHigh = topTwo?.[1]?.amount_per_kg ?? 0;
      const highestBid = Math.max(investorHigh, opponentHigh);
      const met = highestBid >= lot.reserve_price_per_kg;
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

  // pending_review → closing_round transition
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

  // closing_round entry: seed opponent, schedule first opponent bid,
  // initialize round timer, seed closingRoundBids with the topTwo.
  useEffect(() => {
    if (phase !== "closing_round" || !topTwo) return;

    // Seed opponent identity
    opponentNameRef.current = {
      name: topTwo[1].buyer_display_name,
      city: topTwo[1].buyer_city,
    };
    investorWinsRef.current = Math.random() < CLOSING_ROUND_WIN_PROBABILITY;

    // Seed closingRoundBids with the topTwo as initial state.
    setClosingRoundBids([topTwo[0], topTwo[1]]);

    closingRoundEndAtRef.current = Date.now() + CLOSING_ROUND_DURATION_MS;
    setMsRemaining(CLOSING_ROUND_DURATION_MS);
    setExtendedCount(0);

    // Countdown interval for closing round
    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, closingRoundEndAtRef.current - Date.now());
      setMsRemaining(remaining);
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        // Determine winner: whoever has the highest bid at timeout wins.
        setClosingRoundBids((current) => {
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

  // hammered → sold transition
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

  // Unmount cleanup: clear everything.
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

  // Opponent AI — decides when and whether to place a counter-bid.
  function scheduleOpponentBid() {
    if (!mountedRef.current) return;
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);

    const delay = 2000 + Math.random() * 4000; // 2-6s
    opponentTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      const remaining = Math.max(0, closingRoundEndAtRef.current - Date.now());
      if (remaining < 5000) return; // opponent concedes in final 5s if not winning

      // Who is currently winning?
      setClosingRoundBids((current) => {
        const highest = current.reduce((hi, b) =>
          b.amount_per_kg > hi.amount_per_kg ? b : hi
        );
        if (!highest.is_investor) {
          // Opponent is already winning — wait for investor.
          return current;
        }

        // Opponent decides whether to bid based on win probability.
        // If investor is supposed to win, opponent bids less aggressively.
        const willBid = investorWinsRef.current
          ? Math.random() < 0.4
          : Math.random() < 0.9;

        if (!willBid) {
          return current;
        }

        const opp = opponentNameRef.current ?? { name: "Guest G.", city: "—" };
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
          buyer_display_name: buyerHandle(opp.name),
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

  // Extend the round if a bid lands in the final 15s.
  function maybeExtend() {
    if (extendedCount >= CLOSING_ROUND_MAX_EXTENSIONS) return;
    const remaining = Math.max(0, closingRoundEndAtRef.current - Date.now());
    if (remaining < CLOSING_ROUND_EXTENSION_MS) {
      closingRoundEndAtRef.current += CLOSING_ROUND_EXTENSION_MS;
      setExtendedCount((c) => c + 1);
    }
  }

  // Callbacks exposed to the parent
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
      // Kick the opponent to respond faster.
      if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current);
      opponentTimerRef.current = setTimeout(scheduleOpponentBid, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const concede = useCallback(() => {
    if (!mountedRef.current) return;
    setClosingRoundBids((current) => {
      // The non-investor bidder wins.
      const nonInvestor =
        current.find((b) => !b.is_investor) ?? current[current.length - 1];
      setWinner(nonInvestor);
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
```

**- [ ] Step 4.2: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -15`

Expected: "Compiled successfully". Likely warnings about unused imports if you accidentally reference something not needed — fix them before continuing.

**- [ ] Step 4.3: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/hooks/use-auction-clock.ts
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): useAuctionClock phase state machine + opponent AI"
```

---

## Task 5 — `HammeredStamp` component

**Files:**
- Create: `src/components/hammered-stamp.tsx`

**Purpose:** The full-screen "SOLD" overlay that fires for 3 seconds when the closing round ends. Pure presentation component.

**- [ ] Step 5.1: Create the file**

Create `src/components/hammered-stamp.tsx` with this exact content:

```tsx
"use client";

import { formatPrice } from "@/lib/utils";

// ============================================================
// HammeredStamp — full-screen SOLD overlay (3 seconds)
// ============================================================

interface HammeredStampProps {
  winnerName: string;
  winnerCity: string;
  pricePerKgUSD: number;
  totalKg: number;
  isInvestor: boolean;
}

export function HammeredStamp({
  winnerName,
  winnerCity,
  pricePerKgUSD,
  totalKg,
  isInvestor,
}: HammeredStampProps) {
  const total = +(pricePerKgUSD * totalKg).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-primary/95 backdrop-blur-md"
      role="status"
      aria-live="assertive"
    >
      <div className="text-center px-6 animate-[scaleIn_500ms_cubic-bezier(0.16,1,0.3,1)]">
        <p className="text-accent-light text-xs uppercase tracking-[0.3em] font-bold mb-4">
          {isInvestor ? "You won" : "Sold"}
        </p>
        <h1
          className="font-serif font-black text-white text-[18vw] md:text-[14rem] leading-none tracking-tight"
          style={{ transform: "rotate(-4deg)" }}
        >
          SOLD
        </h1>
        <p className="font-serif text-white/95 text-3xl md:text-5xl mt-6 tabular-nums">
          {formatPrice(pricePerKgUSD)}
          <span className="text-xl md:text-2xl text-white/70">/kg</span>
        </p>
        <p className="font-sans text-white/80 text-base md:text-lg mt-2">
          × {totalKg} kg = {formatPrice(total)}
        </p>
        <p className="font-sans text-accent-light text-sm md:text-base mt-6 uppercase tracking-widest font-semibold">
          {winnerName} · {winnerCity}
        </p>
      </div>

      <style jsx global>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.6);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[scaleIn_500ms_cubic-bezier\\(0\\.16\\,1\\,0\\.3\\,1\\)\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
```

**- [ ] Step 5.2: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully".

**- [ ] Step 5.3: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/hammered-stamp.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): hammered SOLD stamp overlay"
```

---

## Task 6 — `MainEndedOverlay` + `PendingReviewSheet`

**Files:**
- Create: `src/components/main-ended-overlay.tsx`
- Create: `src/components/pending-review-sheet.tsx`

**Purpose:** Two small transition components. Both are pure presentation with their own internal fade-in animations. `MainEndedOverlay` shows for 1.5s, `PendingReviewSheet` shows for 3s (only when reserve wasn't met).

**- [ ] Step 6.1: Create `main-ended-overlay.tsx`**

Create `src/components/main-ended-overlay.tsx`:

```tsx
"use client";

// ============================================================
// MainEndedOverlay — 1.5s transition banner
// Shown when the main auction countdown hits 0.
// Duration controlled by useAuctionClock; this component is presentation-only.
// ============================================================

export function MainEndedOverlay() {
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-accent/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="text-center animate-[fadeInScale_300ms_ease-out]">
        <p className="text-white/80 text-xs uppercase tracking-[0.3em] font-bold mb-2">
          Main auction closed
        </p>
        <h2 className="font-serif text-white text-4xl md:text-6xl font-bold leading-tight">
          Preparing closing round...
        </h2>
      </div>
      <style jsx global>{`
        @keyframes fadeInScale {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
```

**- [ ] Step 6.2: Create `pending-review-sheet.tsx`**

Create `src/components/pending-review-sheet.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

// ============================================================
// PendingReviewSheet — 3s "seller reviewing..." overlay
// Only rendered when reserve was not met at main_ended.
// ============================================================

interface PendingReviewSheetProps {
  seller: Profile;
  highestBidUSD: number;
  reserveUSD: number;
}

export function PendingReviewSheet({
  seller,
  highestBidUSD,
  reserveUSD,
}: PendingReviewSheetProps) {
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    // After 2.2s (most of the 3s window), flip to "approved" state so the
    // user sees both steps of the animation.
    const t = setTimeout(() => setApproved(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const initials = (seller.company_name || seller.display_name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 backdrop-blur-md px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Seller is reviewing the lot"
    >
      <div className="bg-card rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        <p className="text-accent text-xs uppercase tracking-widest font-bold mb-2">
          Reserve not met
        </p>
        <h2 className="font-serif text-2xl text-foreground mb-6">
          Seller is reviewing
        </h2>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">
              Highest bid
            </p>
            <p className="font-mono tabular-nums text-xl font-bold text-foreground">
              {formatPrice(highestBidUSD)}
            </p>
          </div>
          <div className="text-muted text-sm">vs</div>
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">
              Reserve
            </p>
            <p className="font-mono tabular-nums text-xl font-bold text-accent">
              {formatPrice(reserveUSD)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground text-sm">
              {seller.company_name || seller.display_name}
            </p>
            <p className="text-muted text-xs">
              {approved
                ? "Approved closing round"
                : "Reviewing this lot..."}
            </p>
          </div>
        </div>

        {!approved ? (
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-[bounce_1.4s_ease-in-out_infinite]" />
            <span
              className="w-2 h-2 rounded-full bg-primary animate-[bounce_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-2 h-2 rounded-full bg-primary animate-[bounce_1.4s_ease-in-out_infinite]"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        ) : (
          <p className="text-success font-semibold text-sm">
            ✓ Starting closing round
          </p>
        )}
      </div>
    </div>
  );
}
```

**- [ ] Step 6.3: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully".

**- [ ] Step 6.4: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/main-ended-overlay.tsx src/components/pending-review-sheet.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): main-ended and pending-review transition overlays"
```

---

## Task 7 — `ClosingRoundSheet` head-to-head UI

**Files:**
- Create: `src/components/closing-round-sheet.tsx`

**Purpose:** The big new UI component. Renders the two bidder columns, shared countdown, landed cost strip, primary raise button (routes through `BidConfirmationSheet`), and a concede link. Consumes state from `useAuctionClock` via props.

**- [ ] Step 7.1: Create the file**

Create `src/components/closing-round-sheet.tsx` with this exact content:

```tsx
"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import type { SimulatedBid } from "@/hooks/use-simulated-bidding";
import type { Lot } from "@/lib/types";
import { cn, formatPrice, formatSDG } from "@/lib/utils";
import { BUYER_PREMIUM_PCT, ESTIMATED_SHIPPING_USD } from "@/lib/constants";
import { BidConfirmationSheet } from "./bid-confirmation-sheet";

// ============================================================
// ClosingRoundSheet — head-to-head bidding overlay
// ============================================================

interface ClosingRoundSheetProps {
  lot: Lot;
  topTwo: [investor: SimulatedBid, opponent: SimulatedBid];
  closingRoundBids: SimulatedBid[];
  msRemaining: number;
  extendedCount: number;
  onPlaceBid: (amount: number) => void;
  onConcede: () => void;
}

function formatMMSS(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function BidderColumn({
  bid,
  isWinning,
  isInvestor,
}: {
  bid: SimulatedBid;
  isWinning: boolean;
  isInvestor: boolean;
}) {
  const initials = bid.buyer_display_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex-1 rounded-2xl p-4 md:p-6 border-2 transition-all duration-300",
        isWinning
          ? "bg-success/10 border-success shadow-lg shadow-success/20 scale-[1.02]"
          : "bg-card/50 border-border"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm md:text-base mx-auto mb-3",
          isWinning
            ? "bg-success text-white"
            : "bg-muted/30 text-foreground"
        )}
      >
        {initials}
      </div>
      <p className="text-center font-semibold text-sm md:text-base text-foreground truncate">
        {isInvestor ? "YOU" : bid.buyer_display_name}
      </p>
      <p className="text-center text-[10px] md:text-xs text-muted mb-3">
        {bid.buyer_city}
      </p>
      <p className="text-center font-serif text-2xl md:text-4xl font-bold text-foreground tabular-nums">
        {formatPrice(bid.amount_per_kg)}
      </p>
      <p className="text-center text-[10px] md:text-xs text-muted mt-0.5">
        per kg
      </p>
      <div className="mt-3 text-center">
        <span
          className={cn(
            "inline-block text-[10px] md:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
            isWinning
              ? "bg-success text-white"
              : "bg-muted/20 text-muted"
          )}
        >
          {isWinning ? "Winning" : "Outbid"}
        </span>
      </div>
    </div>
  );
}

export function ClosingRoundSheet({
  lot,
  topTwo,
  closingRoundBids,
  msRemaining,
  extendedCount,
  onPlaceBid,
  onConcede,
}: ClosingRoundSheetProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Determine current highest bid in the closing round.
  const highest = closingRoundBids.reduce(
    (hi, b) => (b.amount_per_kg > hi.amount_per_kg ? b : hi),
    closingRoundBids[0]
  );
  const investorCurrent =
    closingRoundBids
      .filter((b) => b.is_investor)
      .reduce((hi, b) => (b.amount_per_kg > hi.amount_per_kg ? b : hi), topTwo[0]);
  const opponentCurrent =
    closingRoundBids
      .filter((b) => !b.is_investor)
      .reduce((hi, b) => (b.amount_per_kg > hi.amount_per_kg ? b : hi), topTwo[1]);

  const investorIsWinning = highest.is_investor === true;

  const nextBidAmount = +(highest.amount_per_kg + lot.bid_increment).toFixed(2);

  // Landed total for the raise-to amount
  const subtotal = +(nextBidAmount * lot.total_kg).toFixed(2);
  const premium = +((subtotal * BUYER_PREMIUM_PCT) / 100).toFixed(2);
  const landed = +(subtotal + premium + ESTIMATED_SHIPPING_USD).toFixed(2);

  const lowSeconds = msRemaining < 10_000;

  return (
    <>
      <div
        className="fixed inset-0 z-[220] bg-gradient-to-br from-primary/95 via-primary/85 to-accent/30 backdrop-blur-lg flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Closing round — two bidders remain"
      >
        {/* Header */}
        <div className="pt-8 px-6 text-center shrink-0">
          <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/40 rounded-full px-3 py-1 mb-3">
            <Zap className="w-3.5 h-3.5 text-accent-light" />
            <p className="text-accent-light text-[10px] uppercase tracking-widest font-bold">
              Closing Round
            </p>
            <Zap className="w-3.5 h-3.5 text-accent-light" />
          </div>
          <h2 className="font-serif text-white text-3xl md:text-5xl font-bold leading-tight">
            Two bidders remain
          </h2>
        </div>

        {/* Bidder columns */}
        <div className="flex-1 flex items-center justify-center px-4 md:px-12 py-6">
          <div className="w-full max-w-3xl grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-stretch">
            <BidderColumn
              bid={investorCurrent}
              isWinning={investorIsWinning}
              isInvestor={true}
            />
            <div className="flex items-center justify-center text-white font-serif text-xl md:text-3xl italic">
              vs
            </div>
            <BidderColumn
              bid={opponentCurrent}
              isWinning={!investorIsWinning}
              isInvestor={false}
            />
          </div>
        </div>

        {/* Countdown + landed cost */}
        <div className="shrink-0 px-6 pb-4 text-center">
          <p
            className={cn(
              "font-mono tabular-nums font-bold text-5xl md:text-6xl transition-colors",
              lowSeconds ? "text-accent-light animate-pulse" : "text-white"
            )}
            aria-live="off"
          >
            {formatMMSS(msRemaining)}
          </p>
          {extendedCount > 0 && (
            <p className="text-accent-light text-xs uppercase tracking-widest font-bold mt-1">
              Extended +{extendedCount * 15}s
            </p>
          )}
          <p className="text-white/70 text-xs mt-2">
            Subtotal {formatPrice(subtotal)} + Premium{" "}
            {formatPrice(premium)} + Ship {formatPrice(ESTIMATED_SHIPPING_USD)}{" "}
            = <span className="font-bold text-white">{formatPrice(landed)}</span>{" "}
            / <span className="text-white/60">{formatSDG(landed)}</span>
          </p>
        </div>

        {/* Primary CTA */}
        <div className="shrink-0 px-4 md:px-12 pb-6">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={investorIsWinning}
            className={cn(
              "w-full rounded-xl py-5 font-bold text-lg shadow-xl transition-all",
              investorIsWinning
                ? "bg-white/10 text-white/60 cursor-not-allowed"
                : "bg-accent hover:bg-accent-light text-white shadow-accent/30"
            )}
          >
            {investorIsWinning
              ? `You're winning at ${formatPrice(investorCurrent.amount_per_kg)}/kg`
              : `Raise to ${formatPrice(nextBidAmount)}/kg`}
          </button>
          <button
            onClick={onConcede}
            className="w-full text-white/70 hover:text-white text-sm mt-4 underline-offset-2 hover:underline"
          >
            Let it go — concede
          </button>
        </div>
      </div>

      {/* Confirmation sheet */}
      <BidConfirmationSheet
        open={confirmOpen}
        amountUSD={nextBidAmount}
        kgRequested={lot.total_kg}
        labelOverride={`RAISE TO ${formatPrice(nextBidAmount)}/kg`}
        onConfirm={() => {
          setConfirmOpen(false);
          onPlaceBid(nextBidAmount);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
```

**- [ ] Step 7.2: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -15`

Expected: "Compiled successfully".

**- [ ] Step 7.3: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/closing-round-sheet.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): closing round head-to-head UI"
```

---

## Task 8 — Investor-aware pausing in `useSimulatedBidding`

**Files:**
- Modify: `src/hooks/use-simulated-bidding.ts`

**Purpose:** Make the existing simulation hook phase-aware so it (a) stops entirely when phase leaves `live`, (b) pauses for 10 seconds after the investor places a bid, and (c) exposes a `placeInvestorBid` callback that both updates state and flags the bid with `is_investor: true`.

**- [ ] Step 8.1: Read the current `useSimulatedBidding` signature**

Run: `grep -n "interface UseSimulatedBiddingOpts\|export function useSimulatedBidding" src/hooks/use-simulated-bidding.ts`

Identify the options interface and the function signature.

**- [ ] Step 8.2: Import phase type + pause constant**

At the top of `src/hooks/use-simulated-bidding.ts`, find the existing imports. Add two lines to the imports section:

```ts
import { INVESTOR_BID_PAUSE_MS } from "@/lib/constants";
import type { AuctionPhase } from "./use-auction-clock";
```

**- [ ] Step 8.3: Add `phase` to the opts interface**

Find the opts parameter on `useSimulatedBidding`:

```ts
export function useSimulatedBidding(opts: {
  lotId: string;
  startingPrice: number;
  bidIncrement: number;
  maxPrice?: number;
  initialBids: Bid[];
  enabled?: boolean;
}) {
```

Replace with:
```ts
export function useSimulatedBidding(opts: {
  lotId: string;
  startingPrice: number;
  bidIncrement: number;
  maxPrice?: number;
  initialBids: Bid[];
  enabled?: boolean;
  // NEW — phase from useAuctionClock. Sim bids only fire during 'live'.
  phase?: AuctionPhase;
}) {
```

**- [ ] Step 8.4: Destructure the new opt**

Find the destructure block:
```ts
  const {
    lotId,
    startingPrice,
    bidIncrement,
    maxPrice,
    initialBids,
    enabled = true,
  } = opts;
```

Replace with:
```ts
  const {
    lotId,
    startingPrice,
    bidIncrement,
    maxPrice,
    initialBids,
    enabled = true,
    phase = "live",
  } = opts;
```

**- [ ] Step 8.5: Add `investorJustBidAtRef`**

Right below the existing `initialKgRef` declaration (`const initialKgRef = useRef(...)`), add:

```ts
  const investorJustBidAtRef = useRef<number | null>(null);
```

**- [ ] Step 8.6: Gate the scheduler on phase**

Find the main effect — it starts with:
```ts
  useEffect(() => {
    if (!enabled) return;
```

Replace that line and the one after with:
```ts
  useEffect(() => {
    if (!enabled) return;
    // Sim bidding only during the 'live' phase. When phase leaves 'live'
    // (main_ended, closing_round, etc), the cleanup below stops all timers.
    if (phase !== "live") return;
```

Then update the dependency array at the bottom of that same `useEffect`:
```ts
  }, [enabled, lotId, bidIncrement, maxPrice]);
```

Replace with:
```ts
  }, [enabled, lotId, bidIncrement, maxPrice, phase]);
```

**- [ ] Step 8.7: Add investor-pause guard in the bid tick**

Inside the `bidTimerRef.current = setTimeout(() => { ... }` block, find the first executable line (right after the `if (!mounted) return;`). Insert the pause check BEFORE the "Advance price" block:

```ts
        if (!mounted) return;

        // Investor-aware pause: if the investor just bid, skip this tick
        // and retry after the remaining pause window.
        if (investorJustBidAtRef.current !== null) {
          const elapsed = Date.now() - investorJustBidAtRef.current;
          if (elapsed < INVESTOR_BID_PAUSE_MS) {
            const remaining = INVESTOR_BID_PAUSE_MS - elapsed;
            bidTimerRef.current = setTimeout(scheduleNextBid, remaining);
            return;
          }
          // Pause expired — clear the flag and proceed normally.
          investorJustBidAtRef.current = null;
        }

        // Advance price. If the delta would exceed maxPrice, step by a
```

(That last line is where the existing logic picks up — verify it's still there after your edit.)

**- [ ] Step 8.8: Add `placeInvestorBid` callback**

At the very end of the `useSimulatedBidding` function, just before the `return { bids, currentHigh, ... }`, add:

```ts
  const placeInvestorBid = useCallback(
    (amount: number, kgRequested: number) => {
      const { name, city } = randomBuyer();
      // In the demo, the investor shows up as the buyer's logged-in display
      // name. For the mock auth, we use "You" as the city for clarity.
      const investorBid: SimulatedBid = {
        id: `investor-${Date.now()}-${Math.random()}`,
        lot_id: lotId,
        buyer_id: "investor",
        amount_per_kg: amount,
        kg_requested: kgRequested,
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
      investorJustBidAtRef.current = Date.now();
      // The flash-off timer is handled by the existing tick flow.
    },
    [lotId]
  );
```

Also need to import `useCallback` — find the existing React import line at the top:
```ts
import { useEffect, useRef, useState } from "react";
```

Replace with:
```ts
import { useCallback, useEffect, useRef, useState } from "react";
```

**- [ ] Step 8.9: Return the new callback + derived flag**

Find the return block:
```ts
  return {
    bids,
    currentHigh,
    lastBidTime,
    newBidFlash,
    bidCount: bids.length,
  };
```

Replace with:
```ts
  const investorIsHighest =
    bids.length > 0 && bids[0].is_investor === true && bids[0].is_winning;

  return {
    bids,
    currentHigh,
    lastBidTime,
    newBidFlash,
    bidCount: bids.length,
    // NEW
    investorIsHighest,
    placeInvestorBid,
  };
```

**- [ ] Step 8.10: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -15`

Expected: "Compiled successfully". If there's a circular import error (`useSimulatedBidding` imports `AuctionPhase` from `useAuctionClock` which imports `SimulatedBid` from `useSimulatedBidding`), the fix is to use `import type` — it's already written that way above but double-check.

**- [ ] Step 8.11: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/hooks/use-simulated-bidding.ts
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): investor-aware pausing + placeInvestorBid in useSimulatedBidding"
```

---

## Task 9 — Update `BidPanel` to use `BidConfirmationSheet` and phase awareness

**Files:**
- Modify: `src/components/bid-panel.tsx`

**Purpose:** Rewire the existing bid panel so every bid goes through the hold-to-confirm sheet. Accept a `phase` prop and render nothing when `phase !== 'live'`. Accept an `onPlaceInvestorBid` callback from the parent. Stop using the toast-based fake bid — the placeInvestorBid callback does the real state update.

**- [ ] Step 9.1: Read the current BidPanel props**

Run: `grep -n "interface BidPanelProps\|export function BidPanel" src/components/bid-panel.tsx`

Expected: the interface is around line 12. Read the current handleBid + handleCustomBid + handleBuyNow functions (lines 60-85ish).

**- [ ] Step 9.2: Import AuctionPhase and BidConfirmationSheet**

At the top of `src/components/bid-panel.tsx`, add these imports (after the existing imports):

```ts
import type { AuctionPhase } from "@/hooks/use-auction-clock";
import { BidConfirmationSheet } from "@/components/bid-confirmation-sheet";
```

**- [ ] Step 9.3: Extend `BidPanelProps`**

Find:
```ts
interface BidPanelProps {
  lot: Lot;
  initialHighBid: number;
  currentHigh: number;
  newBidFlash: boolean;
  bidCount: number;
}
```

Replace with:
```ts
interface BidPanelProps {
  lot: Lot;
  initialHighBid: number;
  currentHigh: number;
  newBidFlash: boolean;
  bidCount: number;
  // NEW — phase from useAuctionClock. When not 'live', the panel renders null.
  phase?: AuctionPhase;
  // NEW — callback to actually place an investor bid. Called after the
  // user completes the hold-to-confirm interaction.
  onPlaceInvestorBid?: (amount: number, kgRequested: number) => void;
}
```

**- [ ] Step 9.4: Destructure new props**

Find:
```ts
export function BidPanel({
  lot,
  initialHighBid,
  currentHigh,
  newBidFlash,
  bidCount,
}: BidPanelProps) {
```

Replace with:
```ts
export function BidPanel({
  lot,
  initialHighBid,
  currentHigh,
  newBidFlash,
  bidCount,
  phase = "live",
  onPlaceInvestorBid,
}: BidPanelProps) {
```

**- [ ] Step 9.5: Add confirmation sheet state**

Right after the existing `const [customBid, setCustomBid] = useState("");` line, add:

```ts
  const [pendingBidAmount, setPendingBidAmount] = useState<number | null>(null);
```

**- [ ] Step 9.6: Replace `handleBid` and `handleCustomBid`**

Find the current handlers:
```ts
  const handleBid = (amount: number) => {
    showToast({
      type: "success",
      title: "Bid placed!",
      body: `${formatPrice(amount)}/kg — your bid is now active`,
    });
  };

  const handleCustomBid = () => {
    const val = parseFloat(customBid);
    if (!isNaN(val) && val > currentHigh) {
      handleBid(val);
      setCustomBid("");
    } else {
      handleBid(currentHigh + lot.bid_increment);
    }
  };
```

Replace with:
```ts
  const openConfirmation = (amount: number) => {
    setPendingBidAmount(amount);
  };

  const handleCustomBid = () => {
    const val = parseFloat(customBid);
    if (!isNaN(val) && val > currentHigh) {
      openConfirmation(val);
      setCustomBid("");
    } else {
      openConfirmation(currentHigh + lot.bid_increment);
    }
  };

  const confirmPendingBid = () => {
    if (pendingBidAmount === null) return;
    onPlaceInvestorBid?.(pendingBidAmount, lot.total_kg);
    showToast({
      type: "success",
      title: "Bid placed!",
      body: `${formatPrice(pendingBidAmount)}/kg — you're now the high bidder`,
    });
    setPendingBidAmount(null);
  };

  const cancelPendingBid = () => {
    setPendingBidAmount(null);
  };
```

**- [ ] Step 9.7: Rewire quick-bid pills to use `openConfirmation`**

Find the quick-bid pill map:
```tsx
            {BID_INCREMENTS.map((inc) => (
              <button
                key={inc}
                onClick={() => handleBid(currentHigh + inc)}
```

Replace `handleBid` with `openConfirmation`:
```tsx
            {BID_INCREMENTS.map((inc) => (
              <button
                key={inc}
                onClick={() => openConfirmation(currentHigh + inc)}
```

**- [ ] Step 9.8: Rewire Buy Now button**

Find the Buy Now button:
```tsx
            <button
              onClick={handleBuyNow}
```

The existing `handleBuyNow` just shows a toast — leave it alone for now, it's out of scope.

**- [ ] Step 9.9: Add phase guard + confirmation sheet render**

Find the very top of the return block:
```tsx
  return (
    <div className="sticky bottom-0 bg-card border-t border-border shadow-2xl z-30 md:relative md:border md:border-border md:rounded-2xl md:shadow-lg md:shadow-primary/5">
```

Replace with:
```tsx
  // Hide the panel entirely when not in the 'live' phase. The phase overlays
  // (main_ended, pending_review, closing_round, hammered) take over the UI
  // via components in lot-detail-client.tsx.
  if (phase !== "live") return null;

  return (
    <>
      <div className="sticky bottom-0 bg-card border-t border-border shadow-2xl z-30 md:relative md:border md:border-border md:rounded-2xl md:shadow-lg md:shadow-primary/5">
```

**- [ ] Step 9.10: Close the fragment + render the confirmation sheet**

Find the very end of the JSX — the closing `</div>` that ends the component. It's the last line before the closing `);` and `}`. Add the confirmation sheet render and a closing fragment tag:

```tsx
      </div>
      <BidConfirmationSheet
        open={pendingBidAmount !== null}
        amountUSD={pendingBidAmount ?? 0}
        kgRequested={lot.total_kg}
        onConfirm={confirmPendingBid}
        onCancel={cancelPendingBid}
      />
    </>
  );
}
```

Make sure you're replacing ONLY the final `</div> );` — not any earlier div.

**- [ ] Step 9.11: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -15`

Expected: "Compiled successfully". If you see JSX errors about mismatched tags, you probably added `<>` without `</>` or vice versa. Check the return statement carefully.

**- [ ] Step 9.12: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/bid-panel.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "refactor(auction): route BidPanel bids through confirmation sheet + phase gate"
```

---

## Task 10 — Wire everything together in `lot-detail-client.tsx`

**Files:**
- Modify: `src/app/auctions/[id]/lot-detail-client.tsx`

**Purpose:** This is the integration task. Add `useAuctionClock`, compute `topTwo` on phase transition, render the phase overlays, pass `phase` and `onPlaceInvestorBid` down to `BidPanel`, and wire the closing round's `onPlaceBid` and `onConcede` to the clock. This is where the whole engine comes alive.

**- [ ] Step 10.1: Read the current lot-detail-client imports and hook calls**

Run: `grep -n "useSimulatedBidding\|BidPanel\|BidHistory" src/app/auctions/[id]/lot-detail-client.tsx`

Expected: you'll see where the hook is called and where the BidPanel is rendered (likely twice — desktop + mobile).

**- [ ] Step 10.2: Add new imports**

At the top of `src/app/auctions/[id]/lot-detail-client.tsx`, find the existing imports. Add:

```tsx
import { useEffect } from "react";
import { useAuctionClock } from "@/hooks/use-auction-clock";
import { computeTopTwo } from "@/hooks/use-simulated-bidding";
import { MainEndedOverlay } from "@/components/main-ended-overlay";
import { PendingReviewSheet } from "@/components/pending-review-sheet";
import { ClosingRoundSheet } from "@/components/closing-round-sheet";
import { HammeredStamp } from "@/components/hammered-stamp";
```

**- [ ] Step 10.3: Call `useAuctionClock` and wire sim bidding to phase**

Find the existing `useSimulatedBidding` call. It probably looks like:

```tsx
  const {
    bids: liveBids,
    currentHigh,
    newBidFlash,
    bidCount,
  } = useSimulatedBidding({
    lotId: lot.id,
    startingPrice: lot.starting_price_per_kg,
    bidIncrement: lot.bid_increment,
    maxPrice: /* some value */,
    initialBids: bids,
    enabled: true,
  });
```

Replace it with two hook calls — clock first, then sim bidding consuming `clock.phase`:

```tsx
  const clock = useAuctionClock({ lot });

  const {
    bids: liveBids,
    currentHigh,
    newBidFlash,
    bidCount,
    placeInvestorBid,
  } = useSimulatedBidding({
    lotId: lot.id,
    startingPrice: lot.starting_price_per_kg,
    bidIncrement: lot.bid_increment,
    maxPrice: lot.buy_now_price_per_kg
      ? lot.buy_now_price_per_kg * 0.95
      : lot.starting_price_per_kg * 3,
    initialBids: bids,
    enabled: true,
    phase: clock.phase,
  });
```

**- [ ] Step 10.4: Add phase-transition effect that computes topTwo**

Immediately after the two hook calls, add this `useEffect`:

```tsx
  // When the main auction ends, snapshot the top two bidders so the
  // closing round knows who's fighting. Firing this at main_ended is
  // exactly the data flow described in the design spec §3.3.
  useEffect(() => {
    if (clock.phase === "main_ended" && !clock.topTwo) {
      clock.setTopTwo(computeTopTwo(liveBids, lot, "You"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.phase]);
```

**- [ ] Step 10.5: Update both BidPanel call sites to pass phase + onPlaceInvestorBid**

Find both `<BidPanel ... />` renders (desktop column and mobile sticky). Both currently look like:

```tsx
            <BidPanel
              lot={lot}
              initialHighBid={initialHighBid}
              currentHigh={currentHigh}
              newBidFlash={newBidFlash}
              bidCount={bidCount}
            />
```

Update BOTH to:

```tsx
            <BidPanel
              lot={lot}
              initialHighBid={initialHighBid}
              currentHigh={currentHigh}
              newBidFlash={newBidFlash}
              bidCount={bidCount}
              phase={clock.phase}
              onPlaceInvestorBid={placeInvestorBid}
            />
```

**- [ ] Step 10.6: Render the phase overlays**

Find the very top of the JSX return, right after the opening wrapper `<div>`. You want the overlays to render conditionally based on `clock.phase`. Add this block at the TOP of the return, inside the outer wrapper div:

```tsx
      {/* Live auction engine phase overlays */}
      {clock.phase === "main_ended" && <MainEndedOverlay />}
      {clock.phase === "pending_review" && (
        <PendingReviewSheet
          seller={seller}
          highestBidUSD={clock.topTwo?.[0]?.amount_per_kg ?? 0}
          reserveUSD={lot.reserve_price_per_kg}
        />
      )}
      {clock.phase === "closing_round" && clock.topTwo && (
        <ClosingRoundSheet
          lot={lot}
          topTwo={clock.topTwo}
          closingRoundBids={clock.closingRoundBids}
          msRemaining={clock.msRemaining}
          extendedCount={clock.extendedCount}
          onPlaceBid={clock.placeClosingRoundBid}
          onConcede={clock.concede}
        />
      )}
      {clock.phase === "hammered" && clock.winner && (
        <HammeredStamp
          winnerName={clock.winner.buyer_display_name}
          winnerCity={clock.winner.buyer_city}
          pricePerKgUSD={clock.winner.amount_per_kg}
          totalKg={lot.total_kg}
          isInvestor={clock.winner.is_investor === true}
        />
      )}
```

**- [ ] Step 10.7: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -30`

Expected: "Compiled successfully", 14 routes listed. If you see unused import warnings, clean them up. If you see TypeScript errors, address them before committing.

**- [ ] Step 10.8: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/app/auctions/[id]/lot-detail-client.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(auction): integrate live auction engine into lot detail page"
```

---

## Task 11 — End-to-end verification + tunnel refresh

**Files:**
- None (operational task — rebuild, restart, verify)

**Purpose:** The engine is fully implemented. Restart the production server with the new build and verify the complete spec §8 checklist works through the tunnel.

**- [ ] Step 11.1: Clean rebuild**

```bash
cd ~/Desktop/chaiblock
rm -rf .next
npx next build 2>&1 | tail -20
```

Expected: "Compiled successfully", 14 routes, no warnings beyond known-harmless ones.

**- [ ] Step 11.2: Restart production server**

```bash
lsof -ti :3000 | xargs kill 2>/dev/null; sleep 1
cd ~/Desktop/chaiblock && npm run start &
sleep 3
```

Verify the server is up:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/auctions/lot5
```

Expected: `200`

**- [ ] Step 11.3: Check tunnel still serving**

```bash
curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" https://trio-assistant-essentials-mod.trycloudflare.com/auctions/lot5
```

Expected: `200 <N>s` where N is under 5 seconds. If 000 / timeout, the tunnel may have expired — restart cloudflared:
```bash
pkill -f "cloudflared tunnel"; sleep 1
cloudflared tunnel --url http://localhost:3000 --protocol http2 &
sleep 3
```
Then grab the new URL from the cloudflared output and share it with the user.

**- [ ] Step 11.4: Manual walkthrough on phone/desktop**

Open `https://<tunnel-url>/auctions/lot5` in a browser. Run through the spec §8 verification checklist in order:

1. Countdown shows ~2:30 or less on fresh load
2. Tap "Bid $X.XX/kg" primary button → `BidConfirmationSheet` slides in from bottom
3. Sheet shows itemized breakdown in USD + SDG
4. Press and hold the "Confirm" button for 500ms → progress bar fills → bid lands
5. Price flashes green, sim bidders silent for ~10 seconds
6. Wait for countdown to reach 00:00
7. "MAIN AUCTION ENDED" banner fires for 1.5s
8. If reserve was not met (likely for a small initial bid), "Seller reviewing..." sheet fires for 3s and auto-resolves to "Seller approved"
9. `ClosingRoundSheet` opens with two bidder columns, investor in one of them
10. Opponent places 1-3 bids during the round
11. Investor can raise via the in-sheet `BidConfirmationSheet`
12. If investor taps "Let it go" → concede works, opponent wins
13. When round ends, `HammeredStamp` appears for 3s
14. After the stamp, lot page returns (BidPanel is hidden because phase = "sold")
15. No "setState on unmounted" warnings in devtools console
16. Navigate to a non-fast lot (e.g. `/auctions/lot1`) → standard behavior, no phase transitions until the real countdown expires

**- [ ] Step 11.5: Push to GitHub**

```bash
cd ~/Desktop/chaiblock
git push origin main 2>&1 | tail -5
```

Expected: `main -> main` push succeeds.

**- [ ] Step 11.6: (No code change) Mark the sub-project done**

This task has no commit. The work is done when the verification walkthrough passes and the tunnel serves the new build correctly.

---

## Post-completion

When this plan finishes, the demo supports:
- ✅ Hold-to-confirm bidding with landed-cost disclosure (USD + SDG)
- ✅ Investor-aware simulated bidding (10s pause after investor bids)
- ✅ Phase-aware state machine (`live → main_ended → pending_review? → closing_round → hammered → sold`)
- ✅ Closing round head-to-head with opponent AI and 60% investor win probability
- ✅ Demo-fast lot5 (3-min main auction → reachable closing round during pitch)
- ✅ `SOLD` hammer stamp with winner reveal

**What it still doesn't have** (deferred to future sub-projects per the Ultraplan):
- Lane / simulcast mode (auto-advancing feed of lots)
- Real checkout flow with escrow payment
- Counter-offer workflow completion
- Dispute submission + arbitration
- Public seller profiles with aggregated TCR accuracy
- Admin moderation queue + live monitor
- i18n full Arabic/RTL coverage
- Payment rails (bank transfer, mobile money, Stripe)

Each of those is a separate `superpowers:brainstorming → writing-plans → executing-plans` cycle.
