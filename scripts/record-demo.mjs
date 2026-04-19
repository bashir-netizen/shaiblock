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
  await wait(2000);

  // ─── Scene 1: Landing page — scroll + return ──────────
  console.log("▶ Scene 1: Landing page");
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await wait(1600); // hero settle
  await smoothScrollBy(page, 600, 1100);
  await wait(600);
  await smoothScrollToTop(page, 900);
  await wait(300);

  // ─── Scene 2: Log in ──────────────────────────────────
  console.log("▶ Scene 2: Log in");
  const emailField = page.locator('input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const loginBtn = page.getByRole("button", { name: /^Log in$/i });

  await emailField.click();
  await emailField.type("abdirizakhassid@gmail.com", { delay: 30 });
  await wait(200);
  await passwordField.click();
  await passwordField.type("demo-access-2026", { delay: 25 });
  await wait(300);
  await clickWithRipple(page, loginBtn);
  await page.waitForURL("**/auctions", { timeout: 8000 });

  // ─── Scene 3: Auctions list ────────────────────────────
  console.log("▶ Scene 3: Auctions list");
  await wait(1100);
  await smoothScrollBy(page, 180, 900);
  await wait(700);

  // ─── Scene 4: Open lot5 (25s demo auction) ─────────────
  console.log("▶ Scene 4: Open lot5");
  const lotLink = page.locator('a[href="/auctions/lot5"]').first();
  try {
    await lotLink.scrollIntoViewIfNeeded({ timeout: 2000 });
  } catch {}
  await wait(200);
  await clickWithRipple(page, lotLink);
  await page.waitForURL("**/auctions/lot5", { timeout: 10_000 });
  await wait(700);

  // ─── Scene 5: Review lot in detail, then bid from Market Feed ──
  // Buyer workflow: Market Feed → Lot Details tab → review photos/TCR
  // → back to Market Feed → place bid. $48 is above the $45 reserve
  // (skips pending_review) but leaves the opponent AI room to catch up
  // in the 20s closing round, forcing a visible raise click.
  console.log("▶ Scene 5: Browse lot details + bid");

  await wait(600); // brief dwell on default Market Feed tab

  const detailsTab = page.getByRole("button", { name: "Lot Details" }).first();
  await clickWithRipple(page, detailsTab);
  await wait(400);

  await smoothScrollBy(page, 420, 1000);
  await wait(900);
  await smoothScrollBy(page, 280, 800);
  await wait(700);

  const feedTab = page.getByRole("button", { name: "Market Feed" }).first();
  await clickWithRipple(page, feedTab);
  await wait(350);
  await smoothScrollToTop(page, 600);
  await wait(250);

  // Wait until the main-round countdown drops to ≤3 seconds before
  // bidding. Sim bidders climb from currentHigh after every tick, so
  // any early investor bid gets leapfrogged within 2-4s. Bidding late
  // guarantees the investor is still top-1 when main_ended fires.
  await page.waitForFunction(
    () => {
      const el = document.querySelector(
        '.fixed.bottom-0 p.font-mono.tabular-nums'
      );
      if (!el || !el.textContent) return false;
      const m = el.textContent.match(/(\d+):(\d+)/);
      if (!m) return false;
      return parseInt(m[1]) * 60 + parseInt(m[2]) <= 3;
    },
    null,
    { timeout: 25_000, polling: 200 }
  );

  const chevron = page
    .locator('button[aria-label*="advanced bid options"]')
    .first();
  await clickWithRipple(page, chevron);
  await wait(250);

  const customInput = page
    .locator('input[aria-label="Custom bid amount per kilogram"]')
    .first();
  await customInput.click();
  // Bid $55 with <3s remaining in main round — sim bidders can't
  // respond in time, investor locks in top-1.
  await customInput.type("55", { delay: 60 });
  await wait(150);
  const placeBidBtn = page.getByRole("button", { name: /^PLACE BID$/ });
  await clickWithRipple(page, placeBidBtn);
  await wait(800);

  // ─── Scene 6: Main auction ends → "Preparing closing round" ─
  console.log("▶ Scene 6: Main auction ended overlay");
  await page
    .getByText(/Preparing closing round/i)
    .waitFor({ state: "visible", timeout: 90_000 });
  await wait(1200);

  // ─── Scene 7: Closing round — head-to-head tension ────
  console.log("▶ Scene 7: Closing round");
  await page
    .getByRole("dialog", { name: /Closing round/i })
    .waitFor({ state: "visible", timeout: 15_000 });
  await wait(3000);

  // Raise button only enables when the opponent is ahead. Give the
  // opponent AI 6s to try to catch up; if it can't, the investor is
  // already winning and we move on.
  try {
    const raiseBtn = page.getByRole("button", { name: /^Raise to \$/ });
    await raiseBtn.waitFor({ state: "visible", timeout: 6000 });
    await raiseBtn.hover();
    await wait(400);
    await clickWithRipple(page, raiseBtn);
    console.log("  → raised");
    await wait(2500);
  } catch {
    console.log("  (investor winning the whole closing round — no raise)");
    await wait(2000);
  }

  // ─── Scene 8: Hammer stamp — SOLD ──────────────────────
  console.log("▶ Scene 8: Hammer stamp");
  await page
    .getByText("SOLD")
    .first()
    .waitFor({ state: "visible", timeout: 60_000 });
  await wait(3500);

  // ─── Scene 9: End card ────────────────────────────────
  console.log("▶ Scene 9: End card");
  await page.setContent(
    makeCardHtml({
      title: "ShaiBlock",
      tagline: "Sudan's direct tea marketplace",
    }),
    { waitUntil: "domcontentloaded" }
  );
  await wait(1800);

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
