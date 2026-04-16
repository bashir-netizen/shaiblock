// ============================================================
// ShaiBlock investor demo video recorder — cinematic pass
// ============================================================
// Runs a scripted walkthrough of the live auction flow with
// title / end cards and visible click ripples, then writes a
// .webm video to demo-output/.
//
// Usage:
//   node scripts/record-demo.mjs
//
//   DEMO_URL=https://your-tunnel.trycloudflare.com \
//     node scripts/record-demo.mjs
//
// Convert the .webm to mp4 for slides / Twitter:
//   ffmpeg -i demo-output/<file>.webm -c:v libx264 -crf 20 \
//     -preset slow -pix_fmt yuv420p demo.mp4
// ============================================================

import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(REPO_ROOT, "demo-output");

const BASE = process.env.DEMO_URL ?? "http://localhost:3000";
const VIEWPORT = { width: 390, height: 844 }; // iPhone 14 Pro logical

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Smooth cubic-eased scroll — mouse.wheel is jerky and ruins the video vibe.
async function smoothScrollBy(page, dy, duration = 1400) {
  await page.evaluate(
    ({ dy, duration }) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const startTime = performance.now();
        function step(now) {
          const t = Math.min(1, (now - startTime) / duration);
          const eased =
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          window.scrollTo(0, start + dy * eased);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    { dy, duration }
  );
}

async function smoothScrollToTop(page, duration = 1100) {
  await page.evaluate(
    (duration) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        if (start === 0) return resolve();
        const startTime = performance.now();
        function step(now) {
          const t = Math.min(1, (now - startTime) / duration);
          const eased =
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          window.scrollTo(0, start * (1 - eased));
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    duration
  );
}

// ============================================================
// clickWithRipple — shows a gold pulse ripple at the click point
// just before the click fires. Gives the viewer a clear sense
// of cause-and-effect in a headless-cursor recording.
// ============================================================
async function clickWithRipple(page, locator) {
  const box = await locator.boundingBox();
  if (!box) {
    await locator.click();
    return;
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.evaluate(
    ({ cx, cy }) => {
      if (!document.getElementById("__demo_ripple_style")) {
        const style = document.createElement("style");
        style.id = "__demo_ripple_style";
        style.textContent = `
          @keyframes demoRipple {
            0%   { transform: translate(-50%, -50%) scale(0.35); opacity: 0.95; }
            60%  { opacity: 0.55; }
            100% { transform: translate(-50%, -50%) scale(2.4);  opacity: 0;    }
          }
          .__demo_ripple {
            position: fixed;
            width: 56px;
            height: 56px;
            border-radius: 9999px;
            border: 3px solid #D4A852;
            background: rgba(212, 168, 82, 0.22);
            box-shadow: 0 0 24px rgba(212, 168, 82, 0.55);
            pointer-events: none;
            z-index: 2147483647;
            animation: demoRipple 700ms ease-out forwards;
          }
        `;
        document.head.appendChild(style);
      }
      const el = document.createElement("div");
      el.className = "__demo_ripple";
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 900);
    },
    { cx, cy }
  );
  await wait(280); // let the ripple start blooming before the click lands
  try {
    await locator.click({ timeout: 5000 });
  } catch {
    // Live-price cards re-render under sim bidding and can fail the
    // stability check. Force-click as a fallback — the element is
    // visible (we already drew the ripple on it).
    await locator.click({ force: true });
  }
}

// ============================================================
// Title / end card HTML — rendered via page.setContent into a
// blank page. Dark tea-liquor background, fraunces-style serif
// title, amber lowercase tagline. Uses system serif fallback so
// there's no network dependency or flash-of-unstyled-text.
// ============================================================
function makeCardHtml({ title, tagline }) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        background: radial-gradient(ellipse at center, #2a1f15 0%, #160f08 75%);
        color: #f5efe3;
        font-family: "Fraunces", Georgia, "Times New Roman", serif;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .watermark {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 380px;
        color: rgba(212, 168, 82, 0.05);
        font-weight: 900;
        pointer-events: none;
        user-select: none;
        line-height: 1;
      }
      .card {
        position: relative;
        text-align: center;
        padding: 0 24px;
        opacity: 0;
        transform: translateY(12px);
        animation: fadeUp 650ms cubic-bezier(.2,.7,.25,1) 150ms forwards;
      }
      h1 {
        font-size: 72px;
        line-height: 1;
        margin: 0;
        font-weight: 700;
        letter-spacing: -2px;
        color: #f7f0e1;
        font-style: italic;
      }
      .divider {
        width: 48px;
        height: 2px;
        background: #D4A852;
        margin: 22px auto 18px;
        opacity: 0;
        transform: scaleX(0.2);
        transform-origin: center;
        animation: lineIn 500ms ease-out 550ms forwards;
      }
      .sub {
        font-family: Helvetica, Arial, sans-serif;
        font-size: 13px;
        letter-spacing: 3.5px;
        text-transform: uppercase;
        color: #D4A852;
        margin: 0;
        opacity: 0;
        animation: fadeIn 550ms ease-out 700ms forwards;
      }
      @keyframes fadeUp {
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes lineIn {
        to { opacity: 1; transform: scaleX(1); }
      }
      @keyframes fadeIn {
        to { opacity: 1; }
      }
    </style>
  </head>
  <body>
    <div class="watermark">شاي</div>
    <div class="card">
      <h1>${title}</h1>
      <div class="divider"></div>
      <p class="sub">${tagline}</p>
    </div>
  </body>
</html>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log(`▶ Recording demo against ${BASE}`);
  console.log(`▶ Output dir: ${OUT_DIR}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
      "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    colorScheme: "light",
    recordVideo: { dir: OUT_DIR, size: VIEWPORT },
  });

  const page = await context.newPage();

  // ─── Scene 0: Title card ──────────────────────────────
  console.log("▶ Scene 0: Title card");
  await page.setContent(
    makeCardHtml({
      title: "ShaiBlock",
      tagline: "Live tea auctions · direct to Sudan",
    }),
    { waitUntil: "domcontentloaded" }
  );
  await wait(2800); // let the fade-up + divider + tagline animations breathe

  // ─── Scene 1: Landing page (brand moment) ──────────────
  console.log("▶ Scene 1: Landing page");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await wait(2200); // let hero settle
  await smoothScrollBy(page, 500, 1300);
  await wait(900);
  await smoothScrollBy(page, -500, 1100); // back to top
  await wait(700);

  // ─── Scene 2: Click into the auction list ─────────────
  console.log("▶ Scene 2: Navigate to auctions");
  const browseCta = page
    .getByRole("link", { name: /Browse Live Auctions/i })
    .first();
  try {
    await browseCta.scrollIntoViewIfNeeded({ timeout: 2000 });
  } catch {}
  await wait(300);
  await clickWithRipple(page, browseCta);
  await page.waitForURL("**/auctions", { timeout: 10_000 });
  await wait(1200);
  await smoothScrollBy(page, 280, 1100);
  await wait(900);

  // ─── Scene 3: Open lot5 — starts a fresh 20s auction ──
  console.log("▶ Scene 3: Open lot5 (starts the 20s clock)");
  const lotLink = page.locator('a[href="/auctions/lot5"]').first();
  // Best-effort scroll — auction cards re-render live pricing, so
  // Playwright's stability check can fail. Click itself handles scroll.
  try {
    await lotLink.scrollIntoViewIfNeeded({ timeout: 2000 });
  } catch {}
  await wait(300);
  await clickWithRipple(page, lotLink);
  await page.waitForURL("**/auctions/lot5", { timeout: 10_000 });
  await wait(1400); // lot5 clock now at ~18.5s remaining

  // ─── Scene 4: Lot detail hero tour (~8s) ──────────────
  // Showcases the product's differentiated content: TCR scores,
  // CuppingRadar chart, tasting notes, seller card.
  console.log("▶ Scene 4: Lot detail hero tour");

  // Beat A — photo / title area
  await smoothScrollBy(page, 320, 1200);
  await wait(1200);

  // Beat B — reveal the Cupping Profile / radar chart.
  // Dead-reckoned scroll (not text-anchored) because the Live Bid Activity
  // section below keeps reflowing under aggressive sim bids, which breaks
  // scrollIntoViewIfNeeded's stability check.
  await smoothScrollBy(page, 380, 1200);
  await wait(2100); // linger on the radar — this is hero content

  // Beat C — continue down into tasting notes / seller preview
  await smoothScrollBy(page, 260, 1100);
  await wait(1500);

  // Beat D — smooth scroll back to top for the bid moment
  await smoothScrollToTop(page, 1200);
  await wait(500);

  // ─── Scene 5: Place a quick bid ─────────────────────────
  console.log("▶ Scene 5: Place a bid via the +$0.50 quick pill");
  const bidPill = page.getByRole("button", { name: "+$0.50" }).first();
  await bidPill.hover();
  await wait(400);
  await clickWithRipple(page, bidPill);
  await wait(2200); // "you're the high bidder" beat — watch flash-green play

  // ─── Scene 5b: Scroll to Live Bid Activity feed ────────
  // Viewer sees rival bidders sliding in with green highlights,
  // names, cities — the "aggressive bidding" moment.
  console.log("▶ Scene 5b: Scroll to Live Bid Activity");
  await page
    .getByText("Live Bid Activity")
    .first()
    .scrollIntoViewIfNeeded();
  await wait(4000); // let 3-5 sim bids slide in with green highlights

  // ─── Scene 5c: Smooth scroll back to top ───────────────
  console.log("▶ Scene 5c: Scroll back to top");
  await smoothScrollToTop(page, 1100);
  await wait(400);

  // ─── Scene 6: Main auction ends → "Preparing closing round" ─
  console.log("▶ Scene 6: Main auction ended overlay");
  await page
    .getByText(/Preparing closing round/i)
    .waitFor({ state: "visible", timeout: 90_000 });
  await wait(1600); // full 1.5s MainEndedOverlay beat

  // ─── Scene 6b: Seller is reviewing (pending_review phase) ──
  // Fires when the main auction's highest bid is below reserve.
  // lot5 reserve is $45/kg, so this branch always hits in the demo.
  console.log("▶ Scene 6b: Seller is reviewing");
  try {
    await page
      .getByText(/Seller is reviewing/i)
      .waitFor({ state: "visible", timeout: 4000 });
    await wait(3200); // let viewer see "Reviewing..." → "Approved closing round"
  } catch {
    console.log("  (reserve was met — skipping pending review dwell)");
  }

  // ─── Scene 7: Closing round — head-to-head tension ────
  console.log("▶ Scene 7: Closing round");
  await page
    .getByRole("dialog", { name: /Closing round/i })
    .waitFor({ state: "visible", timeout: 15_000 });
  await wait(5000); // tension beat — both columns, opponent name, breathing room

  // Raise button only enables when the opponent is ahead.
  // Wait up to 25s for the chance, ripple the click.
  try {
    const raiseBtn = page.getByRole("button", { name: /^Raise to \$/ });
    await raiseBtn.waitFor({ state: "visible", timeout: 25_000 });
    await raiseBtn.hover();
    await wait(800);
    await clickWithRipple(page, raiseBtn);
    console.log("  → raised");
    await wait(6000); // let more opponent exchanges play out post-raise
  } catch {
    console.log("  (investor winning the whole closing round — no raise)");
    await wait(6000);
  }

  // ─── Scene 8: Hammer stamp — SOLD ──────────────────────
  console.log("▶ Scene 8: Hammer stamp");
  await page
    .getByText("SOLD")
    .first()
    .waitFor({ state: "visible", timeout: 60_000 });
  await wait(6000); // long dwell — let the payoff breathe

  // ─── Scene 9: End card ────────────────────────────────
  console.log("▶ Scene 9: End card");
  await page.setContent(
    makeCardHtml({
      title: "ShaiBlock",
      tagline: "Sudan's direct tea marketplace",
    }),
    { waitUntil: "domcontentloaded" }
  );
  await wait(3000);

  // ─── Wrap up ───────────────────────────────────────────
  const videoPromise = page.video()?.path();
  await context.close();
  await browser.close();

  const videoPath = await videoPromise;
  if (videoPath) {
    console.log(`\n✓ Video written: ${videoPath}`);
    const stat = fs.statSync(videoPath);
    console.log(`  Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
  } else {
    console.log(`\n✓ Video written somewhere under ${OUT_DIR}/`);
  }
}

main().catch((err) => {
  console.error("\n✗ Demo recording failed:");
  console.error(err);
  process.exit(1);
});
