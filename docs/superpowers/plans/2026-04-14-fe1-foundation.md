# FE-1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land a complete front-end design system foundation (tokens, typography, textures, 9 custom tea icons, brand Wordmark, 12 UI primitives, rebuilt chrome) so the subsequent auction engine rebuild consumes cohesive tokens with zero throwaway work.

**Architecture:** Three stages executed via staged parallel subagent dispatch (Approach B from the spec). Stage 1 runs 4 parallel subagents (tokens+fonts, textures, tea icons, Wordmark). Stage 2 runs 4 parallel subagents building 12 UI primitives split into groups of 3. Stage 3 runs 1 subagent rebuilding TopNav + BottomNav using the new primitives. Review checkpoints between stages catch integration issues before they compound.

**Tech Stack:** Next.js 16.2.3 (App Router), React 19, TypeScript, Tailwind CSS v4, `class-variance-authority` (cva), `clsx` + `tailwind-merge` (via existing `cn` helper in `src/lib/utils.ts`), `lucide-react`, `next/font` for Google Fonts. No new dependencies.

**Tests:** NONE by design. This is a mock-data investor demo with no test harness. Verification is manual per spec §8.

**Spec (read first):** `docs/superpowers/specs/2026-04-14-fe1-foundation-design.md`

---

## Context before starting

**Read in this order:**
1. The spec (`docs/superpowers/specs/2026-04-14-fe1-foundation-design.md`)
2. `src/app/globals.css` — current tokens and keyframes (will be rewritten in Task 1)
3. `src/app/layout.tsx` — current font imports (will be modified in Task 1)
4. `src/components/top-nav.tsx` and `src/components/bottom-nav.tsx` — current chrome to be rewritten in Task 9
5. `src/components/ui/badge.tsx` — existing variant API to preserve in Task 7
6. `src/lib/utils.ts` — the `cn` helper used in every primitive

**Build command:** `cd ~/Desktop/chaiblock && npx next build`
- **Expected output:** "Compiled successfully", 14 routes, 3 dynamic (`/`, `/auctions`, `/auctions/[id]`), 11 static.
- **If build fails:** STOP. Fix the error before proceeding to the next task.

**Critical constraint — variable name preservation:**
The `--color-primary`, `--color-accent`, `--color-danger`, `--color-success`, `--color-background`, `--color-foreground`, `--color-card`, `--color-border`, `--color-muted`, `--font-sans`, `--font-serif`, `--font-arabic`, `--font-mono` variable NAMES must remain the same. Only VALUES change. This is how the visual overhaul propagates to existing components without breaking them.

**Commit discipline:** One subagent = one commit. 9 subagents = 9 commits. Use Conventional Commits format. Use `git -c user.email="bashir@local" -c user.name="Bashir"` if git config is missing.

**Rollback:** If a subagent's commit is broken, `git revert <that-commit>` and re-dispatch that subagent only. Worst case: `git reset --hard ae748f2` restores the review-fixes baseline.

**Background services running:**
- Production server on localhost:3000 (PID tracked by last `npm run start`)
- Cloudflared tunnel (check for latest URL with: `ps aux | grep cloudflared`)

---

## File Structure

| # | File | Status | Stage | Task |
|---|------|--------|-------|------|
| 1 | `src/app/globals.css` | REWRITE | 1 | 1 |
| 2 | `src/app/layout.tsx` | MODIFY | 1 | 1 |
| 3 | `public/textures/paper-grain.svg` | CREATE | 1 | 2 |
| 4 | `public/textures/jute.svg` | CREATE | 1 | 2 |
| 5 | `public/textures/wax-noise.svg` | CREATE | 1 | 2 |
| 6 | `src/components/icons/tea/leaf-mark.tsx` | CREATE | 1 | 3 |
| 7 | `src/components/icons/tea/cupping-bowl.tsx` | CREATE | 1 | 3 |
| 8 | `src/components/icons/tea/kettle-steam.tsx` | CREATE | 1 | 3 |
| 9 | `src/components/icons/tea/tea-chest.tsx` | CREATE | 1 | 3 |
| 10 | `src/components/icons/tea/ladle.tsx` | CREATE | 1 | 3 |
| 11 | `src/components/icons/tea/gavel.tsx` | CREATE | 1 | 3 |
| 12 | `src/components/icons/tea/wax-seal.tsx` | CREATE | 1 | 3 |
| 13 | `src/components/icons/tea/terrace.tsx` | CREATE | 1 | 3 |
| 14 | `src/components/icons/tea/cardamom.tsx` | CREATE | 1 | 3 |
| 15 | `src/components/icons/tea/index.ts` | CREATE | 1 | 3 |
| 16 | `src/components/brand/wordmark.tsx` | CREATE | 1 | 4 |
| 17 | `src/components/ui/button.tsx` | CREATE | 2 | 5 |
| 18 | `src/components/ui/chip.tsx` | CREATE | 2 | 5 |
| 19 | `src/components/ui/card.tsx` | CREATE | 2 | 5 |
| 20 | `src/components/ui/stamp.tsx` | CREATE | 2 | 6 |
| 21 | `src/components/ui/sheet.tsx` | CREATE | 2 | 6 |
| 22 | `src/components/ui/skeleton.tsx` | CREATE | 2 | 6 |
| 23 | `src/components/ui/divider.tsx` | CREATE | 2 | 6 |
| 24 | `src/components/ui/badge.tsx` | REWRITE (backward-compat) | 2 | 7 |
| 25 | `src/components/ui/tabs.tsx` | CREATE | 2 | 7 |
| 26 | `src/components/ui/accordion.tsx` | CREATE | 2 | 7 |
| 27 | `src/components/ui/tooltip.tsx` | CREATE | 2 | 8 |
| 28 | `src/components/ui/toggle.tsx` | CREATE | 2 | 8 |
| 29 | `src/components/ui/number-display.tsx` | CREATE | 2 | 8 |
| 30 | `src/components/top-nav.tsx` | REWRITE | 3 | 9 |
| 31 | `src/components/bottom-nav.tsx` | REWRITE | 3 | 9 |

**Total:** 9 tasks across 3 stages, 26 new files, 5 rewrites.

**Design decision — texture format:** the spec mentions `paper-grain.png` but this plan uses `paper-grain.svg` instead. SVG is easier to specify fully in a plan (no binary data), it uses `<feTurbulence>` to generate procedural noise, and the file size is comparable for small textures. The `globals.css` canvas background will reference `paper-grain.svg`.

---

## Stage 1 — Tokens, Fonts, Textures, Icons, Wordmark

Dispatch Tasks 1–4 in parallel as 4 separate subagents. Stage 1 review checkpoint at the end verifies all 4 merged cleanly before Stage 2 begins.

---

### Task 1 — Tokens + Fonts (Subagent A)

**Files:**
- Rewrite: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Purpose:** Establish the tea-liquor color palette, typography scale, spacing/radii/shadows/motion tokens, and canvas background treatment. Swap Playfair → Fraunces, Noto Sans Arabic → Amiri, add JetBrains Mono, keep Inter. This is the foundation everything else consumes.

- [ ] **Step 1.1: Read current globals.css to understand existing tokens**

Run:
```bash
cat src/app/globals.css
```
Expected: the current file has `@import "tailwindcss";`, a `@theme inline {}` block with color + font vars, `body { ... }` styles, and three keyframes (`pulse-danger`, `flash-green`, `tabular-nums`). Note which keyframes exist so you can preserve them.

- [ ] **Step 1.2: Rewrite `src/app/globals.css`**

Replace the ENTIRE contents of `src/app/globals.css` with:

```css
@import "tailwindcss";

/* ═══════════════════════════════════════════════════════════
   FE-1 FOUNDATION — Tea Liquor Palette + Catalog Typography
   ═══════════════════════════════════════════════════════════
   Replaces the prior emerald/amber stub with a cream-catalog
   palette and Fraunces/Inter/Amiri/JetBrains Mono typography.
   Variable NAMES preserved for backward compat with existing
   Tailwind utility classes (bg-primary, text-accent, etc.).
   ═══════════════════════════════════════════════════════════ */

@theme inline {
  /* ── Paper & ink (the canvas) ────────────────────────────── */
  --color-catalog: #F7F1E3;
  --color-paper: #FDFAF2;
  --color-raised: #FFFFFF;
  --color-inset: #F1E9D2;
  --color-stamp-bg: #F7EEDC;
  --color-jute: #D9C7A1;
  --color-rule: #E5D9BE;
  --color-ink: #1B1410;
  --color-ink-soft: #3B2A22;
  --color-ink-muted: #6B5A4E;

  /* ── Tea-liquor accents (tokens only; tinting deferred) ─── */
  --liquor-black: #6B3410;
  --liquor-green: #7FA650;
  --liquor-oolong: #B56B1B;
  --liquor-white: #E8D690;
  --liquor-puerh: #4A2316;
  --liquor-herbal: #C33B2E;
  --liquor-blend: #8A6A3D;

  /* ── Semantic layer (what components consume) ─────────────── */
  --color-primary: #0F5132;
  --color-primary-700: #0B3D25;
  --color-primary-50: #E8F3ED;
  --color-primary-light: #1E7D4C;
  --color-accent: #B56B1B;
  --color-accent-hot: #D9541E;
  --color-accent-light: #C99A3B;
  --color-gold: #C99A3B;
  --color-wax: #8A1C1C;
  --color-mint: #5FA58E;
  --color-cardamom: #C48949;

  /* ── State (named for tea) ─────────────────────────────────── */
  --color-live: #1E7D4C;
  --color-winning: #0F5132;
  --color-outbid: #B04A1E;
  --color-danger: #8A1C1C;
  --color-success: #1E7D4C;
  --color-escrow: #2E6E8C;

  /* ── Surface aliases (Tailwind-consumable, names preserved) ── */
  --color-background: var(--color-catalog);
  --color-foreground: var(--color-ink);
  --color-card: var(--color-paper);
  --color-border: var(--color-rule);
  --color-muted: var(--color-ink-muted);

  /* ── Fonts (variable names preserved) ─────────────────────── */
  --font-sans: var(--font-inter);
  --font-serif: var(--font-fraunces);
  --font-arabic: var(--font-amiri);
  --font-mono: var(--font-jetbrains);

  /* ── Spacing (4px base) ──────────────────────────────────── */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;

  /* ── Radius ──────────────────────────────────────────────── */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --radius-xl: 28px;
  --radius-stamp: 9999px;

  /* ── Shadows (paper-like) ────────────────────────────────── */
  --shadow-paper: 0 1px 0 0 rgba(27, 20, 16, 0.04), 0 8px 24px -12px rgba(107, 52, 16, 0.16);
  --shadow-card: 0 1px 0 0 rgba(27, 20, 16, 0.05), 0 18px 40px -24px rgba(107, 52, 16, 0.22);
  --shadow-lift: 0 2px 0 0 rgba(27, 20, 16, 0.06), 0 32px 60px -30px rgba(107, 52, 16, 0.28);
  --shadow-stamp: 0 2px 0 -1px rgba(138, 28, 28, 0.6), 0 0 0 1px rgba(138, 28, 28, 0.2) inset;

  /* ── Motion ──────────────────────────────────────────────── */
  --ease-steam: cubic-bezier(0.22, 0.61, 0.36, 1);
  --ease-pour: cubic-bezier(0.83, 0.00, 0.17, 1);
  --ease-stamp: cubic-bezier(0.36, 0.07, 0.19, 0.97);
  --duration-tap: 120ms;
  --duration-quick: 220ms;
  --duration-bid: 380ms;
  --duration-hammer: 900ms;
  --duration-brew: 2400ms;
}

/* ═══════════════════════════════════════════════════════════
   Canvas background — the single biggest visual upgrade.
   Radial gold gradient + paper-grain texture + catalog cream.
   ═══════════════════════════════════════════════════════════ */
body {
  background:
    radial-gradient(120% 80% at 50% 0%, rgba(201, 154, 59, 0.07), transparent 55%),
    url("/textures/paper-grain.svg") repeat,
    var(--color-catalog);
  background-size: auto, 256px 256px, auto;
  color: var(--color-foreground);
  font-family: var(--font-sans), system-ui, sans-serif;
}

/* ═══════════════════════════════════════════════════════════
   Typography utility classes — catalog hierarchy
   ═══════════════════════════════════════════════════════════ */
@layer components {
  .type-display-xl {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: clamp(3.25rem, 6vw, 5.5rem);
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .type-display-lg {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: clamp(2.25rem, 4vw, 3.75rem);
    letter-spacing: -0.015em;
    line-height: 1.1;
  }
  .type-headline {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    letter-spacing: -0.01em;
    line-height: 1.15;
  }
  .type-title {
    font-family: var(--font-serif);
    font-weight: 600;
    font-size: 1.375rem;
    line-height: 1.2;
  }
  .type-subtitle {
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 1.125rem;
    line-height: 1.3;
  }
  .type-body {
    font-family: var(--font-sans);
    font-weight: 400;
    font-size: 0.9375rem;
    line-height: 1.55;
  }
  .type-meta {
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 1.4;
    letter-spacing: 0.02em;
  }
  .type-micro {
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: 0.6875rem;
    line-height: 1.3;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .type-price-xl {
    font-family: var(--font-serif);
    font-weight: 500;
    font-size: clamp(2rem, 4vw, 3rem);
    font-variant-numeric: tabular-nums oldstyle-nums;
    line-height: 1;
  }
  .type-price {
    font-family: var(--font-mono);
    font-weight: 500;
    font-size: 1.25rem;
    font-variant-numeric: tabular-nums;
  }
  .type-lot-number {
    font-family: var(--font-mono);
    font-weight: 600;
    font-size: 0.75rem;
    letter-spacing: 0.1em;
  }
}

/* ═══════════════════════════════════════════════════════════
   Keyframes — motion vocabulary
   Preserves pulse-danger + flash-green from prior globals.css
   ═══════════════════════════════════════════════════════════ */

/* Auction countdown pulse (PRESERVED from prior globals.css) */
@keyframes pulse-danger {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.animate-pulse-danger {
  animation: pulse-danger 1s ease-in-out infinite;
}

/* Price update flash (PRESERVED from prior globals.css) */
@keyframes flash-green {
  0% { background-color: rgba(22, 163, 74, 0.2); }
  100% { background-color: transparent; }
}
.animate-flash-green {
  animation: flash-green 0.6s ease-out;
}

/* NEW — steam, stamp, kettle, leaf-unfurl, wax-crack */
@keyframes steam {
  0% { transform: translateY(0); opacity: 0; }
  15% { opacity: 0.7; }
  100% { transform: translateY(-12px); opacity: 0; }
}
@keyframes flash-pour {
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
}
@keyframes stamp-land {
  0% { transform: scale(1.4) rotate(-6deg); opacity: 0; }
  60% { transform: scale(1.02) rotate(-3deg); opacity: 1; }
  100% { transform: scale(1) rotate(-3deg); opacity: 1; }
}
@keyframes kettle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(0.98); }
}
@keyframes leaf-unfurl {
  from { stroke-dashoffset: var(--dash-length, 100%); }
  to { stroke-dashoffset: 0; }
}
@keyframes wax-crack {
  0%, 100% { transform: skew(0, 0); }
  50% { transform: skew(-0.5deg, 0); }
}
@keyframes skeleton-breathe {
  0%, 100% { opacity: 0.06; }
  50% { opacity: 0.14; }
}

.animate-steam { animation: steam 6s var(--ease-steam) infinite; }
.animate-stamp-land { animation: stamp-land var(--duration-hammer) var(--ease-stamp) both; }
.animate-kettle-pulse { animation: kettle-pulse 1s ease-in-out infinite; }
.animate-skeleton-breathe { animation: skeleton-breathe var(--duration-brew) ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .animate-steam,
  .animate-stamp-land,
  .animate-kettle-pulse,
  .animate-skeleton-breathe,
  .animate-pulse-danger,
  .animate-flash-green {
    animation: none !important;
  }
}

/* Utility for mono tabular-nums */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 1.3: Modify `src/app/layout.tsx` — swap fonts**

Read the current file first to confirm the existing imports:
```bash
cat src/app/layout.tsx
```
Expected: existing imports from `next/font/google` include `Inter`, `Playfair_Display`, `Noto_Sans_Arabic`.

Find this block in `src/app/layout.tsx`:
```ts
import { Inter, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
```

Replace with:
```ts
import { Inter, Fraunces, Amiri, JetBrains_Mono } from "next/font/google";
```

Then find the font variable declarations. They currently look like:
```ts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});
```

Replace with:
```ts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
```

Then find the `<html>` tag that applies the font classes. Currently it looks like:
```tsx
<html
  lang="en"
  className={`${inter.variable} ${playfair.variable} ${notoArabic.variable} h-full antialiased`}
>
```

Replace with:
```tsx
<html
  lang="en"
  className={`${inter.variable} ${fraunces.variable} ${amiri.variable} ${jetbrains.variable} h-full antialiased`}
>
```

- [ ] **Step 1.4: Build to verify font swap + token rewrite compile**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -20`

Expected: "Compiled successfully", 14 routes listed.

If it fails with a TypeScript error about a font, double-check the import list in `layout.tsx` and the variable declarations match.

- [ ] **Step 1.5: Manual visual check (delayed until Stage 1 checkpoint)**

Note: the body background references `/textures/paper-grain.svg` which won't exist until Task 2 completes. Do NOT restart the production server yet. The build still passes because Next.js doesn't validate texture paths at build time — the 404 only appears at runtime.

- [ ] **Step 1.6: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/app/globals.css src/app/layout.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): tea liquor palette + Fraunces/Amiri/JetBrains fonts"
```

---

### Task 2 — Textures (Subagent B)

**Files:**
- Create: `public/textures/paper-grain.svg`
- Create: `public/textures/jute.svg`
- Create: `public/textures/wax-noise.svg`

**Purpose:** Three tileable SVG textures referenced by `globals.css` (paper-grain on the body background) and by the `<Stamp>` primitive (wax-noise). Jute is a reserved texture for section dividers in future sub-projects but defined here so the texture system is complete.

All three use SVG's built-in `<feTurbulence>` filter to generate procedural noise. No external images, no binary data.

- [ ] **Step 2.1: Ensure the textures directory exists**

Run:
```bash
mkdir -p ~/Desktop/chaiblock/public/textures
```

- [ ] **Step 2.2: Create `public/textures/paper-grain.svg`**

Create the file with this exact content:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <filter id="paper">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
    <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0.08 0" />
  </filter>
  <rect width="256" height="256" fill="#F7F1E3" />
  <rect width="256" height="256" filter="url(#paper)" />
</svg>
```

Why this shape: a 256×256 tile with a fractal-noise overlay at ~8% opacity. Tiles seamlessly because the turbulence is continuous at the edges for this frequency.

- [ ] **Step 2.3: Create `public/textures/jute.svg`**

Create the file with this exact content:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <pattern id="jute-weave" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="#D9C7A1" />
      <path d="M0 4 L 8 4" stroke="#B39E6E" stroke-width="0.6" opacity="0.5" />
      <path d="M4 0 L 4 8" stroke="#B39E6E" stroke-width="0.6" opacity="0.5" />
    </pattern>
  </defs>
  <rect width="32" height="32" fill="url(#jute-weave)" />
</svg>
```

- [ ] **Step 2.4: Create `public/textures/wax-noise.svg`**

Create the file with this exact content:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <filter id="wax">
    <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="3" seed="13" />
    <feColorMatrix type="matrix" values="0 0 0 0 0.54  0 0 0 0 0.11  0 0 0 0 0.11  0 0 0 0.35 0" />
  </filter>
  <rect width="64" height="64" fill="transparent" />
  <rect width="64" height="64" filter="url(#wax)" />
</svg>
```

This one has a transparent background so it can overlay any color (typically used as a background-image on the `<Stamp>` component).

- [ ] **Step 2.5: Verify files exist and are non-empty**

Run:
```bash
ls -la ~/Desktop/chaiblock/public/textures/
```

Expected output: 3 files, each between 300–800 bytes.

```bash
head -c 50 ~/Desktop/chaiblock/public/textures/paper-grain.svg
head -c 50 ~/Desktop/chaiblock/public/textures/jute.svg
head -c 50 ~/Desktop/chaiblock/public/textures/wax-noise.svg
```

Expected: each prints the opening `<svg xmlns="http://www.w3.org/2000/svg"...`.

- [ ] **Step 2.6: Commit**

```bash
cd ~/Desktop/chaiblock
git add public/textures/
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): add paper-grain, jute, wax-noise SVG textures"
```

---

### Task 3 — Tea Icon Family (Subagent C)

**Files:**
- Create: `src/components/icons/tea/leaf-mark.tsx`
- Create: `src/components/icons/tea/cupping-bowl.tsx`
- Create: `src/components/icons/tea/kettle-steam.tsx`
- Create: `src/components/icons/tea/tea-chest.tsx`
- Create: `src/components/icons/tea/ladle.tsx`
- Create: `src/components/icons/tea/gavel.tsx`
- Create: `src/components/icons/tea/wax-seal.tsx`
- Create: `src/components/icons/tea/terrace.tsx`
- Create: `src/components/icons/tea/cardamom.tsx`
- Create: `src/components/icons/tea/index.ts`

**Purpose:** 9 custom hand-drawn tea icons + a barrel export. Each is a 24×24 React SVG component with 1.5px stroke, round caps, using `currentColor` so Tailwind `text-*` classes work. These own the brand moments; lucide stays for generic UI.

All 9 icons share an identical interface:
```ts
interface TeaIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;  // default 24
  className?: string;
}
```

- [ ] **Step 3.1: Create the directory**

Run:
```bash
mkdir -p ~/Desktop/chaiblock/src/components/icons/tea
```

- [ ] **Step 3.2: Create `src/components/icons/tea/leaf-mark.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function LeafMark({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Two leaves flanking a central bud — the universal tea plucking standard */}
      <path d="M12 20 C 7 17, 5 12, 7 6 C 10 7, 12 10, 12 14" />
      <path d="M12 20 C 17 17, 19 12, 17 6 C 14 7, 12 10, 12 14" />
      <path d="M12 14 L 12 20" />
      <circle cx="12" cy="4.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
```

- [ ] **Step 3.3: Create `src/components/icons/tea/cupping-bowl.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function CuppingBowl({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Porcelain tasting bowl from above + spoon resting across */}
      <ellipse cx="12" cy="14" rx="8.5" ry="2" />
      <path d="M3.5 14 C 3.5 18, 8 20.5, 12 20.5 C 16 20.5, 20.5 18, 20.5 14" />
      <ellipse cx="12" cy="14" rx="5.5" ry="1.2" opacity="0.6" />
      {/* Spoon */}
      <ellipse cx="18" cy="9" rx="2" ry="1.1" transform="rotate(-25 18 9)" />
      <path d="M16.5 9.8 L 9 13" />
    </svg>
  );
}
```

- [ ] **Step 3.4: Create `src/components/icons/tea/kettle-steam.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function KettleSteam({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Samovar silhouette */}
      <rect x="6" y="11" width="12" height="8" rx="2" />
      <path d="M9 11 L 9 8 Q 12 6, 15 8 L 15 11" />
      <path d="M18 14 Q 20.5 14, 20.5 16 Q 20.5 17.5, 19 17.5" />
      <path d="M8 19 L 8 20.5" />
      <path d="M16 19 L 16 20.5" />
      {/* 3 steam lines — add animate-steam class to these in consumers */}
      <path d="M9 5 Q 10 3, 9 1" opacity="0.6" />
      <path d="M12 5 Q 13 3, 12 1" opacity="0.6" />
      <path d="M15 5 Q 16 3, 15 1" opacity="0.6" />
    </svg>
  );
}
```

- [ ] **Step 3.5: Create `src/components/icons/tea/tea-chest.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function TeaChest({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Stamped wooden chest */}
      <rect x="3" y="7" width="18" height="13" rx="1" />
      <path d="M3 11 L 21 11" />
      <path d="M3 7 L 5 5 L 19 5 L 21 7" />
      {/* Wax-seal stamp on the front */}
      <circle cx="12" cy="15.5" r="2" />
      <path d="M10.5 14 L 13.5 17" opacity="0.6" />
    </svg>
  );
}
```

- [ ] **Step 3.6: Create `src/components/icons/tea/ladle.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Ladle({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Bid action icon — traditional tea ladle */}
      <circle cx="7" cy="15" r="4" />
      <path d="M10 13 L 20 4" />
      <path d="M18 3 L 21 6" />
    </svg>
  );
}
```

- [ ] **Step 3.7: Create `src/components/icons/tea/gavel.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Gavel({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Auctioneer's gavel */}
      <rect x="11" y="3" width="10" height="4" rx="0.5" transform="rotate(45 11 3)" />
      <path d="M13 9 L 6 16" />
      <rect x="3" y="17" width="10" height="3" rx="0.5" />
    </svg>
  );
}
```

- [ ] **Step 3.8: Create `src/components/icons/tea/wax-seal.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function WaxSeal({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Round seal with two ribbon tails */}
      <circle cx="12" cy="10" r="6" />
      <circle cx="12" cy="10" r="3" />
      <path d="M8 15 L 7 22 L 10 20" />
      <path d="M16 15 L 17 22 L 14 20" />
    </svg>
  );
}
```

- [ ] **Step 3.9: Create `src/components/icons/tea/terrace.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Terrace({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Three tea-field terrace contours */}
      <path d="M2 8 C 7 6, 12 6, 22 9" />
      <path d="M2 13 C 7 11, 12 11, 22 14" />
      <path d="M2 18 C 7 16, 12 16, 22 19" />
    </svg>
  );
}
```

- [ ] **Step 3.10: Create `src/components/icons/tea/cardamom.tsx`**

```tsx
import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Cardamom({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Cardamom pod — vertical oval with dividing line and small top tip */}
      <path d="M12 3 L 12 4.5" />
      <ellipse cx="12" cy="13" rx="5" ry="8" />
      <path d="M12 6 L 12 21" opacity="0.5" />
      <path d="M7.5 13 L 16.5 13" opacity="0.3" />
    </svg>
  );
}
```

- [ ] **Step 3.11: Create `src/components/icons/tea/index.ts` (barrel export)**

```ts
export { LeafMark } from "./leaf-mark";
export { CuppingBowl } from "./cupping-bowl";
export { KettleSteam } from "./kettle-steam";
export { TeaChest } from "./tea-chest";
export { Ladle } from "./ladle";
export { Gavel } from "./gavel";
export { WaxSeal } from "./wax-seal";
export { Terrace } from "./terrace";
export { Cardamom } from "./cardamom";
```

- [ ] **Step 3.12: Build to verify all 9 icons compile**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully", no TypeScript errors.

If a single icon fails to compile (e.g. typo in SVG), fix it before committing. Don't commit a broken icon alongside 8 working ones.

- [ ] **Step 3.13: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/icons/tea/
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): 9 custom tea icons + barrel export"
```

---

### Task 4 — Brand Wordmark (Subagent D)

**Files:**
- Create: `src/components/brand/wordmark.tsx`

**Purpose:** The brand lockup — `<LeafMark /> + شاي + ShaiBlock`. Three variants (`horizontal`, `stacked`, `mark-only`). Used by TopNav in Task 9 and by the landing page header in future sub-projects.

**Dependency note:** This task imports `LeafMark` from Task 3. Since Tasks 1–4 run in parallel, Subagent D must wait for Task 3 to land before committing. If Subagent D runs first (or concurrently without coordination), write the component with a **placeholder inline SVG** that will be replaced during the Stage 1 review checkpoint.

For this plan, assume the parent agent (running the staged-parallel dispatch) ensures Task 3 lands before Task 4. Both tasks get committed in the Stage 1 review checkpoint sequence below.

- [ ] **Step 4.1: Ensure the brand directory exists**

Run:
```bash
mkdir -p ~/Desktop/chaiblock/src/components/brand
```

- [ ] **Step 4.2: Create `src/components/brand/wordmark.tsx`**

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { LeafMark } from "@/components/icons/tea";
import { cn } from "@/lib/utils";

// ============================================================
// Wordmark — brand lockup for ShaiBlock
// ----------------------------------------------------------------
// Composition: <LeafMark /> + Arabic "شاي" + "ShaiBlock" in serif.
// Three variants:
//   - horizontal (default): LeafMark | ShaiBlock | شاي
//   - stacked: LeafMark on top, ShaiBlock + شاي below
//   - mark-only: just the LeafMark (collapsed TopNav, favicons)
// ============================================================

const wordmarkVariants = cva("inline-flex items-center gap-2 select-none", {
  variants: {
    variant: {
      horizontal: "flex-row",
      stacked: "flex-col items-start gap-0",
      "mark-only": "",
    },
    size: {
      sm: "[--wordmark-mark:20px] [--wordmark-text:1rem]",
      md: "[--wordmark-mark:28px] [--wordmark-text:1.25rem]",
      lg: "[--wordmark-mark:40px] [--wordmark-text:1.75rem]",
    },
  },
  defaultVariants: {
    variant: "horizontal",
    size: "md",
  },
});

export interface WordmarkProps
  extends VariantProps<typeof wordmarkVariants> {
  className?: string;
}

export function Wordmark({ variant, size, className }: WordmarkProps) {
  const showText = variant !== "mark-only";
  return (
    <div
      className={cn(wordmarkVariants({ variant, size }), className)}
      aria-label="ShaiBlock"
    >
      <LeafMark
        size={undefined}
        style={{ width: "var(--wordmark-mark)", height: "var(--wordmark-mark)" }}
        className="text-primary shrink-0"
      />
      {showText && (
        <div
          className={cn(
            "flex items-baseline gap-1.5 leading-none",
            variant === "stacked" && "mt-1"
          )}
        >
          <span
            className="font-serif font-bold text-ink"
            style={{ fontSize: "var(--wordmark-text)" }}
          >
            ShaiBlock
          </span>
          <span
            className="font-arabic text-accent font-bold"
            dir="rtl"
            lang="ar"
            style={{ fontSize: "calc(var(--wordmark-text) * 0.85)" }}
          >
            شاي
          </span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4.3: Build to verify**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully".

If the `LeafMark` import fails, it means Task 3 hasn't committed yet. Stop and dispatch/wait for Task 3 first.

- [ ] **Step 4.4: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/brand/wordmark.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): brand Wordmark component (horizontal/stacked/mark-only)"
```

---

## Stage 1 Review Checkpoint

After Tasks 1, 2, 3, 4 all commit, run this verification before dispatching Stage 2.

- [ ] **Checkpoint 1: Build passes**

```bash
cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -20
```

Expected: "Compiled successfully", 14 routes.

- [ ] **Checkpoint 2: Texture files exist**

```bash
ls -la ~/Desktop/chaiblock/public/textures/
```

Expected: `paper-grain.svg`, `jute.svg`, `wax-noise.svg`, each 300–900 bytes.

- [ ] **Checkpoint 3: All 9 icons exist**

```bash
ls ~/Desktop/chaiblock/src/components/icons/tea/
```

Expected: `leaf-mark.tsx`, `cupping-bowl.tsx`, `kettle-steam.tsx`, `tea-chest.tsx`, `ladle.tsx`, `gavel.tsx`, `wax-seal.tsx`, `terrace.tsx`, `cardamom.tsx`, `index.ts`.

- [ ] **Checkpoint 4: Wordmark exists**

```bash
ls ~/Desktop/chaiblock/src/components/brand/
```

Expected: `wordmark.tsx`.

- [ ] **Checkpoint 5: Production server + manual visual verify**

```bash
lsof -ti :3000 | xargs kill 2>/dev/null; sleep 1
cd ~/Desktop/chaiblock && npm run start &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/textures/paper-grain.svg
```

Expected: both return `200`.

Open `http://localhost:3000/` in a browser:
- Body background: cream (`#F7F1E3`) with subtle paper-grain texture visible
- Top nav still renders (looks visually similar to before — Task 9 replaces it)
- No 404s in devtools Network tab for fonts or textures
- Inspect an `<h1>` in devtools: `font-family` should include `Fraunces`
- Inspect body: `font-family` should include `Inter`
- Arabic `شاي` text should render with Amiri (visually distinct from Noto Sans Arabic — more calligraphic)

If any checkpoint fails, investigate before dispatching Stage 2. Do NOT proceed with broken foundation.

- [ ] **Checkpoint 6: All Stage 1 commits present**

```bash
cd ~/Desktop/chaiblock && git log --oneline -6
```

Expected to see 4 feat(fe1) commits from Stage 1 (tokens+fonts, textures, icons, wordmark) plus the 2 prior review-fixes and initial-commit lines.

---

## Stage 2 — UI Primitives (12 components across 4 parallel subagents)

Dispatch Tasks 5, 6, 7, 8 in parallel as 4 separate subagents. Stage 2 review checkpoint at the end verifies all 12 primitives compile before Stage 3.

---

### Task 5 — Button + Chip + Card (Subagent E)

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/chip.tsx`
- Create: `src/components/ui/card.tsx`

**Purpose:** The three most-used primitives — interactive buttons, pill chips, and card surfaces. Every future component consumes these.

- [ ] **Step 5.1: Create `src/components/ui/button.tsx`**

```tsx
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Button — 5 variants × 4 sizes
// Variants: primary (emerald), secondary (paper), ghost,
//           stamp (copper w/ wax border), danger (wax red)
// Sizes: sm 32px, md 40px, lg 48px, xl 56px
// Touch-target floor: md/lg/xl all ≥ 44px; sm is desktop-only
// ============================================================

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-[var(--color-primary-700)] shadow-[var(--shadow-paper)]",
        secondary:
          "bg-card text-foreground border border-border hover:bg-[var(--color-inset)]",
        ghost: "bg-transparent text-foreground hover:bg-[var(--color-inset)]",
        stamp:
          "bg-accent text-white border-2 border-[var(--color-wax)] shadow-[var(--shadow-stamp)] hover:brightness-110",
        danger:
          "bg-[var(--color-danger)] text-white hover:brightness-110 shadow-[var(--shadow-paper)]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

- [ ] **Step 5.2: Create `src/components/ui/chip.tsx`**

```tsx
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Chip — pill with optional leading icon
// Variants: neutral, liquor-tinted, status, wax
// Liquor-tinted accepts an optional liquor prop ('black' | 'green' |
// 'oolong' | 'white' | 'puerh' | 'herbal' | 'blend') that sets a
// tea-type-specific background tint.
// ============================================================

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-medium select-none transition-colors",
  {
    variants: {
      variant: {
        neutral:
          "bg-card border-border text-foreground hover:bg-[var(--color-inset)]",
        "liquor-tinted": "border-transparent text-foreground",
        status:
          "bg-[var(--color-primary-50)] border-[var(--color-primary-700)]/20 text-[var(--color-primary-700)]",
        wax:
          "bg-[var(--color-wax)] border-[var(--color-wax)] text-white shadow-[var(--shadow-stamp)]",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

const liquorBackgrounds: Record<string, string> = {
  black: "rgba(107, 52, 16, 0.12)",
  green: "rgba(127, 166, 80, 0.12)",
  oolong: "rgba(181, 107, 27, 0.12)",
  white: "rgba(232, 214, 144, 0.25)",
  puerh: "rgba(74, 35, 22, 0.12)",
  herbal: "rgba(195, 59, 46, 0.12)",
  blend: "rgba(138, 106, 61, 0.12)",
};

export type LiquorType =
  | "black"
  | "green"
  | "oolong"
  | "white"
  | "puerh"
  | "herbal"
  | "blend";

export interface ChipProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  leadingIcon?: ReactNode;
  liquor?: LiquorType;
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ variant, size, leadingIcon, liquor, className, style, children, ...rest }, ref) => {
    const tintedStyle =
      variant === "liquor-tinted" && liquor
        ? { backgroundColor: liquorBackgrounds[liquor], ...style }
        : style;
    return (
      <span
        ref={ref}
        className={cn(chipVariants({ variant, size }), className)}
        style={tintedStyle}
        {...rest}
      >
        {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
        {children}
      </span>
    );
  }
);
Chip.displayName = "Chip";
```

- [ ] **Step 5.3: Create `src/components/ui/card.tsx`**

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Card — 3 surface variants: paper / raised / inset
// ============================================================

const cardVariants = cva("rounded-lg", {
  variants: {
    variant: {
      paper: "bg-card border border-border",
      raised: "bg-[var(--color-raised)] shadow-[var(--shadow-card)]",
      inset: "bg-[var(--color-inset)]",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "paper",
    padding: "md",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant, padding, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
```

- [ ] **Step 5.4: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully".

- [ ] **Step 5.5: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/ui/button.tsx src/components/ui/chip.tsx src/components/ui/card.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): Button + Chip + Card primitives"
```

---

### Task 6 — Stamp + Sheet + Skeleton + Divider (Subagent F)

**Files:**
- Create: `src/components/ui/stamp.tsx`
- Create: `src/components/ui/sheet.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/divider.tsx`

**Purpose:** Four primitives covering surfaces (Stamp for lot numbers + status, Sheet for bottom modals, Skeleton for loading, Divider for section rules). Stamp is the signature motif of the entire design system.

- [ ] **Step 6.1: Create `src/components/ui/stamp.tsx`**

```tsx
import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Stamp — circular wax-seal wrapper for lot numbers + status labels
// Uses shadow-stamp + wax-noise.svg as background image overlay.
// ============================================================

const stampVariants = cva(
  "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider rounded-full select-none relative overflow-hidden",
  {
    variants: {
      color: {
        wax: "bg-[var(--color-wax)] text-white border-2 border-[var(--color-wax)]",
        primary: "bg-primary text-white border-2 border-primary",
        accent: "bg-accent text-white border-2 border-accent",
        gold: "bg-[var(--color-gold)] text-white border-2 border-[var(--color-gold)]",
      },
      size: {
        xs: "w-5 h-5 text-[9px] px-1",
        sm: "w-7 h-7 text-[10px] px-1.5",
        md: "h-9 px-3 text-xs min-w-9",
        lg: "h-12 px-4 text-sm min-w-12",
      },
    },
    defaultVariants: {
      color: "wax",
      size: "md",
    },
  }
);

export interface StampProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof stampVariants> {
  label: string;
}

export const Stamp = forwardRef<HTMLSpanElement, StampProps>(
  ({ color, size, label, className, style, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(stampVariants({ color, size }), className)}
        style={{
          backgroundImage: "url(/textures/wax-noise.svg)",
          backgroundBlendMode: "overlay",
          boxShadow: "var(--shadow-stamp)",
          ...style,
        }}
        aria-label={label}
        {...rest}
      >
        <span className="relative z-10">{label}</span>
      </span>
    );
  }
);
Stamp.displayName = "Stamp";
```

- [ ] **Step 6.2: Create `src/components/ui/sheet.tsx`**

```tsx
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Sheet — bottom sheet primitive
// Mobile-first. Full-width on small screens, max-w-md on desktop.
// Dismisses on Escape + backdrop click + outside tap.
// Traps focus while open.
// ============================================================

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Sheet({ open, onClose, children, title, className }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Focus management
  useEffect(() => {
    if (open) {
      prevFocusRef.current = document.activeElement as HTMLElement;
      // Focus first focusable element inside the panel
      const timer = setTimeout(() => {
        const focusable = panelRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Restore focus on close
      prevFocusRef.current?.focus();
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-[rgba(27,20,16,0.4)] backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={panelRef}
        className={cn(
          "w-full md:max-w-md bg-card rounded-t-3xl md:rounded-2xl shadow-[var(--shadow-lift)] p-6 md:p-8 max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="type-title text-foreground mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 6.3: Create `src/components/ui/skeleton.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Skeleton — paper-grain placeholder with breathing animation
// Respects prefers-reduced-motion (animation is disabled in globals.css)
// ============================================================

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ width, height, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-foreground/[0.06] animate-skeleton-breathe",
        className
      )}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
```

- [ ] **Step 6.4: Create `src/components/ui/divider.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Divider — 3 variants: hair, leaf-chain, catalog-rule
// ============================================================

const dividerVariants = cva("", {
  variants: {
    variant: {
      hair: "border-t border-border",
      "leaf-chain": "",
      "catalog-rule": "",
    },
    orientation: {
      horizontal: "w-full",
      vertical: "h-full border-l border-t-0",
    },
  },
  defaultVariants: {
    variant: "hair",
    orientation: "horizontal",
  },
});

export interface DividerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {}

export function Divider({ variant, orientation, className, ...rest }: DividerProps) {
  if (variant === "leaf-chain") {
    return (
      <div
        className={cn("flex items-center gap-2 text-border", className)}
        role="separator"
        {...rest}
      >
        <span className="flex-1 border-t border-border" />
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M5 1 C 2 3, 2 7, 5 9 C 8 7, 8 3, 5 1 Z" />
          </svg>
        ))}
        <span className="flex-1 border-t border-border" />
      </div>
    );
  }
  if (variant === "catalog-rule") {
    return (
      <div
        className={cn("flex items-center gap-2 text-border", className)}
        role="separator"
        {...rest}
      >
        <span className="flex-1 border-t border-border" />
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true">
          <path d="M4 0 L 8 4 L 4 8 L 0 4 Z" />
        </svg>
        <span className="flex-1 border-t border-border" />
        <span className="flex-1 border-t border-border" />
      </div>
    );
  }
  return (
    <div
      className={cn(dividerVariants({ variant, orientation }), className)}
      role="separator"
      {...rest}
    />
  );
}
```

- [ ] **Step 6.5: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully".

- [ ] **Step 6.6: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/ui/stamp.tsx src/components/ui/sheet.tsx src/components/ui/skeleton.tsx src/components/ui/divider.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): Stamp + Sheet + Skeleton + Divider primitives"
```

---

### Task 7 — Badge rewrite + Tabs + Accordion (Subagent G)

**Files:**
- Rewrite: `src/components/ui/badge.tsx` (backward-compat)
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/accordion.tsx`

**Purpose:** Badge adds live/winning/outbid/ending-soon variants while preserving the 5 existing variants (default/success/danger/warning/outline). Tabs + Accordion are neutral primitives for future sub-projects.

- [ ] **Step 7.1: Read the current Badge to understand existing variants**

Run: `cat src/components/ui/badge.tsx`

Note the 5 existing variants and their API. Preserve them.

- [ ] **Step 7.2: Rewrite `src/components/ui/badge.tsx`**

Replace the ENTIRE file contents with:

```tsx
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Badge — backward-compat + new FE-1 variants
// ------------------------------------------------------------
// Existing variants (PRESERVED for current consumers):
//   default, success, danger, warning, outline
// NEW FE-1 variants:
//   live (with pulse animation)
//   winning (emerald solid)
//   outbid (copper solid)
//   ending-soon (accent-hot with pulse)
// Sizes: sm, md (unchanged from prior API)
// ============================================================

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Backward-compat
        default: "bg-primary text-white",
        success: "bg-[var(--color-success)] text-white",
        danger: "bg-[var(--color-danger)] text-white",
        warning: "bg-accent text-white",
        outline: "border border-border text-foreground",
        // New FE-1 variants
        live: "bg-[var(--color-live)] text-white",
        winning: "bg-[var(--color-winning)] text-white",
        outbid: "bg-[var(--color-outbid)] text-white",
        "ending-soon": "bg-[var(--color-accent-hot)] text-white animate-pulse-danger",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ variant, size, className, children, ...rest }: BadgeProps) {
  const showLiveDot = variant === "live";
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...rest}
    >
      {showLiveDot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
      )}
      {children}
    </span>
  );
}
```

- [ ] **Step 7.3: Create `src/components/ui/tabs.tsx`**

```tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Tabs — neutral tab primitive
// Composition: <Tabs>, <TabList>, <TabTrigger value="">, <TabPanel value="">
// Copper underline indicator on active trigger.
// ============================================================

interface TabsContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  onValueChange?: (v: string) => void;
}

export function Tabs({
  defaultValue,
  onValueChange,
  className,
  children,
  ...rest
}: TabsProps) {
  const [value, setValueState] = useState(defaultValue);
  const setValue = (v: string) => {
    setValueState(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn("flex flex-col", className)} {...rest}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-border",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export function TabTrigger({ value, className, children, ...rest }: TabTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabTrigger must be used within Tabs");
  const active = ctx.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx.setValue(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors relative",
        active
          ? "text-primary"
          : "text-[var(--color-ink-muted)] hover:text-foreground",
        className
      )}
      {...rest}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
      )}
    </button>
  );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be used within Tabs");
  if (ctx.value !== value) return null;
  return (
    <div role="tabpanel" className={cn("pt-4", className)} {...rest}>
      {children}
    </div>
  );
}
```

- [ ] **Step 7.4: Create `src/components/ui/accordion.tsx`**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Accordion — neutral accordion primitive
// Supports 'single' or 'multiple' open sections.
// Composition: <Accordion type="single">, <AccordionItem value="">,
//              <AccordionTrigger>, <AccordionContent>
// ============================================================

interface AccordionContextValue {
  type: "single" | "multiple";
  openSet: Set<string>;
  toggle: (v: string) => void;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);

const AccordionItemContext = createContext<string | null>(null);

interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type: "single" | "multiple";
  defaultValue?: string | string[];
}

export function Accordion({
  type,
  defaultValue,
  className,
  children,
  ...rest
}: AccordionProps) {
  const initial = new Set<string>(
    Array.isArray(defaultValue)
      ? defaultValue
      : defaultValue
        ? [defaultValue]
        : []
  );
  const [openSet, setOpenSet] = useState<Set<string>>(initial);

  const toggle = useCallback(
    (v: string) => {
      setOpenSet((prev) => {
        const next = new Set(prev);
        if (next.has(v)) {
          next.delete(v);
        } else {
          if (type === "single") next.clear();
          next.add(v);
        }
        return next;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ type, openSet, toggle }}>
      <div className={cn("divide-y divide-border", className)} {...rest}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({
  value,
  className,
  children,
  ...rest
}: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={value}>
      <div className={cn("py-3", className)} {...rest}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function AccordionTrigger({
  className,
  children,
  ...rest
}: AccordionTriggerProps) {
  const ctx = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  if (!ctx || !value)
    throw new Error("AccordionTrigger must be used within AccordionItem");
  const open = ctx.openSet.has(value);
  return (
    <button
      type="button"
      onClick={() => ctx.toggle(value)}
      aria-expanded={open}
      className={cn(
        "flex w-full items-center justify-between text-left font-medium text-foreground hover:text-primary transition-colors",
        className
      )}
      {...rest}
    >
      {children}
      <ChevronDown
        className={cn("w-4 h-4 transition-transform", open && "rotate-180")}
      />
    </button>
  );
}

interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AccordionContent({
  className,
  children,
  ...rest
}: AccordionContentProps) {
  const ctx = useContext(AccordionContext);
  const value = useContext(AccordionItemContext);
  if (!ctx || !value)
    throw new Error("AccordionContent must be used within AccordionItem");
  if (!ctx.openSet.has(value)) return null;
  return (
    <div
      className={cn("pt-3 text-[var(--color-ink-muted)] text-sm", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 7.5: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully", no TypeScript errors.

**Critical check:** existing consumers of `Badge` (`BidPanel`, `LotStatusBadge`, `toast-system`) must still compile. The 5 backward-compat variants (`default`, `success`, `danger`, `warning`, `outline`) are preserved.

- [ ] **Step 7.6: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/ui/badge.tsx src/components/ui/tabs.tsx src/components/ui/accordion.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): Badge rewrite (+ live/winning/outbid/ending-soon) + Tabs + Accordion"
```

---

### Task 8 — Tooltip + Toggle + NumberDisplay (Subagent H)

**Files:**
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/toggle.tsx`
- Create: `src/components/ui/number-display.tsx`

**Purpose:** Three small primitives completing the FE-1 foundation. NumberDisplay enforces mono tabular-nums so prices across the app stay visually aligned.

- [ ] **Step 8.1: Create `src/components/ui/tooltip.tsx`**

```tsx
"use client";

import {
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Tooltip — neutral tooltip with cream paper + hairline border
// Hover-triggered on desktop, tap-triggered on mobile (via focus).
// ============================================================

interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  side = "top",
  className,
  children,
  ...rest
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  const sideClass = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[side];

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      {...rest}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            "absolute z-[300] px-2.5 py-1.5 rounded-md bg-card border border-border shadow-[var(--shadow-card)] text-xs text-foreground whitespace-nowrap pointer-events-none",
            sideClass
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 8.2: Create `src/components/ui/toggle.tsx`**

```tsx
"use client";

import { cn } from "@/lib/utils";

// ============================================================
// Toggle — switch primitive
// Track: border when off, primary when on. Thumb: gold when on.
// ============================================================

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: ToggleProps) {
  return (
    <label className={cn("inline-flex items-center gap-3 cursor-pointer select-none", disabled && "opacity-50 cursor-not-allowed", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-[var(--color-rule)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform",
            checked ? "translate-x-5 bg-[var(--color-gold)]" : "bg-white"
          )}
        />
      </button>
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}
```

- [ ] **Step 8.3: Create `src/components/ui/number-display.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// NumberDisplay — enforces mono tabular-nums for consistent widths
// Sizes: sm, md, lg, xl
// Optional currency prefix + per-kg suffix
// ============================================================

const numberVariants = cva("font-mono tabular-nums leading-none", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-lg",
      lg: "type-price-xl",
      xl: "text-5xl md:text-6xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    size: "md",
    weight: "medium",
  },
});

export interface NumberDisplayProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof numberVariants> {
  value: number;
  currencyPrefix?: string;
  perKg?: boolean;
}

export function NumberDisplay({
  value,
  currencyPrefix = "$",
  perKg = false,
  size,
  weight,
  className,
  ...rest
}: NumberDisplayProps) {
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (
    <span className={cn(numberVariants({ size, weight }), className)} {...rest}>
      {currencyPrefix}
      {formatted}
      {perKg && (
        <span className="text-[var(--color-ink-muted)] font-normal ml-0.5 text-[0.7em]">
          /kg
        </span>
      )}
    </span>
  );
}
```

- [ ] **Step 8.4: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -10`

Expected: "Compiled successfully".

- [ ] **Step 8.5: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/ui/tooltip.tsx src/components/ui/toggle.tsx src/components/ui/number-display.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): Tooltip + Toggle + NumberDisplay primitives"
```

---

## Stage 2 Review Checkpoint

After Tasks 5, 6, 7, 8 all commit, run this verification before dispatching Stage 3.

- [ ] **Checkpoint 1: Build passes with all 12 primitives**

```bash
cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -20
```

Expected: "Compiled successfully", 14 routes.

- [ ] **Checkpoint 2: All 12 primitive files exist**

```bash
ls ~/Desktop/chaiblock/src/components/ui/
```

Expected: `accordion.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `chip.tsx`, `divider.tsx`, `number-display.tsx`, `sheet.tsx`, `skeleton.tsx`, `stamp.tsx`, `tabs.tsx`, `toggle.tsx`, `tooltip.tsx`.

- [ ] **Checkpoint 3: Existing Badge consumers still compile**

```bash
cd ~/Desktop/chaiblock && npx next build 2>&1 | grep -i "badge" || echo "no badge errors"
```

Expected: "no badge errors".

The existing files that import Badge (`src/components/bid-panel.tsx`, `src/components/lot-status-badge.tsx`, maybe others) must continue working because Task 7 preserved the 5 backward-compat variants.

- [ ] **Checkpoint 4: Dispatch Stage 3**

All Stage 2 commits present? Proceed to Task 9.

---

## Stage 3 — Chrome Rebuild (Task 9, serial)

---

### Task 9 — TopNav + BottomNav Rewrite (Subagent I)

**Files:**
- Rewrite: `src/components/top-nav.tsx`
- Rewrite: `src/components/bottom-nav.tsx`

**Purpose:** Rebuild the navigation chrome using the new Wordmark, tea icons, and primitives. Critical constraint: preserve existing behavior — role switcher logic, notification bell link with unread count, `isLotDetail` hide logic for BottomNav from the review-fixes commit `ae748f2`, scroll-based TopNav collapse is NEW.

- [ ] **Step 9.1: Read the current `top-nav.tsx`**

Run: `cat src/components/top-nav.tsx`

Confirm the current structure: sticky header, logo on left, 3 center nav links (Auctions / Ending Soon / Buy Now), role switcher segmented group, bell with unread count, avatar circle. Note that `useAuth` is imported from `@/components/providers` and `useAuth` returns `{ user, setRole }`.

- [ ] **Step 9.2: Rewrite `src/components/top-nav.tsx`**

Replace the ENTIRE file contents with:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/providers";
import { Wordmark } from "@/components/brand/wordmark";
import { Chip } from "@/components/ui/chip";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Auctions", href: "/auctions" },
  { label: "Ending Soon", href: "/auctions?filter=ending-soon" },
  { label: "Buy Now", href: "/auctions?filter=buy-now" },
] as const;

const UNREAD_COUNT = 2;

export function TopNav() {
  const pathname = usePathname();
  const { user, setRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Collapse on scroll past 120px for a calmer reading experience
  useEffect(() => {
    const handler = () => setCollapsed(window.scrollY > 120);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const initials = user.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden border-b border-border bg-card backdrop-blur-sm transition-[height] duration-300 md:flex",
        collapsed ? "h-12" : "h-16"
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
        {/* Brand lockup */}
        <Link href="/" className="flex items-center">
          <Wordmark variant={collapsed ? "mark-only" : "horizontal"} size="md" />
          {collapsed && (
            <span className="ml-2 relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-live)] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-live)]" />
            </span>
          )}
        </Link>

        {/* Center nav (hidden when collapsed) */}
        {!collapsed && (
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "type-meta transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-[var(--color-ink-muted)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Role preview — tea-type chip row */}
          {!collapsed && (
            <div
              className="hidden lg:inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-1"
              role="group"
              aria-label="Preview as"
            >
              <span className="px-2 type-micro text-[var(--color-ink-muted)]">View as</span>
              {(["buyer", "seller", "admin"] as const).map((role) => {
                const active = user.role === role;
                const label =
                  role === "buyer"
                    ? "Retailer"
                    : role === "seller"
                      ? "Wholesaler"
                      : "Admin";
                return (
                  <Chip
                    key={role}
                    variant={active ? "wax" : "neutral"}
                    size="sm"
                    onClick={() => setRole(role)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
          )}

          {/* Notifications */}
          <Link href="/notifications" className="relative p-1" aria-label={`Notifications (${UNREAD_COUNT} unread)`}>
            <Bell className="h-5 w-5 text-[var(--color-ink-muted)] hover:text-foreground transition-colors" />
            {UNREAD_COUNT > 0 && (
              <span className="absolute -top-0.5 -right-0.5">
                <Stamp label={String(UNREAD_COUNT)} color="wax" size="xs" />
              </span>
            )}
          </Link>

          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 9.3: Read the current `bottom-nav.tsx`**

Run: `cat src/components/bottom-nav.tsx`

Confirm it has the 5 tabs + the `isLotDetail` hide logic from commit `ae748f2`. You must preserve that logic.

- [ ] **Step 9.4: Rewrite `src/components/bottom-nav.tsx`**

Replace the ENTIRE file contents with:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import { LeafMark, CuppingBowl, Ladle } from "@/components/icons/tea";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: LeafMark },
  { label: "Auctions", href: "/auctions", icon: CuppingBowl },
  { label: "My Bids", href: "/dashboard/buyer/bids", icon: Ladle },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile/me", icon: User },
] as const;

const UNREAD_COUNT = 2;

export function BottomNav() {
  const pathname = usePathname();

  // PRESERVED from review-fixes commit ae748f2: hide BottomNav on lot detail
  // pages so the sticky BidPanel has full bottom real-estate.
  const isLotDetail = /^\/auctions\/[^/]+$/.test(pathname);
  if (isLotDetail) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 h-16 bg-card border-t border-border md:hidden"
      aria-label="Primary"
    >
      <div className="flex h-full items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-[var(--color-ink-muted)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon size={22} className={cn(isActive && "scale-[1.05]")} />
                {tab.label === "Notifications" && UNREAD_COUNT > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-wax)] px-1 text-[10px] font-bold text-white">
                    {UNREAD_COUNT}
                  </span>
                )}
              </span>
              <span className="font-medium">{tab.label}</span>
              {/* Copper indicator bar under active tab */}
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 9.5: Build**

Run: `cd ~/Desktop/chaiblock && npx next build 2>&1 | tail -20`

Expected: "Compiled successfully", 14 routes, 3 dynamic, 11 static.

If it fails, the most likely issue is: an import from a primitive file that doesn't match the actual export name, or a stale cache. Clear `.next` and rebuild:
```bash
rm -rf .next && npx next build 2>&1 | tail -20
```

- [ ] **Step 9.6: Commit**

```bash
cd ~/Desktop/chaiblock
git add src/components/top-nav.tsx src/components/bottom-nav.tsx
git -c user.email="bashir@local" -c user.name="Bashir" commit -m "feat(fe1): rebuild TopNav + BottomNav with Wordmark, tea icons, primitives"
```

---

## Final Verification

- [ ] **Verify 1: Full build clean**

```bash
cd ~/Desktop/chaiblock && rm -rf .next && npx next build 2>&1 | tail -20
```

Expected: "Compiled successfully", 14 routes, 3 dynamic, 11 static. No TypeScript errors. No unused-import warnings beyond known-harmless ones.

- [ ] **Verify 2: Restart production server**

```bash
lsof -ti :3000 | xargs kill 2>/dev/null; sleep 1
cd ~/Desktop/chaiblock && npm run start &
sleep 3
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/auctions
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/auctions/lot1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/auctions/lot5
```

Expected: all 4 return `200`.

- [ ] **Verify 3: Check tunnel is live + serves new build**

Check which cloudflared process is running:
```bash
ps aux | grep "cloudflared tunnel" | grep -v grep | head -3
```

If the tunnel is running, get its URL from the background task output:
```bash
ls /private/tmp/claude-501/-Users-bashir/*/tasks/*.output 2>/dev/null | xargs grep -l "trycloudflare" 2>/dev/null | xargs -I {} sh -c 'grep -o "https://[a-z0-9-]*\.trycloudflare\.com" {} | head -1' 2>/dev/null | head -1
```

If the tunnel has died, restart it:
```bash
pkill -f "cloudflared tunnel" 2>/dev/null; sleep 1
cloudflared tunnel --url http://localhost:3000 --protocol http2 &
sleep 5
# Extract the new URL from output — report it to the user
```

Test: `curl -s -o /dev/null -w "%{http_code}\n" <tunnel-url>/`
Expected: `200`.

- [ ] **Verify 4: Manual visual walkthrough on the tunnel URL**

Open `<tunnel-url>/` in a browser:
- Body background is cream (`#F7F1E3`) with subtle paper-grain texture
- TopNav shows new Wordmark: `<LeafMark /> ShaiBlock شاي`
- Headings render in Fraunces (serif, slightly condensed, warm)
- Body copy renders in Inter
- `<select>` role switcher is GONE — replaced by a pill row "View as | Retailer | Wholesaler | Admin" with the active role as a wax-red chip
- Notification bell shows unread count as a wax-red Stamp
- Scroll down past 120px — TopNav collapses to thin bar with just LeafMark + pulsing live dot

Open `<tunnel-url>/auctions`:
- Lot cards render (unchanged visually, they'll inherit new colors but their structure is untouched)
- Prices flash emerald on new bids (still using `animate-flash-green`)
- Countdown colors still work (`animate-pulse-danger` preserved)

Open `<tunnel-url>/auctions/lot1`:
- BottomNav is HIDDEN (preserved `isLotDetail` logic)
- BidPanel still works (existing component, new tokens)

Open on mobile (375px width):
- BottomNav shows 5 tabs with tea icons: LeafMark / CuppingBowl / Ladle / Bell / User
- Active tab has copper indicator bar at bottom
- Notification tab still shows unread count badge

No hydration mismatch warnings in the devtools console. No 404s in Network tab.

- [ ] **Verify 5: Push to GitHub**

```bash
cd ~/Desktop/chaiblock && git push origin main 2>&1 | tail -5
```

Expected: `main -> main` push succeeds. 9 new commits land on `origin/main`.

---

## Post-completion

FE-1 is done. The app now has a cohesive tea-catalog visual language foundation. Future sub-projects (auction engine rebuild, landing rewrite, dashboard rebuild, illustrations, i18n, tea-type tinting) consume these tokens and primitives without reinventing anything.

**Next sub-project:** revise the auction engine spec + plan (`docs/superpowers/specs/2026-04-13-live-auction-engine-design.md` and `docs/superpowers/plans/2026-04-13-live-auction-engine.md`) to reference:
- New tokens: `bg-primary` is now darjeeling emerald, `bg-accent` is oolong copper, etc.
- `<LeafCountdown />` replaces the current `CountdownTimer`
- `<Stamp label="LOT 142" />` for lot number display
- `<BidConfirmationSheet />` uses `<Sheet>` primitive as its wrapper
- `<HammeredStamp />` uses `animate-stamp-land` keyframe + wax-noise texture
- `Button variant="primary" size="xl"` for bid actions instead of ad-hoc button styling

Then execute that revised plan.

**Deferred to later sub-projects:** tea-type tinting system (`<TeaTypeTheme>` context), 12 illustrations, sound + haptics, i18n JSON, dark mode "Night Cupping", cmd-K global search, screen rewrites beyond chrome.
