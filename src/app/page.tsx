import { getActiveLots, getMarketTickerItems } from "@/lib/mock-data";
import { LandingClient } from "./landing-client";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const lots = getActiveLots().slice(0, 3);
  const tickerItems = getMarketTickerItems();

  return <LandingClient lots={lots} tickerItems={tickerItems} />;
}
