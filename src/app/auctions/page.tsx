import { getActiveLots } from "@/lib/mock-data";
import { AuctionFeedClient } from "./auction-feed-client";

// Force per-request rendering so lot countdown timestamps are always fresh.
// Without this, Next.js caches the page at build time and every lot shows
// frozen auction_end values — which become ENDED within minutes.
export const dynamic = "force-dynamic";

export default function AuctionsPage() {
  const lots = getActiveLots();

  return (
    <div className="pb-20">
      <AuctionFeedClient initialLots={lots} />
    </div>
  );
}
