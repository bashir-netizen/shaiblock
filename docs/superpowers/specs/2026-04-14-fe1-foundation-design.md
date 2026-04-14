# FE-1 Foundation — Design System Sub-Project

**Status:** Approved via `superpowers:brainstorming` with explicit "approve it all just go" from user. Proceeding to `superpowers:writing-plans`.
**Date:** 2026-04-14
**Scope:** First sub-project from the FE Ultraplan. Design system foundation only. Screen rewrites and signature auction components are deferred to subsequent sub-projects.
**Target milestone:** ShaiBlock investor pitch. This sub-project lands first so the subsequent auction engine rebuild consumes cohesive tokens with zero throwaway work.

---

## 1. Context

### 1.1 Why this sub-project exists

The user pasted a massive FE Ultraplan describing a complete front-end redesign of ShaiBlock to evoke a Mombasa tea-auction catalog crossed with a Sudanese shai pot. The plan has 5 phases (FE-1 Foundation → FE-5 Delight), ~11-17 days of work end-to-end, and significant overlap with the already-committed auction engine plan (`docs/superpowers/plans/2026-04-13-live-auction-engine.md`).

**The overlap problem**: the auction engine plan would build `HammeredStamp`, `BidConfirmationSheet`, `BidPanel` upgrade, and reuse the existing `CountdownTimer` — all with the current emerald/amber tokens and Playfair typography. When the FE Ultraplan's foundation (FE-1) lands, every one of those components gets rewritten with Fraunces + liquor palette + wax-seal stamps + `<LeafCountdown />`. Roughly 60% of the auction engine plan's code becomes throwaway.

**The sequencing fix**: pause the auction engine execution, do FE-1 foundation first as its own sub-project, then revise the auction engine spec + plan to reference the new tokens/primitives/icons and execute that. Zero throwaway work. Both pitch-critical pieces land with a cohesive visual language.

### 1.2 What FE-1 includes

The full FE-1 phase from the Ultraplan:
- 4 new fonts via `next/font`: Fraunces (replaces Playfair), Inter (keep), Amiri (replaces Noto_Sans_Arabic), JetBrains Mono (new)
- Complete rewrite of `globals.css` `@theme` block with the liquor palette, typography scale, spacing, radii, shadows, motion tokens
- 3 textures: `paper-grain.png`, `jute.svg`, `wax-noise.svg`
- 9 custom tea icons: LeafMark, CuppingBowl, KettleSteam, TeaChest, Ladle, Gavel, WaxSeal, Terrace, Cardamom
- Brand lockup component: `<Wordmark />` with 3 variants
- 12 UI primitives: Button, Chip, Card, Stamp, Sheet, Skeleton, Divider, Badge (rewrite), Tabs, Accordion, Tooltip, Toggle, NumberDisplay
- Rebuilt `TopNav` + `BottomNav` chrome using the new primitives and tea icons

### 1.3 User decisions locked during brainstorming

1. **Sequencing**: Pause auction engine. Do FE-1 first. Then revise + execute auction engine.
2. **FE-1 scope**: Full FE-1 as written in the ultraplan (~2-3 days).
3. **Execution strategy**: Approach B (Staged Parallel) with 9 subagents across 3 stages.
4. **Typography**: Fraunces REPLACES Playfair. Keep Inter. Replace Noto_Sans_Arabic with Amiri. Add JetBrains Mono.
5. **Tea-type tinting system**: DEFERRED to a later sub-project. Tokens are defined, but the `<TeaTypeTheme>` context and tinted primitives are not built in FE-1.
6. **Sound + haptics**: DEFERRED (Ultraplan FE-4).
7. **Wax-seal motif**: YES. Signature visual. Implemented via the `<Stamp>` primitive.
8. **Landing language**: English-first with Arabic touches (current state). Arabic-first is not part of FE-1.

---

## 2. Non-goals (explicit scope exclusions)

Deliberately NOT in this sub-project:
- **Tea-type tinting system** (`<TeaTypeTheme>` context, CSS `data-tea` attribute cascade, tinted primitive APIs) — deferred
- **12 illustrations** (TeaPlucker, CuppingTray, GavelStamp, PorterChest, KettlePour, EmptyBowl, FoldedNote, BellSilent, CalmWater, SpilledCup, CoveredBowl, EmptyShelf) — deferred to the empty-state sub-project
- **Sound effects + haptics** (`bell.wav`, `pour.wav`, `useSoundPreference`, `useHaptics`) — deferred
- **i18n JSON tables** (`src/lib/i18n/en.json`, `ar.json`) — deferred
- **Dark mode "Night Cupping"** — deferred
- **Cmd-K global search** — deferred
- **Screen rewrites** — FE-1 only upgrades chrome (TopNav + BottomNav) and provides primitives. Landing, auction feed, lot detail, dashboards stay visually identical except where they inherit the new tokens automatically (color swaps).
- **`<LeafCountdown />` signature component** — belongs to the auction engine rebuild
- **`<BidSheet />`, `<BidHistory />` ledger, `<CuppingRadar />` SCA scoresheet, `<HammerStamp />`** — all belong to the auction engine rebuild
- **`AuctionEventBus`, `useBidIntent`, `useAuctionClock`, `useSimulatedBidding` upgrades** — all belong to the auction engine rebuild
- **`LandedCostBreakdown`, `SellerCard` redesign, `AuctionCard` catalog-card redesign, `CertificationStrip`, `ProvenancePanel`** — deferred (auction engine rebuild or subsequent sub-projects)
- **`react-window` virtualization** — deferred (dashboard rebuild sub-project)
- **Unit tests** — there is no test harness by design. Verification is manual per Section 8.

---

## 3. Architecture

### 3.1 File structure

| # | File | Status | Stage |
|---|------|--------|-------|
| 1 | `src/app/globals.css` | REWRITE | 1 |
| 2 | `src/app/layout.tsx` | MODIFY | 1 |
| 3 | `public/textures/paper-grain.png` | CREATE | 1 |
| 4 | `public/textures/jute.svg` | CREATE | 1 |
| 5 | `public/textures/wax-noise.svg` | CREATE | 1 |
| 6 | `src/components/icons/tea/leaf-mark.tsx` | CREATE | 1 |
| 7 | `src/components/icons/tea/cupping-bowl.tsx` | CREATE | 1 |
| 8 | `src/components/icons/tea/kettle-steam.tsx` | CREATE | 1 |
| 9 | `src/components/icons/tea/tea-chest.tsx` | CREATE | 1 |
| 10 | `src/components/icons/tea/ladle.tsx` | CREATE | 1 |
| 11 | `src/components/icons/tea/gavel.tsx` | CREATE | 1 |
| 12 | `src/components/icons/tea/wax-seal.tsx` | CREATE | 1 |
| 13 | `src/components/icons/tea/terrace.tsx` | CREATE | 1 |
| 14 | `src/components/icons/tea/cardamom.tsx` | CREATE | 1 |
| 15 | `src/components/icons/tea/index.ts` | CREATE | 1 |
| 16 | `src/components/brand/wordmark.tsx` | CREATE | 1 |
| 17 | `src/components/ui/button.tsx` | CREATE | 2 |
| 18 | `src/components/ui/chip.tsx` | CREATE | 2 |
| 19 | `src/components/ui/card.tsx` | CREATE | 2 |
| 20 | `src/components/ui/stamp.tsx` | CREATE | 2 |
| 21 | `src/components/ui/sheet.tsx` | CREATE | 2 |
| 22 | `src/components/ui/skeleton.tsx` | CREATE | 2 |
| 23 | `src/components/ui/divider.tsx` | CREATE | 2 |
| 24 | `src/components/ui/badge.tsx` | REWRITE (backward-compat) | 2 |
| 25 | `src/components/ui/tabs.tsx` | CREATE | 2 |
| 26 | `src/components/ui/accordion.tsx` | CREATE | 2 |
| 27 | `src/components/ui/tooltip.tsx` | CREATE | 2 |
| 28 | `src/components/ui/toggle.tsx` | CREATE | 2 |
| 29 | `src/components/ui/number-display.tsx` | CREATE | 2 |
| 30 | `src/components/top-nav.tsx` | REWRITE | 3 |
| 31 | `src/components/bottom-nav.tsx` | REWRITE | 3 |

**Total:** 26 new files, 5 rewrites (counting globals.css + layout.tsx + badge + top-nav + bottom-nav).

### 3.2 Dependency graph

```
  Stage 1 (PARALLEL, 4 subagents)
  ┌──────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────┐
  │  Subagent A  │  │ Subagent B │  │Subagent C│  │  Subagent D  │
  │ Tokens +     │  │ Textures   │  │ 9 tea    │  │ Wordmark     │
  │ Fonts        │  │  (3 files) │  │ icons    │  │ (depends on  │
  │ (globals.css │  │            │  │          │  │  LeafMark)   │
  │ + layout)    │  │            │  │          │  │              │
  └──────┬───────┘  └─────┬──────┘  └─────┬────┘  └──────┬───────┘
         └────────────────┴────────────────┴───────────────┘
                                │
                       REVIEW CHECKPOINT
                  (build passes, fonts render,
                   textures load, icons compile)
                                │
                                ▼
  Stage 2 (PARALLEL, 4 subagents) — 12 primitives split into 4 groups
  ┌───────────────────┐ ┌────────────────────┐ ┌───────────────────┐ ┌─────────────────────┐
  │   Subagent E      │ │    Subagent F      │ │   Subagent G      │ │    Subagent H       │
  │ Button            │ │ Stamp              │ │ Badge (rewrite)   │ │ Tooltip             │
  │ Chip              │ │ Sheet              │ │ Tabs              │ │ Toggle              │
  │ Card              │ │ Skeleton           │ │ Accordion         │ │ NumberDisplay       │
  │                   │ │ Divider            │ │                   │ │                     │
  └──────┬────────────┘ └────────┬───────────┘ └────────┬──────────┘ └──────────┬──────────┘
         └────────────────────────┴─────────────────────┴────────────────────────┘
                                       │
                              REVIEW CHECKPOINT
                         (all primitives compile, cva
                          base classes consistent, no
                          dupe variant names)
                                       │
                                       ▼
  Stage 3 (SERIAL, 1 subagent)
                          ┌──────────────┐
                          │  Subagent I  │
                          │ TopNav +     │
                          │ BottomNav    │
                          │ rewrite      │
                          └──────┬───────┘
                                 │
                        FINAL VERIFICATION
                 (build passes, tunnel serves 200,
                  role switcher works, notification bell
                  works, BottomNav tea icons render)
```

**Total subagent runs:** 9. **Review checkpoints:** 3.

### 3.3 Design principle: variable name preservation

The single most important constraint on Subagent A: the `--color-primary`, `--color-accent`, `--color-danger`, `--color-success`, `--color-background`, `--color-foreground`, `--color-card`, `--color-border`, `--color-muted` variable **names** must remain the same. Only the **values** change. This means existing Tailwind utility classes (`bg-primary`, `text-accent`, etc.) immediately pick up new values with zero component-level changes.

Same principle for fonts: `--font-sans`, `--font-serif`, `--font-arabic`, `--font-mono` variable names stay. Only the underlying `next/font` source changes.

This is how we swap the entire visual foundation in one commit without breaking existing components.

---

## 4. Design tokens (the `globals.css` rewrite)

### 4.1 Color — Tea Liquor Palette

```css
@theme {
  /* Paper & ink (canvas) */
  --color-catalog:    #F7F1E3;  /* cream catalog paper */
  --color-paper:      #FDFAF2;  /* lighter cream for cards */
  --color-raised:     #FFFFFF;
  --color-inset:      #F1E9D2;
  --color-stamp-bg:   #F7EEDC;
  --color-jute:       #D9C7A1;
  --color-rule:       #E5D9BE;
  --color-ink:        #1B1410;
  --color-ink-soft:   #3B2A22;
  --color-ink-muted:  #6B5A4E;

  /* Tea-liquor accents (tokens only; tinting system deferred) */
  --liquor-black:     #6B3410;
  --liquor-green:     #7FA650;
  --liquor-oolong:    #B56B1B;
  --liquor-white:     #E8D690;
  --liquor-puerh:     #4A2316;
  --liquor-herbal:    #C33B2E;
  --liquor-blend:     #8A6A3D;

  /* Semantic layer */
  --color-primary:     #0F5132;
  --color-primary-700: #0B3D25;
  --color-primary-50:  #E8F3ED;
  --color-accent:      #B56B1B;  /* REPLACES #D97706 amber */
  --color-accent-hot:  #D9541E;
  --color-gold:        #C99A3B;
  --color-wax:         #8A1C1C;
  --color-mint:        #5FA58E;
  --color-cardamom:    #C48949;

  /* State */
  --color-live:        #1E7D4C;
  --color-winning:     #0F5132;
  --color-outbid:      #B04A1E;
  --color-danger:      #8A1C1C;   /* REPLACES #DC2626 red */
  --color-success:     #1E7D4C;   /* REPLACES #16A34A green */
  --color-escrow:      #2E6E8C;

  /* Tailwind-consumable aliases (names preserved from current globals.css) */
  --color-background:  var(--color-catalog);
  --color-foreground:  var(--color-ink);
  --color-card:        var(--color-paper);
  --color-border:      var(--color-rule);
  --color-muted:       var(--color-ink-muted);
  /* primary, accent, danger, success already declared above with new values */
}
```

### 4.2 Typography

```css
@theme {
  --font-sans:   var(--font-inter);
  --font-serif:  var(--font-fraunces);    /* REPLACES --font-playfair */
  --font-arabic: var(--font-amiri);        /* REPLACES Noto Sans Arabic */
  --font-mono:   var(--font-jetbrains);    /* NEW */
}
```

### 4.3 Spacing, radii, shadows, motion

```css
@theme {
  /* Spacing (4px base) */
  --spacing-1:  4px;   --spacing-2:  8px;   --spacing-3:  12px;  --spacing-4:  16px;
  --spacing-5:  20px;  --spacing-6:  24px;  --spacing-8:  32px;  --spacing-10: 40px;
  --spacing-12: 48px;  --spacing-16: 64px;

  /* Radius */
  --radius-xs:    4px;
  --radius-sm:    8px;
  --radius-md:    14px;
  --radius-lg:    22px;
  --radius-xl:    28px;
  --radius-stamp: 9999px;

  /* Shadows (paper-like, never floaty) */
  --shadow-paper: 0 1px 0 0 rgba(27,20,16,0.04), 0 8px 24px -12px rgba(107,52,16,0.16);
  --shadow-card:  0 1px 0 0 rgba(27,20,16,0.05), 0 18px 40px -24px rgba(107,52,16,0.22);
  --shadow-lift:  0 2px 0 0 rgba(27,20,16,0.06), 0 32px 60px -30px rgba(107,52,16,0.28);
  --shadow-stamp: 0 2px 0 -1px rgba(138,28,28,0.6), 0 0 0 1px rgba(138,28,28,0.2) inset;

  /* Motion */
  --ease-steam: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-pour:  cubic-bezier(0.83, 0.00, 0.17, 1);
  --ease-stamp: cubic-bezier(0.36, 0.07, 0.19, 0.97);

  --duration-tap:    120ms;
  --duration-quick:  220ms;
  --duration-bid:    380ms;
  --duration-hammer: 900ms;
  --duration-brew:   2400ms;
}
```

### 4.4 Canvas background (applied to `body`)

```css
body {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(201, 154, 59, 0.07), transparent 55%),
    url("/textures/paper-grain.png") repeat,
    var(--color-catalog);
  background-size: auto, 256px 256px, auto;
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}
```

### 4.5 Typography utility classes (`@layer components`)

```css
@layer components {
  .type-display-xl  { font-family: var(--font-serif); font-weight: 600; font-size: clamp(3.25rem, 6vw, 5.5rem); letter-spacing: -0.02em; line-height: 1.05; }
  .type-display-lg  { font-family: var(--font-serif); font-weight: 600; font-size: clamp(2.25rem, 4vw, 3.75rem); letter-spacing: -0.015em; line-height: 1.1; }
  .type-headline    { font-family: var(--font-serif); font-weight: 600; font-size: clamp(1.75rem, 3vw, 2.5rem); letter-spacing: -0.01em; line-height: 1.15; }
  .type-title       { font-family: var(--font-serif); font-weight: 600; font-size: 1.375rem; line-height: 1.2; }
  .type-subtitle    { font-family: var(--font-sans); font-weight: 500; font-size: 1.125rem; line-height: 1.3; }
  .type-body        { font-family: var(--font-sans); font-weight: 400; font-size: 0.9375rem; line-height: 1.55; }
  .type-meta        { font-family: var(--font-sans); font-weight: 500; font-size: 0.8125rem; line-height: 1.4; letter-spacing: 0.02em; }
  .type-micro       { font-family: var(--font-sans); font-weight: 600; font-size: 0.6875rem; line-height: 1.3; letter-spacing: 0.08em; text-transform: uppercase; }

  .type-price-xl    { font-family: var(--font-serif); font-weight: 500; font-size: clamp(2rem, 4vw, 3rem); font-variant-numeric: tabular-nums oldstyle-nums; line-height: 1; }
  .type-price       { font-family: var(--font-mono); font-weight: 500; font-size: 1.25rem; font-variant-numeric: tabular-nums; }
  .type-lot-number  { font-family: var(--font-mono); font-weight: 600; font-size: 0.75rem; letter-spacing: 0.1em; }
}
```

### 4.6 Keyframes (shared motion vocabulary)

```css
@layer utilities {
  @keyframes steam {
    0%   { transform: translateY(0);    opacity: 0.0; }
    15%  { opacity: 0.7; }
    100% { transform: translateY(-12px); opacity: 0.0; }
  }
  @keyframes flash-pour {
    0%   { background-position: -100% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes stamp-land {
    0%   { transform: scale(1.4) rotate(-6deg); opacity: 0; }
    60%  { transform: scale(1.02) rotate(-3deg); opacity: 1; }
    100% { transform: scale(1)    rotate(-3deg); opacity: 1; }
  }
  @keyframes kettle-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(0.98); }
  }
  @keyframes leaf-unfurl {
    from { stroke-dashoffset: var(--dash-length, 100%); }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes wax-crack {
    0%, 100% { transform: skew(0, 0); }
    50%      { transform: skew(-0.5deg, 0); }
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-steam, .animate-stamp-land, .animate-kettle-pulse,
    .animate-wax-crack, .animate-leaf-unfurl {
      animation: none !important;
    }
  }
}
```

### 4.7 What gets preserved from the current `globals.css`

- `@keyframes pulse-danger` + `.animate-pulse-danger` — KEEP (used by existing `CountdownTimer`, `AuctionCard` urgent badge, `Badge` danger variant). Will be replaced only when the auction engine rebuild lands its own motion system.
- `@keyframes flash-green` + `.animate-flash-green` — KEEP (used by `BidPanel` price flash). Same reason.
- The `.tabular-nums` utility class — KEEP (used throughout).

### 4.8 What gets removed

- Old `--color-primary: #065F46` emerald — replaced with `#0F5132` darjeeling
- Old `--color-accent: #D97706` amber — replaced with `#B56B1B` oolong copper
- Old `--color-danger: #DC2626` — replaced with `#8A1C1C` wax red
- Old `--color-success: #16A34A` — replaced with `#1E7D4C` steaming green
- Old `--color-background: #FAFAF5` — replaced with `#F7F1E3` catalog cream
- Old `--font-playfair` import from `layout.tsx` — replaced with `--font-fraunces`
- Old `--font-arabic: var(--font-arabic)` Noto_Sans_Arabic — replaced with Amiri
- No current `--font-mono` declaration — NEW JetBrains Mono added

---

## 5. Components per stage

### 5.1 Stage 1 — Tokens, Fonts, Textures, Icons, Wordmark

**Subagent A — Tokens + Fonts**
- Rewrites `src/app/globals.css` per Section 4 above
- Modifies `src/app/layout.tsx`:
  - Replaces `Playfair_Display` import with `Fraunces` from `next/font/google`
  - Replaces `Noto_Sans_Arabic` import with `Amiri`
  - Adds `JetBrains_Mono` import
  - Keeps `Inter` import
  - Preserves the `--font-serif`, `--font-arabic`, `--font-sans`, `--font-mono` CSS variable names
- Adds body canvas background (Section 4.4)
- One commit

**Subagent B — Textures**
- Creates `public/textures/paper-grain.png` (256×256 tileable grayscale)
- Creates `public/textures/jute.svg` (tileable SVG pattern)
- Creates `public/textures/wax-noise.svg` (SVG fractal noise)
- Textures must be ≤50KB each for bundle discipline
- One commit

**Subagent C — Tea icon family**
- Creates 9 files in `src/components/icons/tea/`:
  - `leaf-mark.tsx`, `cupping-bowl.tsx`, `kettle-steam.tsx`, `tea-chest.tsx`, `ladle.tsx`, `gavel.tsx`, `wax-seal.tsx`, `terrace.tsx`, `cardamom.tsx`
- Each icon:
  - React functional component, SVG-only
  - Props: `size?: number = 24; className?: string` and passthrough `SVGProps<SVGSVGElement>`
  - 24×24 viewBox, 1.5px stroke width, `stroke-linecap="round"`, `stroke-linejoin="round"`
  - Uses `currentColor` for stroke/fill so Tailwind `text-*` classes work
  - `fill="none"` where appropriate for line-art feel
- Creates `src/components/icons/tea/index.ts` barrel export
- One commit

**Subagent D — Brand Wordmark**
- Creates `src/components/brand/wordmark.tsx`
- 3 variants via cva: `horizontal` (default), `stacked`, `mark-only`
- Composition: `<LeafMark />` + Arabic `شاي` span (with `dir="rtl" lang="ar"` and `font-arabic`) + English `ShaiBlock` span (with `font-serif`)
- Props: `{ variant?: 'horizontal' | 'stacked' | 'mark-only'; size?: 'sm' | 'md' | 'lg'; className?: string }`
- Imports `LeafMark` from `@/components/icons/tea`
- One commit

### 5.2 Stage 2 — 12 UI primitives

All primitives live in `src/components/ui/`. Each uses `cva` + `cn` from the existing `utils.ts`. Each file exports exactly one component (plus its variant types).

**Subagent E — Button + Chip + Card**

- `button.tsx`: 5 variants (`primary`, `secondary`, `ghost`, `stamp`, `danger`), 4 sizes (`sm` 32px, `md` 40px, `lg` 48px, `xl` 56px). Primary uses `bg-primary text-white`. Stamp uses `bg-accent border-wax` with wax-noise overlay. All sizes meet 44px touch-target minimum except `sm` (32px, desktop-only).
- `chip.tsx`: pill with `leadingIcon?`, 4 variants (`neutral`, `liquor-tinted`, `status`, `wax`). Liquor-tinted takes an optional `liquor?: 'black' | 'green' | 'oolong' | ...` prop that sets `background-color: var(--liquor-${liquor})` at 12% opacity.
- `card.tsx`: 3 variants (`paper` uses `bg-card`, `raised` adds `shadow-card`, `inset` uses `bg-inset`). All have `rounded-lg` by default.

**Subagent F — Stamp + Sheet + Skeleton + Divider**

- `stamp.tsx`: circular wax-seal wrapper. Props `label: string; color?: 'wax' | 'primary' | 'accent' | 'gold'; size?: 'xs' | 'sm' | 'md' | 'lg'`. Uses `shadow-stamp` and `wax-noise.svg` as background image at 20% opacity. Includes `aria-label={label}` for screen readers.
- `sheet.tsx`: bottom sheet primitive. Props `{ open, onClose, children, title? }`. Fixed positioned, `bottom-0 inset-x-0`, backdrop at `bg-ink/40`, `rounded-t-3xl` top, drag-to-dismiss via pointer events. Full-width on mobile, `max-w-md mx-auto` on desktop. Auto-focuses first focusable child on open, traps focus, restores focus on close, dismisses on Escape.
- `skeleton.tsx`: paper-grain placeholder with breathing animation (opacity cycles 6% → 14% → 6% over 2.4s). Props: `width?, height?, className?`. Uses `--duration-brew` for the cycle.
- `divider.tsx`: 3 variants (`hair` = 1px rule, `leaf-chain` = horizontal chain of small leaf SVGs, `catalog-rule` = double hairline with center diamond dot). `orientation?: 'horizontal' | 'vertical'`.

**Subagent G — Badge (rewrite) + Tabs + Accordion**

- `badge.tsx`: REWRITES existing. Preserves existing variants (`default`, `success`, `danger`, `warning`, `outline`) for backward compat. Adds new variants: `live` (with steam animation), `winning` (emerald solid), `outbid` (copper solid), `ending-soon` (accent-hot with pulse). Existing consumers in `BidPanel`, `LotStatusBadge`, etc. continue working without changes.
- `tabs.tsx`: neutral tab primitive. Props `{ value, onValueChange, children }`. Child `<TabList>`, `<TabTrigger value="">`, `<TabPanel value="">`. Underline indicator in copper.
- `accordion.tsx`: neutral accordion primitive. Props `{ type: 'single' | 'multiple', defaultValue? }`. Child `<AccordionItem value="">`, `<AccordionTrigger>`, `<AccordionContent>`. Chevron rotates on open.

**Subagent H — Tooltip + Toggle + NumberDisplay**

- `tooltip.tsx`: neutral tooltip with cream paper + hairline border. Props `{ content, children, side? = 'top' }`. Delay 300ms, fade in 120ms. Uses `role="tooltip"`.
- `toggle.tsx`: switch primitive. Props `{ checked, onCheckedChange, label? }`. Track is `bg-border` when off, `bg-primary` when on. Thumb is gold circle when on.
- `number-display.tsx`: enforces mono tabular-nums. Props `{ value: number; currency?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; perKg?: boolean }`. Uses `.type-price` or `.type-price-xl` class based on size.

### 5.3 Stage 3 — Chrome rebuild

**Subagent I — TopNav + BottomNav**

- `top-nav.tsx` REWRITE:
  - Cream background (`bg-card`), hairline bottom border (`border-b border-border`)
  - Left: `<Wordmark variant="horizontal" />` component (replaces the current inline "ShaiBlock + شاي" jsx)
  - Center: existing nav links (Auctions / Ending Soon / Buy Now) but rendered with `type-meta` utility class
  - Right: role switcher as a `<Chip variant="liquor-tinted">` row (3 chips: Retailer / Wholesaler / Admin) — replaces the current segmented button group — still hooked to existing `useAuth` and `setRole`
  - Bell icon (from lucide-react, keep current) with unread count rendered as `<Stamp label="2" color="wax" size="xs" />` instead of a plain red div
  - Avatar circle stays the same
  - Scroll behavior (NEW): when `window.scrollY > 120`, collapses to a thin bar with just `<Wordmark variant="mark-only" />` + a small pulsing live dot. Uses `useEffect` to attach a scroll listener.
- `bottom-nav.tsx` REWRITE:
  - Replaces the current 5 lucide icons with tea icons from `@/components/icons/tea`:
    - Home → `<LeafMark />`
    - Search (Auctions) → `<CuppingBowl />`
    - Gavel (My Bids) → `<Ladle />`
    - Bell (Notifications) → keeps lucide `<Bell />`
    - User (Profile) → keeps lucide `<User />`
  - Active tab elevates 4px with a copper indicator bar (2px tall) under the icon
  - Preserves the `isLotDetail` hide-on-lot-detail logic from the review-fixes commit `ae748f2`
- One commit for both files

---

## 6. Risks + mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| Font swap breaks text rendering mid-build | MEDIUM | Subagent A preserves `--font-serif`, `--font-arabic`, `--font-sans`, `--font-mono` variable names. Removes Playfair import only after Fraunces import lands in the same commit. Build verified before commit. |
| Paper texture image missing causes 404s | LOW | Subagent B writes the texture files before any CSS references them. Stage 1 review checkpoint verifies files exist on disk. |
| `Badge` variant rename breaks existing `BidPanel` / `LotStatusBadge` usages | MEDIUM | Subagent G preserves existing variants (`default`, `success`, `danger`, `warning`, `outline`) as backward-compat aliases. New variants are additive. Existing consumers compile without modification. |
| Chrome rebuild breaks the existing role switcher, notification bell, or scroll behavior | MEDIUM | Subagent I receives explicit instructions to preserve: (a) `useAuth` role switcher logic, (b) `/notifications` link with unread count, (c) `isLotDetail` hide logic in BottomNav from commit `ae748f2`. |
| Tea icon barrel export causes circular imports | LOW | Each icon file is self-contained (no imports from other icon files). `index.ts` is a flat re-export. |
| Stage 2 subagents produce inconsistent cva usage | MEDIUM | All 4 Stage 2 subagents receive identical spec Section 5.2 + a common cva template. Stage 2 review checkpoint catches inconsistencies. |
| Fraunces loads slower than Playfair on first paint | LOW | Both loaded via `next/font` with `display: swap`. Identical FOUT behavior. |
| Chrome rebuild inadvertently changes Next.js routing | NONE | Nothing in FE-1 touches `next.config.ts` or the `/app` routing tree. Tunnel unaffected. |
| Subagent D needs LeafMark but Stage 1 runs in parallel | LOW | Subagent D writes a placeholder inline SVG for LeafMark. Main agent swaps in the real `<LeafMark />` import at the Stage 1 review checkpoint before dispatching Stage 2. |
| Reduced-motion preference not respected by new keyframes | LOW | Section 4.6 includes `@media (prefers-reduced-motion: reduce)` overrides for every new animation. |
| Sheet focus-trap leaks focus on unmount | LOW | Subagent F uses a documented focus-trap pattern: store previously-focused element, restore on close, rely on native `inert` on background when open. |

---

## 7. Build order (same as dependency graph)

1. **Stage 1 dispatch** — 4 subagents (A, B, C, D) in parallel
2. **Stage 1 review checkpoint** — main agent verifies: build passes, fonts render, textures load, tea icons compile cleanly, Wordmark uses real LeafMark
3. **Stage 2 dispatch** — 4 subagents (E, F, G, H) in parallel
4. **Stage 2 review checkpoint** — main agent verifies: all 12 primitives compile, cva variant names consistent across subagents, existing Badge consumers still work
5. **Stage 3 dispatch** — 1 subagent (I) serial
6. **Final verification** — build passes, tunnel serves 200 on `/`, `/auctions`, `/auctions/lot1`, `/auctions/lot5`, role switcher works, notification bell works, BottomNav tea icons render, TopNav scroll collapse works
7. **Commit to origin/main** (one push at the end covering all 9 subagent commits)

---

## 8. Verification checklist

**Stage 1:**
- [ ] `npx next build` passes
- [ ] Body background renders as cream with subtle paper grain (visually inspect `http://localhost:3000`)
- [ ] Fraunces loads (inspect `h1` in devtools → `font-family: Fraunces`)
- [ ] Inter loads for body copy
- [ ] JetBrains Mono loads for `.tabular-nums` (inspect `BidPanel` price)
- [ ] Amiri loads for Arabic spans (inspect `.font-arabic` spans)
- [ ] No 404s in devtools network tab for textures or fonts
- [ ] All 9 tea icons render when imported into a temporary test page
- [ ] `<Wordmark variant="horizontal" />` renders LeafMark + شاي + ShaiBlock

**Stage 2:**
- [ ] `npx next build` passes
- [ ] Each of the 12 primitives renders without runtime errors when imported into a test page
- [ ] `cva` compiles each variant with no warnings
- [ ] Existing `Badge` usages in `BidPanel`, `LotStatusBadge`, `toast-system` still compile (backward-compat preserved)
- [ ] `Sheet` can be opened and dismissed (manual test on a temporary page)
- [ ] `Stamp` renders with wax-noise background at correct opacity
- [ ] `Skeleton` breathes at 2.4s cycle (visually confirm)

**Stage 3:**
- [ ] `npx next build` passes
- [ ] 14 routes compile (3 dynamic, 11 static — same as before)
- [ ] `curl https://trio-assistant-essentials-mod.trycloudflare.com/` → 200 (or whichever tunnel URL is current)
- [ ] `curl /auctions` → 200
- [ ] `curl /auctions/lot1` → 200
- [ ] `curl /auctions/lot5` → 200
- [ ] TopNav shows new Wordmark with LeafMark + شاي + ShaiBlock lockup
- [ ] Role switcher chips still work (clicking switches between buyer/seller/admin)
- [ ] Notification bell still links to `/notifications` with unread count shown as Stamp
- [ ] TopNav collapses at scroll > 120px
- [ ] BottomNav shows tea icons (LeafMark, CuppingBowl, Ladle) + existing Bell + User on mobile
- [ ] BottomNav is hidden on `/auctions/[id]` routes (preserves review-fixes behavior)
- [ ] Active bottom nav tab shows copper indicator bar
- [ ] No hydration mismatch warnings in devtools console
- [ ] No "setState on unmounted" warnings

---

## 9. Rollback plan

Commit-granular. Each of the 9 subagents produces 1 commit.

| Scenario | Action |
|----------|--------|
| Single subagent's commit is broken | `git revert <subagent-commit>` and re-dispatch that subagent only |
| Stage 1 as a whole is broken | `git revert` the 4 Stage 1 commits in reverse order |
| Stage 2 or Stage 3 broken | Same, revert stage commits |
| Total meltdown | `git reset --hard ae748f2` restores the review-fixes baseline (the last known-stable commit) |
| Demo blocker during pitch | Env flag approach is NOT used here. If something is breaking 5 minutes before the pitch, reset to `ae748f2`. |

---

## 10. Open questions resolved during brainstorming

| # | Question | Answer |
|---|----------|--------|
| 1 | Pause auction engine or execute it first? | PAUSE. Do FE-1 first, then revise auction engine spec/plan. |
| 2 | FE-1 scope size? | Full FE-1 as written in ultraplan (~2-3 days). |
| 3 | Typography choice? | Fraunces replaces Playfair. Keep Inter. Replace Noto Arabic with Amiri. Add JetBrains Mono. |
| 4 | Tea-type tinting system? | DEFERRED. Tokens declared but `<TeaTypeTheme>` context + tinted APIs are a later sub-project. |
| 5 | Sound + haptics? | DEFERRED. Ultraplan FE-4. |
| 6 | Wax-seal motif? | YES. Built as `<Stamp>` primitive. |
| 7 | Arabic-first vs English-first? | ENGLISH-first with Arabic touches (current state). |
| 8 | Execution approach? | Approach B — Staged parallel, 9 subagents across 3 stages. |
| 9 | Review checkpoints between stages? | YES. Main agent verifies each stage before dispatching the next. |
| 10 | Illustrations in FE-1? | NO. Deferred to empty-state sub-project. |
| 11 | Cmd-K search in FE-1? | NO. Deferred. |
| 12 | Dark mode in FE-1? | NO. Deferred. |
| 13 | Screen rewrites in FE-1? | NO. Only chrome + primitives. Screens inherit new tokens automatically. |
| 14 | Variable name preservation? | YES. `--color-primary`, `--color-accent`, etc. keep their names; values change. |
| 15 | Badge backward compatibility? | YES. Existing variants preserved; new variants additive. |

---

## 11. Next step

After this spec is committed and (pre-approved by user via "approve it all just go"), invoke `superpowers:writing-plans` to produce a task-by-task implementation plan for the 9 subagents. The plan will include:
- Exact file contents for each of the 26 new files
- Exact diffs for each of the 5 rewrites
- Per-subagent commit message templates
- Per-stage review checkpoint procedures
- Fallback strategies if any subagent returns incomplete work

The plan is then executed via `superpowers:subagent-driven-development` with the 9-subagent dispatch schedule from Section 7.
