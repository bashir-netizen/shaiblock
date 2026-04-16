# Warm Trading Terminal — Lot Detail Page Redesign

## Goal

Redesign the lot detail page (`/auctions/[id]`) to feel like a trading terminal — sparkline chart, green/red directional arrows, live order book, horizontal market ticker, recent sold-lot feed — while keeping ShaiBlock's warm catalog-paper palette, Fraunces serif, emerald primary, amber accent, and Arabic design touches. The landing page and auctions list remain unchanged.

## Architecture

The lot detail page shifts from a single long scroll (sandwich layout) to a **tabbed trading desk** with a persistent price band and sparkline at the top. A horizontal ticker tape scrolls across all active/sold lots just below the top bar.

Mobile-first. Desktop layout unchanged in this spec (future pass).

### Final mobile stack (top to bottom)

```
Emerald top bar          ~58px   (lot title, lot number, LIVE badge)
Horizontal ticker tape   ~28px   (all lots, green/red arrows, infinite scroll)
Price band + sparkline   ~140px  (big price, ▲/▼ arrow, change badge, SDG, sparkline)
Tab bar                  ~36px   (Market Feed | Lot Details | Cupping)
Tab content              flex    (scrollable, varies by tab)
Pinned bid panel         ~220px  (countdown, emerald pills, amber Place Bid)
```

## Data Model Changes

### New fields on the `Lot` type (`src/lib/types.ts`)

```ts
final_price_per_kg?: number;   // set when status is "sold"
sold_at?: string;              // ISO timestamp
winning_buyer_id?: string;     // references a buyer profile
```

### Historical sold lots (`src/lib/mock-data.ts`)

Add 6 lots with `status: "sold"` to the existing `lots` array. These represent today's and yesterday's completed auctions — different lots from the 8 active ones. Each has `final_price_per_kg`, `sold_at`, and `winning_buyer_id` populated.

Lot mix for market credibility:
- 2 Kenyan CTC (commodity grade, $3-5/kg range)
- 1 Rwandan orthodox black (same origin as lot5, $28-32/kg range)
- 1 Ugandan BOP ($2-3/kg range)
- 1 Darjeeling first flush ($15-20/kg range)
- 1 Ceylon OP1 ($7-9/kg range)

Each sold lot computes `premium_pct = ((final_price - reserve_price) / reserve_price) * 100` — this drives the green ▲ / red ▼ badge in the market feed. Most should be positive (healthy market signal), 1-2 negative (realism).

### New helper functions

- `getSoldLots(): Lot[]` — filters `lots` where `status === "sold"`, sorted by `sold_at` descending
- `getMarketTickerItems(): TickerItem[]` — merges active lots (current high vs starting price) and sold lots (final vs reserve) into a flat array of `{ symbol, price, change, direction }` for the ticker tape

### TickerItem type

```ts
interface TickerItem {
  symbol: string;        // e.g. "KE CTC", "RW OP1"
  price: number;
  change: number;
  direction: "up" | "down";
}
```

## New Components

### 1. `MarketTicker` (`src/components/market-ticker.tsx`)

Horizontal scrolling ticker tape. Thin strip (~28px) on warm beige background.

**Props:** `items: TickerItem[]`

**Rendering:**
- Each item: lot symbol (muted brown text) + price (dark monospace) + change with ▲/▼ (green/red)
- Items duplicated once in the DOM for seamless infinite CSS loop
- Animation: `@keyframes ticker-scroll` — linear, continuous, ~30s per cycle
- Gap between items: ~24px

**Styling:** warm beige background (`--color-bg`), subtle bottom border (`--color-rule`). Fade masks on left/right edges via CSS gradient overlay.

### 2. `PriceBand` (`src/components/price-band.tsx`)

Hero price display with sparkline chart. Replaces the current sticky summary card on mobile.

**Props:**
```ts
{
  currentHigh: number;
  openingPrice: number;  // lot.starting_price_per_kg
  bids: SimulatedBid[];  // for sparkline data points
  auctionStart: string;  // ISO, for sparkline x-axis
  auctionEnd: string;
  originFlag: string;
  originRegion: string;
  teaType: string;
  grade: string;
}
```

**Sections (top to bottom within the component):**
- "Current High Bid" label — 8px uppercase tracking, muted brown
- Big price row: monospace 28px bold in emerald + ▲/▼ arrow + `/kg` unit. Right-aligned: green pill badge showing `+$X.XX ▲` change from opening price
- SDG conversion — 9px amber monospace
- Sparkline chart — 48px tall inline SVG. X-axis: auction start to now. Y-axis: min bid to max bid. Line stroke in emerald, fill gradient fading to transparent. Plotted from `bids` array timestamps and amounts. No axis labels on mobile (too small), just the line shape.

**Sparkline data:** Extract `{ x: bid.placed_at, y: bid.amount_per_kg }` from the bids array. Plot as a polyline. Update reactively as new bids arrive — the line extends rightward in real-time.

**Background:** warm beige (`--color-bg`), bottom border 3px emerald.

### 3. `LotDetailTabs` (`src/components/lot-detail-tabs.tsx`)

Tab switcher with three panes. Simple `useState` tab index, no routing.

**Tabs:**
- **Market Feed** (default on load): renders `<MarketFeed />` + restyled `<BidHistory />`
- **Lot Details**: renders the current scrollable middle content — photo carousel, title, origin, description, seller card, lot stats grid
- **Cupping**: renders the cupping radar chart + tasting notes (pulled from the current scroll into a focused view)

**Tab bar styling:** warm beige background, muted brown text, active tab gets emerald text + 2px emerald bottom border.

**Content area:** scrollable, takes remaining height between tab bar and pinned bid panel. Each tab's content is only rendered when active (not hidden with CSS — unmounted to save memory on mobile).

### 4. `MarketFeed` (`src/components/market-feed.tsx`)

The "Recent Market" sold-lots feed inside the Market Feed tab.

**Props:** `soldLots: Lot[]`

**Each row:**
- Left: lot title in Fraunces serif (9.5px bold) + origin + "Sold Xm ago" + winning buyer city in muted
- Right: final price in monospace bold + premium/discount badge
- Premium badge: `+X% ▲` in green or `-X% ▼` in red, computed from `(final_price - reserve_price) / reserve_price * 100`

**Styling:** warm paper background, subtle border-bottom between rows. No animation — this is the calm "settled market" counterpoint to the live bid activity above it.

## Modified Components

### `PriceDisplay` (`src/components/price-display.tsx`)

Add optional `trend` prop:

```ts
trend?: "up" | "down";
```

When set, the price text gets `text-success` (green) or `text-danger` (red), and a small ▲/▼ arrow renders inline before the dollar sign.

### `BidHistory` (`src/components/bid-history.tsx`)

Restyle for the trading desk context:
- Header changes from "Live Bid Activity" to "Live Orders"
- Each bid row gets a directional arrow: green ▲ if the bid is higher than the previous one, rendered next to the price
- Newest row: green left border pulse (2px, fades after 2s) instead of the current green background
- Keep the `slideInBid` entrance animation

### `BidPanel` (`src/components/bid-panel.tsx`)

Restyle the pinned mobile mode:
- Quick-bid pills: emerald background (`--color-primary`), light green text
- Place Bid button: amber background (`--color-accent`), white text
- Countdown: emerald monospace
- Bid count + watching count on the same row as countdown

No structural changes — same props, same handlers, same onClick flow.

### `lot-detail-client.tsx` (`src/app/auctions/[id]/lot-detail-client.tsx`)

Major restructure of the mobile render tree:

**Remove:**
- The current sticky summary card (`md:hidden sticky top-[58px]`)
- The free-scroll middle section wrapping photos/TCR/cupping/seller/bid-history

**Add:**
- `<MarketTicker items={tickerItems} />` below the top bar
- `<PriceBand ... />` below the ticker
- `<LotDetailTabs>` with three tab panes containing the redistributed content
- Compute `tickerItems` from `getActiveLots()` + `getSoldLots()` — passed as props from the server component or computed client-side

**Desktop layout:** unchanged for now. The right column still gets the original `BidPanel` + `BidHistory`. Market ticker and price band are `md:hidden`.

## Design Tokens

No new CSS custom properties needed. Reuse existing palette:
- Green arrows: `--color-success` (#1E7D4C)
- Red arrows: `--color-danger` (#8A1C1C)
- Ticker/price band background: `--color-bg` (#F7F1E3)
- Tab active: `--color-primary` (#0F5132)
- Bid pills: `--color-primary`
- Place Bid button: `--color-accent` (#B56B1B)
- Monospace prices: `--font-mono` (JetBrains Mono)
- Serif titles: `--font-serif` (Fraunces)

New animation keyframe:
```css
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
```

## What Stays the Same

- Landing page — no changes
- Auctions list page — no changes
- Desktop lot detail layout — no changes (future pass)
- Closing round sheet, pending review sheet, main-ended overlay, hammered stamp — no changes
- `useSimulatedBidding` hook — no changes (already provides all needed data)
- `useAuctionClock` hook — no changes
- Toast system — no changes

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/market-ticker.tsx` | Horizontal scrolling ticker tape |
| `src/components/price-band.tsx` | Hero price display + sparkline |
| `src/components/lot-detail-tabs.tsx` | Tab switcher (Market Feed / Lot Details / Cupping) |
| `src/components/market-feed.tsx` | Sold-lots feed with premium/discount arrows |

## Files to Modify

| File | Change |
|------|--------|
| `src/lib/types.ts` | Add 3 optional fields to Lot type |
| `src/lib/mock-data.ts` | Add 6 sold lots, `getSoldLots()`, `getMarketTickerItems()` |
| `src/components/price-display.tsx` | Add optional `trend` prop with arrow + color |
| `src/components/bid-history.tsx` | Restyle header, add directional arrows, green border pulse |
| `src/components/bid-panel.tsx` | Restyle pinned mode colors (emerald pills, amber button) |
| `src/app/auctions/[id]/lot-detail-client.tsx` | Major mobile restructure — ticker, price band, tabs |
| `src/app/globals.css` | Add `ticker-scroll` keyframe |

## Out of Scope

- Desktop lot detail layout (future pass)
- Landing page changes
- Auctions list page changes
- Real-time WebSocket data (mock data only)
- Historical price charts beyond the current auction's sparkline
- Dark mode / theme toggle
- Arabic RTL localization
- Demo video script updates (separate task after implementation)

## Verification

1. `npx next build` passes with no errors
2. Restart production server
3. Open `/auctions/lot5` on mobile viewport (390x844):
   - Horizontal ticker scrolls continuously with green/red arrows
   - Price band shows current high with ▲ arrow and change badge
   - Sparkline updates as sim bids arrive
   - SDG conversion visible in amber
   - Three tabs work: Market Feed (default), Lot Details, Cupping
   - Market Feed shows sold lots with premium/discount percentages
   - Live Orders (bid history) shows directional arrows on each bid
   - Bid panel has emerald pills, amber Place Bid button
4. Place a bid via quick pill — price band updates, sparkline extends, toast fires (single, not double)
5. Wait for auction end → closing round → SOLD — all overlays still work correctly on top of the new layout
6. Commit + push
