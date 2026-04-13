import { getActiveLots } from "@/lib/mock-data";
import { AuctionFeedClient } from "./auction-feed-client";

export default function AuctionsPage() {
  const lots = getActiveLots();

  return (
    <div className="pb-20">
      <AuctionFeedClient initialLots={lots} />
    </div>
  );
}
