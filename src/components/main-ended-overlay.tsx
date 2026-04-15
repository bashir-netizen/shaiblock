"use client";

// ============================================================
// MainEndedOverlay — 1.5s transition banner between live and
// closing_round / pending_review. Pure presentation; the parent
// useAuctionClock controls how long it stays mounted.
// ============================================================

export function MainEndedOverlay() {
  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-accent/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="text-center px-6 animate-stamp-land">
        <p className="text-white/80 type-micro mb-2">Main auction closed</p>
        <h2 className="font-serif text-white text-4xl md:text-6xl font-bold leading-tight">
          Preparing closing round...
        </h2>
      </div>
    </div>
  );
}
