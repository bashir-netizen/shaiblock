# Unified Market Vibe — Landing Page + Auctions List Redesign

## Goal

Unify the landing page and auctions list with the warm trading terminal aesthetic already shipped on the lot detail page. Strip the landing page down to a lean pitch: market ticker, compressed hero, stats bar, featured auctions, activity feed. Restyle the auctions list with the same emerald/amber/monospace/green-red language.

## Landing Page (`src/app/page.tsx`)

### Sections to DELETE

- How It Works (4-step cards)
- Tea Condition Report / "The Moat" narrative section
- Press / trust logo grid
- Testimonials
- Big CTA block
- Verbose footer (replace with minimal version)

### Sections to KEEP (top to bottom)

**1. Market ticker tape**
- Reuse `<MarketTicker>` from `src/components/market-ticker.tsx`
- Remove the `md:hidden` class from MarketTicker so it renders on all screen sizes (currently mobile-only)
- Pass `tickerItems` computed from `getMarketTickerItems()` in the server component
- Sits at the very top of the page, above the hero

**2. Hero — compressed (~280px mobile)**
- Keep the emerald gradient background image treatment
- Keep the Arabic شاي watermark
- Gut the copy down to:
  - Headline (Fraunces serif, white): "Sudan's Tea Trading Floor"
  - Sub-copy (Inter, white/70): "Live auctions. Direct from origin. $2.4M+ in volume."
  - Single CTA button (amber accent): "Enter the Market →" linking to `/auctions`
- Remove: the long paragraph, the secondary "How It Works" link, the dual-language sub-headline
- Total height capped — no full-bleed hero. `min-h-[280px]` on mobile, `min-h-[360px]` on desktop.

**3. Live stats bar**
- The existing trust bar numbers: 8 live auctions, 12 wholesalers, 200+ retailers, $2.4M volume
- Restyle as a monospace stats strip on warm beige background
- Layout: horizontal row on desktop, 2x2 grid on mobile
- Each stat: big monospace number (emerald) + small uppercase label (muted)
- Thin border-bottom separating from the next section

**4. Featured auctions (3-card grid)**
- Keep the existing `getActiveLots().slice(0, 3)` logic
- Cards use `<AuctionCard>` (restyled per the auctions list section below)
- Section header: "Featured Lots" in small uppercase tracking, no serif

**5. Activity ticker (vertical feed)**
- Keep the existing `<ActivityTicker>` component
- Change header from "Live on ShaiBlock" to "Market Activity"
- Keep monospace prices, pulsing indicator, opacity fade

**6. Minimal footer**
- ShaiBlock wordmark/logo
- One line: "Sudan's direct tea marketplace"
- Copyright line
- No link grid, no social icons, no newsletter signup

## Auctions List Page

### `src/app/auctions/auction-feed-client.tsx`

**1. Replace LiveActivityBar with MarketTicker**
- Remove the existing `LiveActivityBar` component (inline in this file)
- Replace with `<MarketTicker items={tickerItems} />` at the top
- `tickerItems` passed from the server component (`src/app/auctions/page.tsx`)

**2. Filter chips restyle**
- Active: `bg-[var(--color-primary)] text-white` (emerald)
- Inactive: `bg-[var(--color-bg)] border border-[var(--color-rule)] text-[var(--color-ink-muted)]`

**3. Section header enhancement**
- Keep "LIVE AUCTIONS" serif title
- Add monospace market stat line: "{N} lots · {totalBids} bids today"
- Stats computed from the lots data already available

**4. AuctionCard restyle** (`src/components/auction-card.tsx`)
- Card background: `bg-[var(--color-bg)]` (warm beige) instead of `bg-card`
- Current bid price: ensure PriceDisplay uses emerald color
- "LIVE" badge stays red (danger = urgency, not error)
- Everything else stays — image overlay, countdown, cupping badge, buy-now row

### `src/app/auctions/page.tsx` (server component)
- Import `getMarketTickerItems` and pass `tickerItems` prop to `AuctionFeedClient`

## MarketTicker visibility change

Currently `<MarketTicker>` has `md:hidden` in its root div. Change to render on ALL screen sizes — remove the `md:hidden` class. The ticker should appear on landing page, auctions list, AND lot detail on all viewports.

## Files to Create

None — all components already exist.

## Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Strip to 6 lean sections, add MarketTicker, compress hero, restyle stats, minimal footer |
| `src/app/auctions/page.tsx` | Pass tickerItems prop |
| `src/app/auctions/auction-feed-client.tsx` | Replace LiveActivityBar with MarketTicker, restyle chips, enhance header |
| `src/components/auction-card.tsx` | Card bg to warm beige |
| `src/components/market-ticker.tsx` | Remove `md:hidden` |
| `src/components/landing/activity-ticker.tsx` | Header text "Live on ShaiBlock" → "Market Activity" |

## What Stays the Same

- Lot detail page — already done, no changes
- `useSimulatedBidding`, `useAuctionClock` — no changes
- Toast system, bid panel, price band, tabs — no changes
- Closing round, hammer stamp, pending review — no changes
- Mock data — no changes (sold lots already added)
- Design tokens / globals.css — no changes

## Verification

1. `npx next build` passes
2. Restart server
3. Landing page on mobile: ticker at top → compressed hero → stats bar → 3 auction cards → market activity feed → minimal footer. No brochure sections.
4. Auctions list: ticker at top → filter chips in emerald/beige → auction cards on warm beige background
5. Navigate lot5: ticker → price band → tabs → bid panel. Same as before.
6. Visual coherence: all three pages share the ticker tape, emerald/amber colors, monospace prices, warm beige backgrounds
7. Commit + push
