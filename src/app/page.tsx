import { getActiveLots, getMarketTickerItems } from "@/lib/mock-data";
import { LandingClient } from "./landing-client";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const activeLots = getActiveLots();
  const liveCount = activeLots.length;
  const originCount = new Set(activeLots.map((l) => l.origin_country)).size;
  const lots = activeLots.slice(0, 3);
  const tickerItems = getMarketTickerItems();

  return (
    <LandingClient
      lots={lots}
      tickerItems={tickerItems}
      liveCount={liveCount}
      originCount={originCount}
    />
  );
}
