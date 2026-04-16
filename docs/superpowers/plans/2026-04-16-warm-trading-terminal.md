# Warm Trading Terminal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the lot detail mobile page as a warm trading terminal with horizontal market ticker, price band with sparkline, tabbed layout (Market Feed / Lot Details / Cupping), and green/red directional arrows — while keeping ShaiBlock's catalog-paper palette and brand identity.

**Architecture:** Add 6 sold lots to the data model, build 4 new components (MarketTicker, PriceBand, LotDetailTabs, MarketFeed), modify 4 existing components (PriceDisplay, BidHistory, BidPanel, lot-detail-client), and add one CSS keyframe. The lot detail mobile render tree changes from a single scroll to a tabbed trading desk with a persistent price band above the tabs.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Fraunces/Inter/JetBrains Mono fonts.

**Spec:** `docs/superpowers/specs/2026-04-16-warm-trading-terminal-design.md`

**Important context:** This is a demo-only repo with no test infrastructure. Steps skip TDD — verification is via `npx next build` + visual inspection. All data is mock/simulated.

---

### Task 1: Data Model — Sold Lots + Helper Functions

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/mock-data.ts`

- [ ] **Step 1: Add optional fields to the Lot type**

In `src/lib/types.ts`, find the `Lot` interface and add three fields after the `current_high_bid` field (around line 148):

```typescript
  current_high_bid?: number;
  user_is_winning?: boolean;

  // Trading terminal — sold lot fields
  final_price_per_kg?: number;
  sold_at?: string;
  winning_buyer_id?: string;
}
```

- [ ] **Step 2: Add the TickerItem type**

In `src/lib/types.ts`, add at the bottom of the file:

```typescript
export interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  direction: "up" | "down";
}
```

- [ ] **Step 3: Add 6 sold lots to mock-data.ts**

In `src/lib/mock-data.ts`, add these lots to the `lots` array after the last active lot (lot8) and before the ended lots (lot9):

```typescript
  // ============================================================
  // Sold lots — yesterday's and today's completed auctions
  // Used by the Market Feed and horizontal ticker on lot detail.
  // ============================================================
  {
    id: "sold1",
    seller_id: "s1",
    lot_number: "SB-2026-00135",
    title: "Kenya CTC PF1 - Feb 2026",
    description: "Strong brisk CTC from Kericho highlands.",
    origin_country: "KE",
    origin_region: "Kericho",
    estate_name: "Kipkelion Estate",
    tea_type: "black",
    grade: "CTC PF1",
    harvest_date: "2026-02-20",
    harvest_season: "rain",
    processing_method: "CTC",
    elevation_meters: 2100,
    certifications: ["Rainforest Alliance"],
    cupping: { aroma: 7.0, body: 8.0, color: 7.5, briskness: 8.5, flavor: 7.5, finish: 7.0, overall: 7.5 },
    cupping_notes: "Bright copper liquor, malty with clean finish.",
    cupped_by: "James Mwangi",
    cupping_date: "2026-02-25",
    photo_dry_leaf: "/placeholder-tea-dry.jpg",
    photo_wet_leaf: "/placeholder-tea-wet.jpg",
    photo_liquor: "/placeholder-tea-liquor.jpg",
    photo_packaging: "/placeholder-tea-pack.jpg",
    photos_additional: [],
    total_kg: 200,
    min_purchase_kg: 50,
    reserve_price_per_kg: 3.8,
    starting_price_per_kg: 3.0,
    bid_increment: 0.1,
    currency: "USD",
    auction_duration_minutes: 45,
    auction_start: minutesAgo(120),
    auction_end: minutesAgo(75),
    auto_extend_minutes: 3,
    status: "sold",
    sample_available: false,
    ships_from_country: "KE",
    ships_from_city: "Mombasa",
    estimated_ship_days: 7,
    view_count: 134,
    bid_count: 22,
    watch_count: 38,
    created_at: daysAgo(3),
    updated_at: minutesAgo(75),
    seller: sellers[0],
    current_high_bid: 4.55,
    final_price_per_kg: 4.55,
    sold_at: minutesAgo(75),
    winning_buyer_id: "b1",
  },
  {
    id: "sold2",
    seller_id: "s3",
    lot_number: "SB-2026-00136",
    title: "Uganda BOP - March 2026",
    description: "Solid broken orange pekoe from western Uganda.",
    origin_country: "UG",
    origin_region: "Fort Portal",
    estate_name: "Rwenzori Tea Growers",
    tea_type: "black",
    grade: "BOP",
    harvest_date: "2026-03-05",
    harvest_season: "rain",
    processing_method: "CTC",
    elevation_meters: 1600,
    certifications: [],
    cupping: { aroma: 6.5, body: 7.0, color: 7.0, briskness: 7.5, flavor: 6.5, finish: 6.5, overall: 6.8 },
    cupping_notes: "Medium body, slightly astringent, good for blending.",
    cupped_by: "Grace Akello",
    cupping_date: "2026-03-08",
    photo_dry_leaf: "/placeholder-tea-dry.jpg",
    photo_wet_leaf: "/placeholder-tea-wet.jpg",
    photo_liquor: "/placeholder-tea-liquor.jpg",
    photo_packaging: "/placeholder-tea-pack.jpg",
    photos_additional: [],
    total_kg: 500,
    min_purchase_kg: 100,
    reserve_price_per_kg: 2.5,
    starting_price_per_kg: 2.0,
    bid_increment: 0.05,
    currency: "USD",
    auction_duration_minutes: 45,
    auction_start: minutesAgo(90),
    auction_end: minutesAgo(45),
    auto_extend_minutes: 3,
    status: "sold",
    sample_available: false,
    ships_from_country: "UG",
    ships_from_city: "Kampala",
    estimated_ship_days: 10,
    view_count: 67,
    bid_count: 14,
    watch_count: 19,
    created_at: daysAgo(2),
    updated_at: minutesAgo(45),
    seller: sellers[2],
    current_high_bid: 2.95,
    final_price_per_kg: 2.95,
    sold_at: minutesAgo(45),
    winning_buyer_id: "b3",
  },
  {
    id: "sold3",
    seller_id: "s4",
    lot_number: "SB-2026-00137",
    title: "Rwanda OP1 - Feb 2026",
    description: "Hand-rolled orthodox from Nyungwe.",
    origin_country: "RW",
    origin_region: "Nyungwe",
    estate_name: "Nyungwe Tea Cooperative",
    tea_type: "black",
    grade: "OP1",
    harvest_date: "2026-02-28",
    harvest_season: "rain",
    processing_method: "orthodox",
    elevation_meters: 2400,
    certifications: ["UTZ Certified"],
    cupping: { aroma: 8.0, body: 8.5, color: 8.2, briskness: 8.0, flavor: 8.2, finish: 8.0, overall: 8.2 },
    cupping_notes: "Rich malty body, stone fruit, clean finish.",
    cupped_by: "Marie Uwase",
    cupping_date: "2026-03-02",
    photo_dry_leaf: "/placeholder-tea-dry.jpg",
    photo_wet_leaf: "/placeholder-tea-wet.jpg",
    photo_liquor: "/placeholder-tea-liquor.jpg",
    photo_packaging: "/placeholder-tea-pack.jpg",
    photos_additional: [],
    total_kg: 8,
    min_purchase_kg: 1,
    reserve_price_per_kg: 28.0,
    starting_price_per_kg: 22.0,
    bid_increment: 0.5,
    currency: "USD",
    auction_duration_minutes: 30,
    auction_start: minutesAgo(180),
    auction_end: minutesAgo(150),
    auto_extend_minutes: 3,
    status: "sold",
    sample_available: false,
    ships_from_country: "RW",
    ships_from_city: "Kigali",
    estimated_ship_days: 7,
    view_count: 201,
    bid_count: 31,
    watch_count: 55,
    created_at: daysAgo(4),
    updated_at: minutesAgo(150),
    seller: sellers[3],
    current_high_bid: 31.20,
    final_price_per_kg: 31.20,
    sold_at: minutesAgo(150),
    winning_buyer_id: "b2",
  },
  {
    id: "sold4",
    seller_id: "s2",
    lot_number: "SB-2026-00138",
    title: "Darjeeling First Flush - Spring 2026",
    description: "Light, floral, muscatel character from Makaibari estate.",
    origin_country: "IN",
    origin_region: "Darjeeling",
    estate_name: "Makaibari Estate",
    tea_type: "black",
    grade: "FTGFOP1",
    harvest_date: "2026-03-20",
    harvest_season: "first_flush",
    processing_method: "orthodox",
    elevation_meters: 1500,
    certifications: ["Organic", "Fairtrade"],
    cupping: { aroma: 9.0, body: 6.5, color: 7.0, briskness: 7.0, flavor: 9.0, finish: 8.5, overall: 8.5 },
    cupping_notes: "Delicate muscatel with floral top notes, light amber liquor.",
    cupped_by: "Rajesh Gupta",
    cupping_date: "2026-03-22",
    photo_dry_leaf: "/placeholder-tea-dry.jpg",
    photo_wet_leaf: "/placeholder-tea-wet.jpg",
    photo_liquor: "/placeholder-tea-liquor.jpg",
    photo_packaging: "/placeholder-tea-pack.jpg",
    photos_additional: [],
    total_kg: 3,
    min_purchase_kg: 1,
    reserve_price_per_kg: 18.0,
    starting_price_per_kg: 14.0,
    bid_increment: 0.5,
    currency: "USD",
    auction_duration_minutes: 30,
    auction_start: minutesAgo(240),
    auction_end: minutesAgo(210),
    auto_extend_minutes: 3,
    status: "sold",
    sample_available: false,
    ships_from_country: "IN",
    ships_from_city: "Kolkata",
    estimated_ship_days: 12,
    view_count: 156,
    bid_count: 19,
    watch_count: 44,
    created_at: daysAgo(5),
    updated_at: minutesAgo(210),
    seller: sellers[1],
    current_high_bid: 19.80,
    final_price_per_kg: 19.80,
    sold_at: minutesAgo(210),
    winning_buyer_id: "b4",
  },
  {
    id: "sold5",
    seller_id: "s1",
    lot_number: "SB-2026-00139",
    title: "Ceylon OP1 - March 2026",
    description: "Bright, full-bodied orthodox from Nuwara Eliya.",
    origin_country: "LK",
    origin_region: "Nuwara Eliya",
    estate_name: "Pedro Estate",
    tea_type: "black",
    grade: "OP1",
    harvest_date: "2026-03-12",
    harvest_season: "rain",
    processing_method: "orthodox",
    elevation_meters: 1900,
    certifications: ["Rainforest Alliance"],
    cupping: { aroma: 8.0, body: 7.5, color: 8.5, briskness: 8.0, flavor: 8.0, finish: 7.5, overall: 7.9 },
    cupping_notes: "Bright amber, citrus notes, brisk and clean.",
    cupped_by: "Anil Perera",
    cupping_date: "2026-03-14",
    photo_dry_leaf: "/placeholder-tea-dry.jpg",
    photo_wet_leaf: "/placeholder-tea-wet.jpg",
    photo_liquor: "/placeholder-tea-liquor.jpg",
    photo_packaging: "/placeholder-tea-pack.jpg",
    photos_additional: [],
    total_kg: 25,
    min_purchase_kg: 5,
    reserve_price_per_kg: 7.0,
    starting_price_per_kg: 5.0,
    bid_increment: 0.2,
    currency: "USD",
    auction_duration_minutes: 45,
    auction_start: minutesAgo(60),
    auction_end: minutesAgo(15),
    auto_extend_minutes: 3,
    status: "sold",
    sample_available: false,
    ships_from_country: "LK",
    ships_from_city: "Colombo",
    estimated_ship_days: 10,
    view_count: 89,
    bid_count: 16,
    watch_count: 27,
    created_at: daysAgo(3),
    updated_at: minutesAgo(15),
    seller: sellers[0],
    current_high_bid: 8.40,
    final_price_per_kg: 8.40,
    sold_at: minutesAgo(15),
    winning_buyer_id: "b5",
  },
  {
    id: "sold6",
    seller_id: "s3",
    lot_number: "SB-2026-00140",
    title: "Kenya CTC BP1 - March 2026",
    description: "Bulk-grade broken pekoe, good for blending.",
    origin_country: "KE",
    origin_region: "Nandi Hills",
    estate_name: "Nandi Tea Factory",
    tea_type: "black",
    grade: "CTC BP1",
    harvest_date: "2026-03-08",
    harvest_season: "rain",
    processing_method: "CTC",
    elevation_meters: 2000,
    certifications: [],
    cupping: { aroma: 6.0, body: 7.5, color: 7.0, briskness: 8.0, flavor: 6.5, finish: 6.0, overall: 6.8 },
    cupping_notes: "Strong, full body, slightly dusty, blends well.",
    cupped_by: "James Mwangi",
    cupping_date: "2026-03-10",
    photo_dry_leaf: "/placeholder-tea-dry.jpg",
    photo_wet_leaf: "/placeholder-tea-wet.jpg",
    photo_liquor: "/placeholder-tea-liquor.jpg",
    photo_packaging: "/placeholder-tea-pack.jpg",
    photos_additional: [],
    total_kg: 300,
    min_purchase_kg: 50,
    reserve_price_per_kg: 3.2,
    starting_price_per_kg: 2.5,
    bid_increment: 0.05,
    currency: "USD",
    auction_duration_minutes: 45,
    auction_start: minutesAgo(360),
    auction_end: minutesAgo(315),
    auto_extend_minutes: 3,
    status: "sold",
    sample_available: false,
    ships_from_country: "KE",
    ships_from_city: "Mombasa",
    estimated_ship_days: 7,
    view_count: 45,
    bid_count: 9,
    watch_count: 11,
    created_at: daysAgo(4),
    updated_at: minutesAgo(315),
    seller: sellers[2],
    current_high_bid: 3.10,
    final_price_per_kg: 3.10,
    sold_at: minutesAgo(315),
    winning_buyer_id: "b1",
  },
```

Premium breakdown (final vs reserve):
- sold1: $4.55 vs $3.80 = **+19.7%** ▲
- sold2: $2.95 vs $2.50 = **+18.0%** ▲
- sold3: $31.20 vs $28.00 = **+11.4%** ▲
- sold4: $19.80 vs $18.00 = **+10.0%** ▲
- sold5: $8.40 vs $7.00 = **+20.0%** ▲
- sold6: $3.10 vs $3.20 = **-3.1%** ▼ (one negative, mild)

- [ ] **Step 4: Add getSoldLots() and getMarketTickerItems() helpers**

Add at the bottom of `src/lib/mock-data.ts`, after the existing `getProfileById` function:

```typescript
export function getSoldLots(): Lot[] {
  return lots
    .filter((l) => l.status === "sold")
    .sort(
      (a, b) =>
        new Date(b.sold_at!).getTime() - new Date(a.sold_at!).getTime()
    );
}

export function getMarketTickerItems(): TickerItem[] {
  const active = getActiveLots().map((l) => {
    const current = l.current_high_bid || l.starting_price_per_kg;
    const change = +(current - l.starting_price_per_kg).toFixed(2);
    const parts = `${getCountryFlag(l.origin_country)} ${l.grade}`.trim();
    return {
      symbol: parts,
      price: current,
      change: Math.abs(change),
      direction: (change >= 0 ? "up" : "down") as "up" | "down",
    };
  });

  const sold = getSoldLots().map((l) => {
    const final_ = l.final_price_per_kg!;
    const change = +(final_ - l.reserve_price_per_kg).toFixed(2);
    const parts = `${getCountryFlag(l.origin_country)} ${l.grade}`.trim();
    return {
      symbol: parts,
      price: final_,
      change: Math.abs(change),
      direction: (change >= 0 ? "up" : "down") as "up" | "down",
    };
  });

  return [...active, ...sold];
}
```

Add the import at the top of `mock-data.ts`:

```typescript
import type { TickerItem } from "./types";
```

Also import `getCountryFlag` from `./utils`:

```typescript
import { getCountryFlag } from "./utils";
```

- [ ] **Step 5: Build and verify**

Run: `npx next build`
Expected: Compiles successfully with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/mock-data.ts
git commit -m "feat: add sold lots data model + ticker/market helpers"
```

---

### Task 2: MarketTicker Component

**Files:**
- Create: `src/components/market-ticker.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add the ticker-scroll keyframe**

In `src/app/globals.css`, add after the existing `.animate-skeleton-breathe` rule (around line 223):

```css
@keyframes ticker-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.animate-ticker-scroll {
  animation: ticker-scroll 35s linear infinite;
}
```

- [ ] **Step 2: Create the MarketTicker component**

Create `src/components/market-ticker.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import type { TickerItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface MarketTickerProps {
  items: TickerItem[];
}

export function MarketTicker({ items }: MarketTickerProps) {
  const doubled = useMemo(() => [...items, ...items], [items]);

  if (items.length === 0) return null;

  return (
    <div className="md:hidden bg-[var(--color-bg)] border-b border-[var(--color-rule)] overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[var(--color-bg)] to-transparent z-10 pointer-events-none" />
      <div className="flex items-center gap-6 py-1.5 px-2 whitespace-nowrap animate-ticker-scroll">
        {doubled.map((item, i) => (
          <span key={`${item.symbol}-${i}`} className="inline-flex items-center gap-1.5 text-[10px] font-mono tabular-nums">
            <span className="text-[var(--color-ink-muted)] font-semibold">{item.symbol}</span>
            <span className="text-foreground font-bold">{formatPrice(item.price)}</span>
            <span className={item.direction === "up" ? "text-[var(--color-success)] font-bold" : "text-[var(--color-danger)] font-bold"}>
              {item.direction === "up" ? "▲" : "▼"}{formatPrice(item.change)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 4: Commit**

```bash
git add src/components/market-ticker.tsx src/app/globals.css
git commit -m "feat: MarketTicker horizontal scrolling component"
```

---

### Task 3: PriceBand Component with Sparkline

**Files:**
- Create: `src/components/price-band.tsx`

- [ ] **Step 1: Create PriceBand**

Create `src/components/price-band.tsx`:

```tsx
"use client";

import { useMemo } from "react";
import type { SimulatedBid } from "@/hooks/use-simulated-bidding";
import { formatPrice, formatSDG, getCountryFlag, cn } from "@/lib/utils";

interface PriceBandProps {
  currentHigh: number;
  openingPrice: number;
  bids: SimulatedBid[];
  originCountry: string;
  originRegion?: string;
  teaType: string;
  grade: string;
}

function Sparkline({ bids, className }: { bids: SimulatedBid[]; className?: string }) {
  const points = useMemo(() => {
    if (bids.length === 0) return [];
    const sorted = [...bids]
      .sort((a, b) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime());
    const minTime = new Date(sorted[0].placed_at).getTime();
    const maxTime = new Date(sorted[sorted.length - 1].placed_at).getTime();
    const timeRange = maxTime - minTime || 1;
    const prices = sorted.map((b) => b.amount_per_kg);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    return sorted.map((b) => ({
      x: ((new Date(b.placed_at).getTime() - minTime) / timeRange) * 280 + 5,
      y: 42 - ((b.amount_per_kg - minPrice) / priceRange) * 36,
    }));
  }, [bids]);

  if (points.length < 4) {
    const y = 24;
    return (
      <svg viewBox="0 0 290 48" preserveAspectRatio="none" className={className}>
        <line x1="5" y1={y} x2="285" y2={y} stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      </svg>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L${points[points.length - 1].x.toFixed(1)},48 L${points[0].x.toFixed(1)},48 Z`;

  return (
    <svg viewBox="0 0 290 48" preserveAspectRatio="none" className={className}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkGrad)" />
      <path d={linePath} stroke="var(--color-primary)" strokeWidth="1.5" fill="none" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill="var(--color-primary)" />
    </svg>
  );
}

export function PriceBand({
  currentHigh,
  openingPrice,
  bids,
  originCountry,
  originRegion,
  teaType,
  grade,
}: PriceBandProps) {
  const change = +(currentHigh - openingPrice).toFixed(2);
  const direction = change >= 0 ? "up" : "down";

  return (
    <div className="md:hidden bg-[var(--color-bg)] border-b-[3px] border-[var(--color-primary)] px-4 py-3">
      <p className="text-[8px] font-bold uppercase tracking-[1.5px] text-[var(--color-ink-muted)] mb-1">
        Current High Bid
      </p>

      <div className="flex items-baseline justify-between">
        <div className="font-mono tabular-nums text-[28px] font-bold text-[var(--color-primary)] leading-none flex items-baseline gap-1">
          <span className={cn("text-[16px]", direction === "up" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]")}>
            {direction === "up" ? "▲" : "▼"}
          </span>
          {formatPrice(currentHigh)}
          <span className="text-[11px] text-[var(--color-ink-muted)] font-normal">/kg</span>
        </div>

        <span className={cn(
          "font-mono tabular-nums text-[9px] font-bold px-2 py-0.5 rounded-full",
          direction === "up"
            ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
            : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
        )}>
          {direction === "up" ? "+" : "-"}{formatPrice(Math.abs(change))} {direction === "up" ? "▲" : "▼"}
        </span>
      </div>

      <p className="font-mono tabular-nums text-[9px] text-[var(--color-accent)] mt-0.5">
        {formatSDG(currentHigh)} /kg
      </p>

      <div className="mt-2 h-[48px]">
        <Sparkline bids={bids} className="w-full h-full" />
      </div>

      <div className="flex items-center gap-1 mt-1 text-[9px] text-[var(--color-ink-muted)]">
        <span>{getCountryFlag(originCountry)}</span>
        <span>{originRegion || originCountry}</span>
        <span className="mx-0.5">&middot;</span>
        <span className="capitalize">{teaType.replace("_", " ")}</span>
        <span className="mx-0.5">&middot;</span>
        <span>{grade}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/price-band.tsx
git commit -m "feat: PriceBand component with sparkline chart"
```

---

### Task 4: MarketFeed Component

**Files:**
- Create: `src/components/market-feed.tsx`

- [ ] **Step 1: Create MarketFeed**

Create `src/components/market-feed.tsx`:

```tsx
"use client";

import type { Lot } from "@/lib/types";
import { formatPrice, timeAgo, getCountryFlag } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MarketFeedProps {
  soldLots: Lot[];
}

export function MarketFeed({ soldLots }: MarketFeedProps) {
  if (soldLots.length === 0) {
    return (
      <div className="p-6 text-center text-[var(--color-ink-muted)] text-sm">
        No recent market data.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--color-rule)]">
        <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-[var(--color-ink-muted)]">
          Recent Market
        </span>
        <span className="text-[9px] text-[var(--color-ink-muted)]">
          &middot; Sold Today
        </span>
      </div>

      <div className="divide-y divide-[var(--color-rule)]">
        {soldLots.map((lot) => {
          const premium = lot.final_price_per_kg && lot.reserve_price_per_kg
            ? (((lot.final_price_per_kg - lot.reserve_price_per_kg) / lot.reserve_price_per_kg) * 100)
            : 0;
          const direction = premium >= 0 ? "up" : "down";

          return (
            <div key={lot.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="font-serif text-[10px] font-semibold text-foreground truncate">
                  {getCountryFlag(lot.origin_country)} {lot.title}
                </p>
                <p className="text-[8px] text-[var(--color-ink-muted)] mt-0.5">
                  {lot.origin_region} &middot; Sold {lot.sold_at ? timeAgo(lot.sold_at) : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono tabular-nums font-bold text-[11px] text-foreground">
                  {formatPrice(lot.final_price_per_kg!)}/kg
                </p>
                <p className={cn(
                  "font-mono tabular-nums font-bold text-[9px]",
                  direction === "up" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"
                )}>
                  {direction === "up" ? "+" : ""}{premium.toFixed(1)}% {direction === "up" ? "▲" : "▼"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/market-feed.tsx
git commit -m "feat: MarketFeed component with sold lot premiums"
```

---

### Task 5: LotDetailTabs Component

**Files:**
- Create: `src/components/lot-detail-tabs.tsx`

- [ ] **Step 1: Create LotDetailTabs**

Create `src/components/lot-detail-tabs.tsx`:

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = ["Market Feed", "Lot Details", "Cupping"] as const;
type TabName = (typeof TABS)[number];

interface LotDetailTabsProps {
  marketFeedContent: React.ReactNode;
  lotDetailsContent: React.ReactNode;
  cuppingContent: React.ReactNode;
}

export function LotDetailTabs({
  marketFeedContent,
  lotDetailsContent,
  cuppingContent,
}: LotDetailTabsProps) {
  const [active, setActive] = useState<TabName>("Market Feed");

  return (
    <div className="md:hidden">
      <div className="flex bg-[var(--color-bg)] border-b border-[var(--color-rule)] sticky top-[58px] z-20">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "flex-1 text-center py-2.5 text-[11px] font-semibold transition-colors",
              active === tab
                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-[var(--color-ink-muted)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: active === "Market Feed" ? "block" : "none" }}>
        {marketFeedContent}
      </div>
      <div style={{ display: active === "Lot Details" ? "block" : "none" }}>
        {lotDetailsContent}
      </div>
      <div style={{ display: active === "Cupping" ? "block" : "none" }}>
        {cuppingContent}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/lot-detail-tabs.tsx
git commit -m "feat: LotDetailTabs component with CSS display toggle"
```

---

### Task 6: Restyle BidHistory for Trading Desk

**Files:**
- Modify: `src/components/bid-history.tsx`

- [ ] **Step 1: Update header text and add directional arrows**

In `src/components/bid-history.tsx`, make these changes:

1. Change the header text from "Live Bid Activity" to "Live Orders":

```tsx
<span className="text-xs font-bold uppercase tracking-widest text-foreground">Live Orders</span>
```

2. In each bid row's price display, add a green ▲ arrow. Replace the price `<p>` tag (around line 113):

```tsx
<p className="font-mono tabular-nums font-bold text-sm text-foreground">
  <span className="text-[var(--color-success)] text-[10px] mr-0.5">▲</span>
  {formatPrice(bid.amount_per_kg)}<span className="text-[10px] font-normal text-muted">/kg</span>
</p>
```

3. Change the newest row highlight from green background to green left border pulse. Replace the row's className (around line 107):

```tsx
className={cn(
  "flex items-center justify-between gap-3 px-5 py-3 transition-all duration-500",
  isNewest && "border-l-2 border-[var(--color-success)]"
)}
```

- [ ] **Step 2: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/bid-history.tsx
git commit -m "feat: restyle BidHistory as Live Orders with directional arrows"
```

---

### Task 7: Restyle BidPanel Pinned Mode

**Files:**
- Modify: `src/components/bid-panel.tsx`

- [ ] **Step 1: Update pinned mode colors**

In `src/components/bid-panel.tsx`, in the pinned mode section (the `if (mobileMode === "pinned")` block):

1. Quick-bid pills — change `bg-accent/10` to emerald:

Find each quick-bid pill button in the pinned section and change the className from:
```tsx
className="flex-1 min-h-10 py-2.5 px-2 rounded-xl bg-accent/10 border border-accent/30 text-accent font-mono tabular-nums font-bold text-sm transition-colors hover:bg-accent/20 active:bg-accent/30"
```
to:
```tsx
className="flex-1 min-h-10 py-2.5 px-2 rounded-xl bg-[var(--color-primary)] text-[#dcfce7] font-mono tabular-nums font-bold text-sm transition-colors hover:bg-[var(--color-primary-light)] active:bg-[var(--color-primary-light)]"
```

2. Place Bid button — change to amber:

Find the PLACE BID button in the pinned section and change:
```tsx
className="... bg-primary hover:bg-primary-light ..."
```
to:
```tsx
className="... bg-[var(--color-accent)] hover:bg-[var(--color-accent-hot)] ..."
```

3. Countdown timer — change to emerald:

In the countdown `<p>` tag within the pinned section, ensure it uses:
```tsx
className={cn("font-mono tabular-nums font-bold text-3xl leading-none text-[var(--color-primary)]")}
```

Note: Read the exact current classNames in the file first, since the pinned mode was trimmed in previous sessions. Apply the color changes while preserving all other classes.

- [ ] **Step 2: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/bid-panel.tsx
git commit -m "feat: restyle pinned BidPanel with emerald pills + amber button"
```

---

### Task 8: Add trend prop to PriceDisplay

**Files:**
- Modify: `src/components/price-display.tsx`

- [ ] **Step 1: Add the trend prop**

In `src/components/price-display.tsx`, add `trend` to the interface:

```typescript
interface PriceDisplayProps {
  amountUSD: number;
  size?: "sm" | "md" | "lg" | "xl";
  perKg?: boolean;
  showSDG?: boolean;
  className?: string;
  align?: "left" | "right" | "center";
  emphasis?: boolean;
  trend?: "up" | "down";
}
```

Add it to the destructured props:

```typescript
export function PriceDisplay({
  amountUSD,
  size = "md",
  perKg = false,
  showSDG = true,
  className,
  align = "left",
  emphasis = true,
  trend,
}: PriceDisplayProps) {
```

Update the USD price div to include the arrow and color:

```tsx
<div className={cn(
  "font-mono tabular-nums leading-tight",
  sizes.usd,
  emphasis && "font-bold",
  trend === "up" && "text-[var(--color-success)]",
  trend === "down" && "text-[var(--color-danger)]",
)}>
  {trend && (
    <span className="text-[0.6em] mr-0.5">
      {trend === "up" ? "▲" : "▼"}
    </span>
  )}
  {formatPrice(amountUSD)}{perKg && <span className="font-sans font-normal text-muted ml-0.5 text-[0.6em]">/kg</span>}
</div>
```

- [ ] **Step 2: Build and verify**

Run: `npx next build`
Expected: Compiles successfully.

- [ ] **Step 3: Commit**

```bash
git add src/components/price-display.tsx
git commit -m "feat: add trend prop to PriceDisplay for directional arrows"
```

---

### Task 9: Rewire lot-detail-client.tsx Mobile Layout

**Files:**
- Modify: `src/app/auctions/[id]/lot-detail-client.tsx`
- Modify: `src/app/auctions/[id]/page.tsx` (to pass sold lots)

This is the biggest task. The mobile render tree changes from sandwich layout to trading terminal.

- [ ] **Step 1: Add imports**

At the top of `src/app/auctions/[id]/lot-detail-client.tsx`, add the new component imports:

```typescript
import { MarketTicker } from "@/components/market-ticker";
import { PriceBand } from "@/components/price-band";
import { LotDetailTabs } from "@/components/lot-detail-tabs";
import { MarketFeed } from "@/components/market-feed";
```

Add to the props interface:

```typescript
interface LotDetailClientProps {
  lot: Lot;
  bids: Bid[];
  seller: Profile;
  soldLots: Lot[];
  tickerItems: TickerItem[];
}
```

Import `TickerItem` type:

```typescript
import type { Lot, Bid, Profile, TickerItem } from "@/lib/types";
```

Update the destructured props:

```typescript
export function LotDetailClient({ lot, bids, seller, soldLots, tickerItems }: LotDetailClientProps) {
```

- [ ] **Step 2: Replace the mobile sticky summary card with MarketTicker + PriceBand**

Find and remove the entire `{/* MOBILE-ONLY sticky lot summary card */}` block (the `md:hidden sticky top-[58px]` div with the photo thumbnail, title, flag, cupping badge, and LIVE badge).

Replace it with:

```tsx
{/* Market ticker tape + price band — mobile trading terminal */}
<MarketTicker items={tickerItems} />
<PriceBand
  currentHigh={currentHigh}
  openingPrice={lot.starting_price_per_kg}
  bids={liveBids}
  originCountry={lot.origin_country}
  originRegion={lot.origin_region}
  teaType={lot.tea_type}
  grade={lot.grade}
/>
```

- [ ] **Step 3: Wrap the scrollable middle content in LotDetailTabs**

Replace the mobile sections of the scrollable middle (everything inside `<div className="md:col-span-3 space-y-8">` that's mobile-visible) with:

```tsx
{/* Mobile: tabbed trading desk */}
<LotDetailTabs
  marketFeedContent={
    <div className="bg-[var(--color-bg)]">
      <BidHistory bids={liveBids} max={8} />
      <MarketFeed soldLots={soldLots} />
    </div>
  }
  lotDetailsContent={
    <div className="space-y-6 px-4 py-4">
      {/* Photo carousel */}
      {/* ... existing photo carousel JSX ... */}

      {/* Title + origin + description */}
      {/* ... existing title/origin/description JSX ... */}

      {/* Seller card */}
      {/* ... existing seller card JSX ... */}

      {/* Lot stats grid */}
      {/* ... existing stats grid JSX ... */}
    </div>
  }
  cuppingContent={
    <div className="px-4 py-6">
      {/* Cupping radar */}
      {/* ... existing cupping profile + radar JSX ... */}

      {/* Tasting notes */}
      {/* ... existing tasting notes JSX ... */}
    </div>
  }
/>

{/* Desktop: keep existing grid layout unchanged */}
<div className="hidden md:block md:col-span-3 space-y-8">
  {/* ... all existing desktop content stays here ... */}
</div>
```

**Important:** The actual JSX for photo carousel, title/origin, cupping, seller card, etc. is moved from the shared scroll area into the appropriate tab pane. The desktop layout (hidden on mobile, shown with `md:block`) keeps its existing structure untouched.

- [ ] **Step 4: Update the server component to pass sold lots and ticker items**

In `src/app/auctions/[id]/page.tsx`, add imports and pass the new props:

```typescript
import { getSoldLots, getMarketTickerItems } from "@/lib/mock-data";
```

In the component body, compute and pass:

```typescript
const soldLots = getSoldLots();
const tickerItems = getMarketTickerItems();

return (
  <LotDetailClient
    lot={lot}
    bids={bids}
    seller={seller}
    soldLots={soldLots}
    tickerItems={tickerItems}
  />
);
```

- [ ] **Step 5: Build and verify**

Run: `npx next build`
Expected: Compiles successfully with no errors.

- [ ] **Step 6: Visual verification**

Kill port 3000, run `npm run start`, open `http://localhost:3000/auctions/lot5` in Chrome DevTools mobile mode (390x844).

Verify:
- Horizontal ticker scrolls continuously with green/red arrows
- Price band shows current high with ▲ arrow, change badge, SDG conversion
- Sparkline renders (may start as dashed line if < 4 bids, then fills in)
- Three tabs work: Market Feed (default), Lot Details, Cupping
- Market Feed shows live bid activity + sold lots with premium percentages
- Lot Details tab shows photos, title, seller card
- Cupping tab shows radar chart + tasting notes
- Bid panel at bottom has emerald pills, amber Place Bid button
- Place a bid → price band updates, sparkline extends
- Wait for auction end → closing round → SOLD → overlays still work

- [ ] **Step 7: Commit**

```bash
git add src/app/auctions/[id]/lot-detail-client.tsx src/app/auctions/[id]/page.tsx
git commit -m "feat: rewire lot detail mobile layout as warm trading terminal"
```

---

## Self-Review Checklist

### Spec coverage
- [x] Sold lots data model (Task 1)
- [x] TickerItem type (Task 1)
- [x] getSoldLots() + getMarketTickerItems() helpers (Task 1)
- [x] MarketTicker horizontal component (Task 2)
- [x] PriceBand with sparkline (Task 3)
- [x] MarketFeed sold-lot feed (Task 4)
- [x] LotDetailTabs with CSS display:none toggle (Task 5)
- [x] BidHistory restyle as "Live Orders" (Task 6)
- [x] BidPanel pinned mode restyle (Task 7)
- [x] PriceDisplay trend prop (Task 8)
- [x] lot-detail-client.tsx mobile restructure (Task 9)
- [x] ticker-scroll keyframe (Task 2)
- [x] Sparkline: dashed line when < 4 points (Task 3, design decision #1)
- [x] Ticker: memoized, decoupled from bid state (Task 2, design decision #2)
- [x] Tabs: CSS display:none, not unmount (Task 5, design decision #3)
- [x] Sparkline: purely decorative, no touch (Task 3, design decision #4)
- [x] Sold lots: 5 positive, 1 slightly negative (Task 1, design decision #5)

### Type consistency
- TickerItem: defined in types.ts (Task 1), used in market-ticker.tsx (Task 2) and lot-detail-client.tsx (Task 9) — consistent
- SimulatedBid: imported from hooks/use-simulated-bidding in price-band.tsx (Task 3) — matches existing usage
- Lot.final_price_per_kg / sold_at / winning_buyer_id: defined in types.ts (Task 1), populated in mock-data.ts (Task 1), consumed in market-feed.tsx (Task 4) — consistent
