# Live Auction Engine + Closing Round — Design Spec

**Status:** Approved via `superpowers:brainstorming`, awaiting user review before `writing-plans`.
**Date:** 2026-04-13
**Scope:** First sub-project extracted from the larger Ultraplan UX roadmap.
**Target milestone:** Investor pitch for ShaiBlock, a Sudan-focused live tea auction marketplace.

---

## 1. Context

### 1.1 What this replaces

The existing lot detail page (`src/app/auctions/[id]/lot-detail-client.tsx`) has a functional bidding simulation — simulated Sudanese buyers place bids every 5-12 seconds, the price flashes green, and an outbid toast pops in. That's good enough to *watch*, but the investor is going to **drive** the demo: they will physically tap the bid button, feel it, and decide whether ShaiBlock feels real. The current `BidPanel` goes straight from tap → state update with no confirmation, no landed-cost disclosure, and no dramatic closing moment. An auction that just times out and says "ended" is not a wow moment.

### 1.2 What this adds

This spec describes a closing-round-first live auction engine modeled on TradeRev (automotive wholesale auction platform) adapted to specialty tea:

1. **A phase state machine** (`useAuctionClock`) that walks the lot through `live → main_ended → pending_review? → closing_round → hammered → sold`
2. **A hold-to-confirm bid sheet** with landed-cost disclosure (price × kg + 7.5% buyer premium + estimated shipping = total in USD and SDG)
3. **The closing round** — after the main auction ends, the top two bidders fight in a 60-second head-to-head mini-auction. This is the TradeRev mechanic that guarantees every lot reaches a definitive winner (or a seller-decided unsold state), and it's the single thing that makes specialty auctions feel like a live event instead of a timed listing.
4. **Investor-aware simulated bidding** — when the investor places a bid, sim bidders pause for 10s so they feel like they're winning. When main auction ends, the investor is force-placed in the top 2 so they always get to participate in the closing round. This is demo artifice; it's invisible and it guarantees every pitch session reaches the closing moment.
5. **A hammer-down "SOLD" stamp** — a 3-second full-screen Playfair serif overlay when the closing round ends, rotated 4°, showing winner name + final price.

### 1.3 Why this sub-project, first

The Ultraplan laid out 8 independent subsystems (lane/simulcast mode, checkout flow, dispute system, trust stack, admin monitor, i18n, etc.). Doing all of them before the pitch is a recipe for destabilizing a working demo. The live auction engine is the one piece that (a) the investor will interact with directly, (b) produces the strongest wow moment, and (c) is reversible if anything breaks (all changes are additive on top of existing components, no new routes).

Other sub-projects (checkout, counter-offers, disputes, seller profiles, admin) get queued for future iterations of the `superpowers:brainstorming → writing-plans → executing-plans` cycle.

---

## 2. Non-goals

Deliberately excluded from this spec:

- **Lane / simulcast mode** (`/auctions/lane/[laneId]` auto-advance between lots). Separate sub-project.
- **Real checkout flow** (`/checkout/[orderId]`) after a win. The SOLD stamp is the demo's closing beat; the order tracker is a future sub-project.
- **`AuctionEventBus` typed pub-sub architecture.** The Ultraplan proposed this; we're using plain props + callbacks between the hook and components for this sub-project. If future sub-projects need cross-component eventing, we refactor then.
- **`BidIntent` full state machine as a separate module.** Component-local state is sufficient here.
- **Counter-offer workflow completion.** The existing counter-offer UI on the dashboard is not touched.
- **Dispute submission flow.** No dispute path from the SOLD stamp in this sub-project.
- **Seller review in `pending_review` phase being a real interactive state.** The seller always auto-approves after 3 seconds in this sub-project.
- **Proxy bidding ("bid up to $X").** Not in scope; investor enters discrete bid amounts.
- **Haptic feedback, sound effects, keyboard shortcuts.** Demo is mobile-first touch; other modalities deferred.
- **Accessibility beyond what the existing components already have.** ARIA live regions on the new sheets, yes. Full WCAG audit, no.
- **Unit tests.** Intentional — this is a mock-data demo with no test harness. Verification is manual per Section 8.
- **Backend changes.** All state is client-side and session-scoped. No Postgres, no API routes, no real auth.

---

## 3. Architecture

### 3.1 Phase state machine

The `useAuctionClock` hook walks through these phases in order:

```
  live  →  main_ended  →  [pending_review]  →  closing_round  →  hammered  →  sold
              ↓                                                                  ↑
              └──────────── (unsold branch skipped for demo) ────────────────────┘
```

| Phase | Duration | Trigger | Visual |
|-------|----------|---------|--------|
| `live` | `auction_end - now` | Lot's main auction window. Default 20-45 min, demo-fast lot is 3 min. | Lot detail page as today with countdown + BidPanel |
| `main_ended` | 1500 ms | Main auction countdown reaches 00:00 | Full-screen `MainEndedOverlay` banner |
| `pending_review` | 3000 ms | Only if `lot.current_high_bid < lot.reserve_price_per_kg` when main ended | `PendingReviewSheet` with simulated seller avatar + spinner |
| `closing_round` | 60000 ms base + up to 45000 ms auto-extensions | Always follows `main_ended` (or `pending_review`). Top 2 bidders enter head-to-head. | `ClosingRoundSheet` full-screen overlay with two bidder columns |
| `hammered` | 3000 ms | Closing round countdown reaches 0 or a bidder concedes | `HammeredStamp` full-screen SOLD overlay |
| `sold` | Terminal | After `hammered` duration elapses | Lot detail page returns, replaced BidPanel shows "View order" CTA or "Sold to [name]" message |
| `unsold` | (Skipped in demo) | Seller declines closing round. Not implemented. | N/A |

### 3.2 Responsibility boundaries

Each piece has a single testable purpose:

- **`useAuctionClock`** — drives `phase` and timing. Holds `topTwo` snapshot, opponent AI state, `winner`. Does not render anything. Does not know about `PriceDisplay` or any UI.
- **`useSimulatedBidding`** — generates simulated bidder activity during `live` phase only. Stops cleanly when `phase !== 'live'`. Does not know about closing rounds.
- **`BidConfirmationSheet`** — handles the hold-to-confirm interaction for a single bid. Used by both `BidPanel` (live phase) and `ClosingRoundSheet` (closing round phase).
- **`ClosingRoundSheet`** — renders the head-to-head UI. Reads `topTwo` and opponent bids from `useAuctionClock`. Does not compute them itself.
- **`HammeredStamp`** — pure presentation. 3-second full-screen overlay.
- **`MainEndedOverlay`** — pure presentation. 1.5-second banner.
- **`PendingReviewSheet`** — pure presentation with internal timer.
- **`BidPanel`** — remains the only place "regular" bid input UI lives. Delegates confirmation to `BidConfirmationSheet`. Hides itself when phase leaves `live`.

### 3.3 Data flow

The two hooks have a potential circular dependency: `useAuctionClock` owns `phase`, but `useSimulatedBidding` needs `phase` to know when to stop, and `useAuctionClock` needs access to `bids` (produced by `useSimulatedBidding`) at the moment it snapshots `topTwo`. The pattern that resolves this:

1. `useAuctionClock` is called first. It owns `phase` state and advances it via its own `setTimeout` chain, independent of bid data.
2. `useSimulatedBidding` is called second and reads `clock.phase` as a prop. It stops scheduling when `phase !== 'live'`.
3. At the moment `phase` transitions to `main_ended`, the parent component reads the current `simBidding.bids` and calls `clock.setTopTwo(...)` with a computed `[investor, opponent]` tuple. The clock doesn't fetch bids itself; the parent pushes them in at the exact moment they matter.

```
  lot-detail-client.tsx
   │
   ├── clock = useAuctionClock({ lot })
   │     owns: phase state + timers
   │     exposes: { phase, msRemaining, topTwo, winner, closingRoundBids,
   │                setTopTwo, placeClosingRoundBid, concede }
   │
   ├── simBidding = useSimulatedBidding({ lotId, phase: clock.phase,
   │                                      startingPrice, bidIncrement, initialBids })
   │     reads: clock.phase
   │     exposes: { bids, currentHigh, bidCount, newBidFlash, placeInvestorBid }
   │
   ├── useEffect(() => {
   │     if (clock.phase === 'main_ended' && !clock.topTwo) {
   │       clock.setTopTwo(computeTopTwo(simBidding.bids));
   │     }
   │   }, [clock.phase, simBidding.bids]);
   │
   │
   ├── <BidPanel />
   │     consumes: currentHigh, newBidFlash, bidCount, phase
   │     owns: BidConfirmationSheet (for regular bids)
   │     on confirm → placeInvestorBid(amount, kg)
   │     hides when phase leaves 'live'
   │
   ├── <MainEndedOverlay />   (rendered only when phase === 'main_ended')
   ├── <PendingReviewSheet /> (rendered only when phase === 'pending_review')
   ├── <ClosingRoundSheet />  (rendered only when phase === 'closing_round')
   │     consumes: topTwo, closingRoundBids
   │     owns: BidConfirmationSheet (for closing round bids)
   │     on confirm → placeClosingRoundBid(amount)
   │     on concede → useAuctionClock transitions to 'hammered'
   └── <HammeredStamp />      (rendered only when phase === 'hammered')
           consumes: winner, final price
```

Bids flow from UI components through callbacks back into the hooks. The hooks own all the state. Nothing persists across page navigation; closing an unmounted tab ends the auction.

---

## 4. Component API contracts

### 4.1 `useAuctionClock`

**File:** `src/hooks/use-auction-clock.ts` (new)

```ts
type AuctionPhase =
  | 'live'
  | 'main_ended'
  | 'pending_review'
  | 'closing_round'
  | 'hammered'
  | 'sold';

interface AuctionClockState {
  phase: AuctionPhase;
  msRemaining: number;
  extendedCount: number;
  // topTwo[0] is ALWAYS the investor (guaranteed by topTwo force-inclusion, see §4.8).
  // topTwo[1] is the highest-priced non-investor bid from the main auction.
  // null until the parent calls setTopTwo() after phase transitions to main_ended.
  topTwo: [investor: SimulatedBid, opponent: SimulatedBid] | null;
  winner: SimulatedBid | null;
  reserveMet: boolean;
  // Opponent bids placed during the closing round. Investor bids placed via
  // placeClosingRoundBid() also land here for unified display.
  closingRoundBids: SimulatedBid[];
}

interface UseAuctionClockOpts {
  lot: Lot;
}

interface UseAuctionClockResult extends AuctionClockState {
  // Called by the parent exactly once, at the moment phase transitions to
  // main_ended. The parent computes the tuple from useSimulatedBidding's
  // bids array at that exact frame. See §3.3 data flow for the pattern.
  setTopTwo: (pair: [investor: SimulatedBid, opponent: SimulatedBid]) => void;

  // Called by ClosingRoundSheet when the investor confirms a raise.
  placeClosingRoundBid: (amount: number) => void;

  // Called by ClosingRoundSheet when the investor taps "Let it go".
  concede: () => void;
}

export function useAuctionClock(opts: UseAuctionClockOpts): UseAuctionClockResult;
```

Internal state transitions use a single `phaseTransitionRef` for `setTimeout` tracking so cleanup clears all pending phase transitions on unmount — the same pattern as the `useSimulatedBidding` review fix. The opponent AI also uses a tracked `opponentTimerRef` cleared on unmount.

### 4.2 `useSimulatedBidding` (updated)

**File:** `src/hooks/use-simulated-bidding.ts` (update)

```ts
interface UseSimulatedBiddingOpts {
  lotId: string;
  startingPrice: number;
  bidIncrement: number;
  maxPrice?: number;
  initialBids: Bid[];
  enabled?: boolean;
  // NEW:
  phase: AuctionPhase;
}

interface UseSimulatedBiddingResult {
  bids: SimulatedBid[];
  currentHigh: number;
  bidCount: number;
  newBidFlash: boolean;
  lastBidTime: number;
  // NEW:
  investorIsHighest: boolean;
  placeInvestorBid: (amount: number, kgRequested: number) => void;
}
```

Sim bid scheduling stops when `phase !== 'live'`. The `placeInvestorBid` callback pushes an investor bid into the `bids` array (marked with `is_investor: true`), sets a 10-second pause window during which sim ticks are skipped, and triggers `newBidFlash`.

**Helper export** (used by the parent component to satisfy §3.3's `setTopTwo` call):

```ts
/**
 * Given the current bids array from useSimulatedBidding, return the
 * forced topTwo tuple: [investor's highest bid, highest non-investor bid].
 * If the investor has no bid, fabricates one at starting_price_per_kg so
 * the closing round always fires with investor participation.
 */
export function computeTopTwo(
  bids: SimulatedBid[],
  lot: Lot,
  investorDisplayName: string
): [investor: SimulatedBid, opponent: SimulatedBid];
```

### 4.3 `BidConfirmationSheet`

**File:** `src/components/bid-confirmation-sheet.tsx` (new)

```ts
interface BidConfirmationSheetProps {
  open: boolean;
  amountUSD: number;
  kgRequested: number;
  buyerPremiumPct: number;
  shippingEstimateUSD: number;
  onConfirm: () => void;
  onCancel: () => void;
  labelOverride?: string;  // e.g. "RAISE TO $5.30/kg" for closing round
}
```

Renders a full-screen modal on mobile / centered card on desktop. Shows:
- Big price in Playfair: `$X.XX/kg × N kg = $subtotal`
- Itemized breakdown: subtotal + premium + shipping = landed USD, with SDG equivalent underneath
- Escrow reassurance line
- **Hold-to-confirm button**: 500ms press hold on mobile (pointer events), Enter key on desktop. Shows a progress fill during the hold. On release (if full duration reached), fires `onConfirm`. Cancel button is always one tap.

### 4.4 `ClosingRoundSheet`

**File:** `src/components/closing-round-sheet.tsx` (new)

```ts
interface ClosingRoundSheetProps {
  lot: Lot;
  topTwo: [SimulatedBid, SimulatedBid];
  closingRoundBids: SimulatedBid[];
  msRemaining: number;
  extendedCount: number;
  onPlaceBid: (amount: number) => void;
  onConcede: () => void;
}
```

Full-screen overlay with:
- Header: "CLOSING ROUND" title + "Two bidders remain" subtitle
- Two bidder columns showing avatar, name, city, current bid, status badge (WINNING / OUTBID)
- Shared countdown MM:SS in the middle
- Landed-cost strip updating live with each raise
- Primary CTA: "Raise to $X.XX/kg" triggering `BidConfirmationSheet` overlay
- Secondary: "Let it go — concede" text link that fires `onConcede`

### 4.5 `HammeredStamp`

**File:** `src/components/hammered-stamp.tsx` (new)

```ts
interface HammeredStampProps {
  winnerName: string;
  pricePerKgUSD: number;
  totalKg: number;
}
```

Renders for 3 seconds. Full-screen emerald backdrop. Oversize Playfair "SOLD" in accent color, rotated 4°. Winner name + total price below. Respects `prefers-reduced-motion` by skipping the rotation/scale animation.

### 4.6 `MainEndedOverlay`

**File:** `src/components/main-ended-overlay.tsx` (new)

```ts
interface MainEndedOverlayProps {
  durationMs: number;
}
```

1.5-second full-screen amber banner. Content: "MAIN AUCTION ENDED — preparing closing round..." in Playfair. Auto-unmounts after `durationMs`.

### 4.7 `PendingReviewSheet`

**File:** `src/components/pending-review-sheet.tsx` (new)

```ts
interface PendingReviewSheetProps {
  seller: Profile;
  highestBidUSD: number;
  reserveUSD: number;
  durationMs: number;
}
```

3-second overlay showing the simulated seller reviewing the lot. Shows "Reserve not met", highest bid vs. reserve, seller avatar + name, spinner, then resolves to "Seller approved — starting closing round". Auto-transitions.

### 4.8 `BidPanel` (updated)

**File:** `src/components/bid-panel.tsx` (update)

Adds two new props: `phase: AuctionPhase` and `onPlaceInvestorBid: (amount: number, kgRequested: number) => void`. Renders nothing when `phase !== 'live'`. The primary bid button opens `BidConfirmationSheet` instead of placing the bid inline. On confirm, calls `onPlaceInvestorBid(amount, kg)` which the parent forwards to `simBidding.placeInvestorBid`.

---

## 5. Data model changes

### 5.1 `SimulatedBid` — add `is_investor` flag

**File:** `src/hooks/use-simulated-bidding.ts`

```ts
export interface SimulatedBid extends Bid {
  buyer_display_name: string;
  buyer_city: string;
  is_new?: boolean;
  is_investor?: boolean;  // NEW
}
```

Used to identify the investor's own bids when snapshotting `topTwo` at main auction end.

### 5.2 New constants

**File:** `src/lib/constants.ts`

```ts
// Live auction engine phase timings (ms)
export const MAIN_ENDED_TRANSITION_MS = 1500;
export const PENDING_REVIEW_MS = 3000;
export const CLOSING_ROUND_DURATION_MS = 60_000;
export const CLOSING_ROUND_EXTENSION_MS = 15_000;
export const CLOSING_ROUND_MAX_EXTENSIONS = 3;
export const HAMMERED_STAMP_MS = 3000;

// Soft-close (late-bid extension) during main auction
export const SOFT_CLOSE_THRESHOLD_MS = 120_000;  // last 2 min
export const SOFT_CLOSE_EXTENSION_MS = 120_000;  // extend by 2 min per late bid

// Investor-aware pausing
export const INVESTOR_BID_PAUSE_MS = 10_000;

// Closing round opponent AI
export const CLOSING_ROUND_WIN_PROBABILITY = 0.6;

// Demo-mode fast lot
export const DEMO_FAST_LOT_ID = 'lot5';
```

### 5.3 Demo-fast lot timing override

**File:** `src/lib/mock-data.ts`

The existing `ACTIVE_LOT_TIMING` table already controls auction timestamps. Update `lot5`'s entry:

```ts
lot5: { startOffsetMin: -2.5, durationMin: 3 },  // Uji Matcha: 3-min main auction ends ~30s after page load
```

No other lots change. The demo-fast lot is `lot5` (Uji Matcha Gardens, 5kg premium) because:
1. Small, premium lot with dramatic dollar amounts ($30+/kg) — the closing round feels significant
2. Unique enough that the investor will remember "the matcha" later
3. Already has real photos
4. Short duration (30 min in original data) makes a 3-minute version feel natural, not rushed

---

## 6. Phase-by-phase UX description

What the investor sees and feels at each phase, walking through the expected pitch flow on `/auctions/lot5`:

### Phase: `live` (first ~30s after page load)

- The lot detail page looks as it does today. Hero photo, TCR, cupping radar, bid panel.
- Countdown shows around `02:30` remaining in amber (under 3-min threshold → amber per existing `getCountdownColor`).
- A simulated Sudanese buyer places a bid every 5-12s. Each bid flashes the price green and fires an outbid toast if the investor was previously high.
- Investor taps "Bid $X.XX/kg" primary button → `BidConfirmationSheet` slides up.
- Confirmation sheet shows: `$X.XX/kg × 5 kg = $X subtotal + 7.5% premium $X + est. shipping $8 = $X landed / SDG X,XXX`.
- Investor holds the "Confirm" button for 500ms. Progress ring fills. On release, bid is placed.
- Price flashes green, sheet dismisses. Sim bidders pause for 10s. Investor sees themselves as the current high bidder.
- Sim bidders resume after 10s, may outbid the investor. Investor raises again or waits.

### Phase: `main_ended` (1.5s)

- Countdown reaches `00:00`.
- Full-screen amber banner slides over the lot hero: "MAIN AUCTION ENDED — preparing closing round..."
- `useAuctionClock` snapshots `topTwo`: investor's highest bid + the highest non-investor bid.
- Sim bidding stops completely.

### Phase: `pending_review` (3s, optional)

Only fires if the final main auction price was below reserve (e.g. investor only bid $28/kg on a $35 reserve lot):
- Full-screen modal: "Reserve not met. Highest bid: $28.00/kg. Reserve: $35.00/kg."
- Seller avatar (Uji Matcha Gardens) with a spinner and rotating text.
- After 3s, modal updates: "✓ Seller approved a closing round"
- Auto-transitions to `closing_round`.

### Phase: `closing_round` (60s + up to 45s extensions)

- `PendingReviewSheet` fades out. `ClosingRoundSheet` fades in with an emerald-gold radial gradient background.
- Header: "CLOSING ROUND — Two bidders remain."
- Two columns side by side: Investor (Ahmed S. from Khartoum or whichever role name they see) and their opponent (e.g. Omar T. from Port Sudan).
- Each column shows avatar initials, name, city, current bid, and a WINNING/OUTBID badge.
- Shared 60-second countdown in the middle.
- Opponent AI bids after 4-8 seconds (70% chance). If they bid, opponent column shows WINNING green glow, investor column shows OUTBID muted.
- Investor taps "Raise to $X.XX/kg" → `BidConfirmationSheet` appears with the closing-round label.
- Hold-to-confirm, price updates, opponent's turn.
- If a bid happens in the last 15s of the round, countdown extends by 15s with a brief "+15s EXTENSION" amber flash.
- After up to 3 extensions, timer can't extend further.
- One of three outcomes:
  1. **Investor wins** (60% probability in the opponent AI): opponent declines to bid once, or concedes when their win threshold is exhausted
  2. **Opponent wins** (40%): opponent raises once in the last 5 seconds, investor doesn't raise back in time
  3. **Investor concedes**: investor taps "Let it go — concede" text link

### Phase: `hammered` (3s)

- Closing round sheet fades out.
- Full-screen emerald backdrop.
- Oversize Playfair **"SOLD"** rotated 4°, accent color.
- Below: `[Winner name] · $X.XX/kg × 5 kg = $XXX.XX`.
- No interaction. After 3 seconds, fades out.

### Phase: `sold` (terminal)

- Lot detail page becomes visible again.
- Where `BidPanel` used to live, a summary card appears:
  - If investor won: "You won this lot. [View your order →]" (dead link for demo, or links to placeholder)
  - If opponent won: "Sold to Omar T. at $X.XX/kg" with muted styling
- Rest of the lot detail page (TCR, seller card, photos) stays as-is.

---

## 7. Build order

Stability-first. Each step is a discrete commit and produces a verifiable working state.

### Step 1 — Constants + demo-fast lot
- Add all constants from Section 5.2 to `src/lib/constants.ts`
- Update `ACTIVE_LOT_TIMING.lot5` to `{ startOffsetMin: -2.5, durationMin: 3 }`
- **Verify:** `npm run build` passes. Visit `/auctions`; lot5's countdown shows ~2-3 min.
- **Commit:** `feat(auction): add live auction engine constants + demo-fast lot`

### Step 2 — `SimulatedBid.is_investor` flag
- Extend `SimulatedBid` interface in `use-simulated-bidding.ts` with optional `is_investor`
- **Verify:** `npm run build` passes.
- **Commit:** `feat(auction): add is_investor flag to SimulatedBid`

### Step 3 — `BidConfirmationSheet`
- Build the standalone component with hold-to-confirm and landed-cost breakdown
- Wire it into the existing `BidPanel` so regular bids now go through the sheet
- **Verify:** Open a lot, tap bid, sheet appears, hold-to-confirm works, bid lands correctly. Existing outbid flow still works.
- **Commit:** `feat(auction): hold-to-confirm bid sheet with landed cost`

### Step 4 — `useAuctionClock` (scaffold)
- New hook with phase state + `setTimeout`-based transitions
- Consumed in `lot-detail-client.tsx` but only for a `console.log` — no UI yet
- **Verify:** Open lot5, watch console, confirm phases fire in order: `live` → `main_ended` → `closing_round` → `hammered` → `sold`. Other lots still work normally (they stay in `live` until countdown expires).
- **Commit:** `feat(auction): useAuctionClock phase state machine`

### Step 5 — `HammeredStamp`
- Build the SOLD stamp component
- Render it from `lot-detail-client.tsx` when `phase === 'hammered'`
- **Verify:** Open lot5, wait for main auction end, see console advance phases, and when `hammered` fires the stamp renders. Auto-dismisses after 3s.
- **Commit:** `feat(auction): hammered SOLD stamp overlay`

### Step 6 — `MainEndedOverlay` + `PendingReviewSheet`
- Both transition pieces, rendered when their respective phases are active
- **Verify:** Open lot5, wait for main end. See the "MAIN AUCTION ENDED" banner for 1.5s, then (if reserve not met) the pending review sheet for 3s, then advance.
- **Commit:** `feat(auction): main-ended and pending-review transition overlays`

### Step 7 — `ClosingRoundSheet` + opponent AI
- Full head-to-head UI + opponent AI inside `useAuctionClock`
- Integrates `BidConfirmationSheet` for closing-round raises
- **Verify:** Reach closing round via lot5. Verify the two bidder columns, the countdown, opponent bids arriving, investor can raise, concede button works.
- **Commit:** `feat(auction): closing round head-to-head UI + opponent AI`

### Step 8 — Investor-aware pausing in `useSimulatedBidding`
- Update `useSimulatedBidding` to accept `phase` + internal pause tracking
- Add `placeInvestorBid` callback
- Hook up to `BidPanel`'s `BidConfirmationSheet` onConfirm
- **Verify:** Place a bid during `live` phase, watch 10s of silence, see sim bidders resume. Place a bid and wait for main end; confirm investor appears in closing round's `topTwo`.
- **Commit:** `feat(auction): investor-aware simulated bidding + force topTwo inclusion`

### Step 9 — Final integration + cleanup
- Verify all phase overlays render cleanly in `lot-detail-client.tsx`
- Remove any `console.log` scaffolding from Step 4
- Make sure `BidPanel` hides when phase leaves `live`
- Run final `npm run build`
- **Commit:** `feat(auction): integrate live auction engine into lot detail`

### Step 10 — Rebuild + restart + re-verify tunnel
- Kill running production server
- `npm run build && npm run start`
- Verify `curl` responses 200 on `/`, `/auctions`, `/auctions/lot1`, `/auctions/lot5`
- **Commit:** (no code change; just the operational restart)

---

## 8. Verification checklist

Manual verification at the end of each step is the build order (Section 7). Overall end-to-end verification before declaring the sub-project done:

- [ ] `cd ~/Desktop/chaiblock && npx next build` passes with no TypeScript errors
- [ ] `/auctions/lot5` main auction countdown is under 3 minutes on fresh page load
- [ ] Tapping "Bid" on lot5 opens `BidConfirmationSheet` with landed-cost breakdown in USD + SDG
- [ ] Holding the confirm button for 500ms successfully places the bid
- [ ] After placing a bid, the price flashes green and sim bidders are silent for ~10 seconds
- [ ] When main auction ends, "MAIN AUCTION ENDED" banner appears for 1.5s
- [ ] If reserve was not met, "Seller reviewing..." sheet appears for 3s and auto-resolves to "Seller approved"
- [ ] `ClosingRoundSheet` appears with two bidder columns, investor in one of them
- [ ] Opponent places 1-3 bids during the round based on the AI
- [ ] Investor can raise via the in-sheet `BidConfirmationSheet`
- [ ] Investor can concede via the "Let it go" text link
- [ ] When the round ends, `HammeredStamp` appears for 3s
- [ ] After the stamp, the lot page shows a summary card with winner + price
- [ ] Navigating away from the lot page during any phase does NOT leak timers (no "setState on unmounted" warnings in console)
- [ ] Other lots (lot1-lot8 except lot5) still work normally in their existing `live` phase — no phase transitions until their respective main auction ends
- [ ] Tunnel URL `https://trio-assistant-essentials-mod.trycloudflare.com/auctions/lot5` returns 200 and shows the new engine

---

## 9. Risks + mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Regression in working demo — this touches the live lot detail page already shipped at the tunnel URL | HIGH | Stability-first build order (Section 7). `npm run build` after each step. Revert-per-commit possible. |
| Hydration mismatch from new clock calling `Date.now()` on server render | MEDIUM | `useAuctionClock` follows the same lazy-useState + useEffect pattern as the C9 review fix. Server renders a stable placeholder phase. |
| Investor taps bid but closing round never fires because main auction is 20+ min away | HIGH | Demo-mode: lot5 has a 3-min main auction via `ACTIVE_LOT_TIMING` override. Pitch cheat sheet: "open /auctions/lot5 first". |
| Opponent AI feels robotic or too predictable | MEDIUM | Randomized delays + seeded-by-city personality + 60% win probability variable. |
| Investor accidentally taps "Concede" mid-round | LOW | Concede is a small text link, not a button. Label is explicit: "Let it go — concede". No hold-to-confirm needed since there's no financial consequence in demo. |
| Build-time static rendering caches new lot5 timing | MEDIUM | Already mitigated in prior review fixes via `export const dynamic = "force-dynamic"` on `/auctions/[id]`. |
| `setTimeout` chains leak when user navigates away mid-phase | MEDIUM | All phase transitions use a single `phaseTransitionRef` cleared on unmount, same pattern as the `useSimulatedBidding` review fix. |
| Tunnel still pointing at old production build after implementation | LOW | Step 10 of build order explicitly rebuilds and restarts the production server + re-verifies tunnel. |
| The `pending_review` branch may not fire if investor over-bids in main auction | LOW | Both branches (reserve met → direct to closing round; reserve not met → pending review first) are supported. Demo doesn't depend on which one fires. |

---

## 10. Rollback plan

Commit-granular rollback. No feature flag, no env var toggle — cleaner for a pitch-critical demo.

If something breaks pre-pitch:
- **Worst case:** `git reset --hard ae748f2` (review-fixes commit) + `npm run build && npm run start` restores the stable prior state. ~60 seconds to recovery.
- **Partial rollback:** `git revert <step-N-commit>` undoes the specific build-order step. Earlier steps stay in.
- **Emergency:** revert only the final integration commit (Step 9) — the new components still exist but are no longer wired up in `lot-detail-client.tsx`, so the demo reverts to the current `ae748f2` experience while the new code sits dormant in the repo.

---

## 11. Open questions resolved during brainstorming

| # | Question | Answer |
|---|----------|--------|
| 1 | Which sub-project from the Ultraplan to do first? | Live auction engine + bid confirmation |
| 2 | Will the investor drive the demo or watch? | Investor drives (places bids themselves) |
| 3 | What happens when the investor bids? | Investor sometimes wins, sometimes gets outbid (60% win probability in closing round) |
| 4 | Closing round mechanic required? | Yes — TradeRev's core differentiator; always fires |
| 5 | Closing round length? | 60s base + up to 45s extensions (3 × 15s) |
| 6 | Force investor into `topTwo` snapshot? | Yes — demo artifice, guarantees closing round participation |
| 7 | Investor pause window after they bid? | 10 seconds of sim silence |
| 8 | Opponent AI win probability? | 60% for investor, 40% for opponent |
| 9 | Concede button in closing round? | Yes — small text link, always available |
| 10 | Approach scope? | Approach A (Pitch Essentials) + closing round addition |
| 11 | Lane/simulcast mode? | Out of scope. Separate sub-project. |
| 12 | `AuctionEventBus` typed pub-sub? | Out of scope. Plain props + callbacks. |
| 13 | `BidIntent` full state machine module? | Out of scope. Component-local state. |
| 14 | Hydration mismatch handling? | Same lazy-useState + useEffect pattern as the C9 review fix. |
| 15 | Spec location? | `docs/superpowers/specs/2026-04-13-live-auction-engine-design.md` |
| 16 | Rollback strategy? | Commit-granular. No env flag. |
| 17 | Demo-fast lot choice? | lot5 (Uji Matcha, 5kg premium) — dramatic dollar amounts, memorable |

---

## 12. Next step

After user review and approval of this spec, invoke `superpowers:writing-plans` to generate a detailed step-by-step implementation plan. The writing-plans skill will translate this design into an executable checklist with code locations, acceptance criteria per task, and test points.
