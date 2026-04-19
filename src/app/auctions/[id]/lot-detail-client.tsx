"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  FlaskConical,
  Star,
  Check,
  Quote,
  Eye,
} from "lucide-react";
import type { Lot, Bid, Profile } from "@/lib/types";
import { formatKg, formatPrice, getCountryFlag, cn } from "@/lib/utils";
import { useToast } from "@/components/toast-system";
import { PriceDisplay } from "@/components/price-display";
import { TEA_TYPES, HARVEST_SEASONS, PROCESSING_METHODS } from "@/lib/constants";
import { CuppingRadar } from "@/components/cupping-radar";
import { BidPanel } from "@/components/bid-panel";
import { BidHistory } from "@/components/bid-history";
import { MarketTicker } from "@/components/market-ticker";
import { PriceBand } from "@/components/price-band";
import { LotDetailTabs } from "@/components/lot-detail-tabs";
import { MarketFeed } from "@/components/market-feed";
import { SellerCard } from "@/components/seller-card";
import type { TickerItem } from "@/lib/types";
import { getLotTCRPhotos } from "@/lib/photos";
import { useSimulatedBidding } from "@/hooks/use-simulated-bidding";
import { useAuctionClock, computeTopTwo } from "@/hooks/use-auction-clock";
import { MainEndedOverlay } from "@/components/main-ended-overlay";
import { PendingReviewSheet } from "@/components/pending-review-sheet";
import { ClosingRoundSheet } from "@/components/closing-round-sheet";
import { HammeredStamp } from "@/components/hammered-stamp";

const PHOTO_SLOTS = [
  { key: "dry" as const, label: "Dry Leaf" },
  { key: "wet" as const, label: "Wet Leaf" },
  { key: "liquor" as const, label: "Liquor" },
  { key: "packaging" as const, label: "Packaging" },
];

interface LotDetailClientProps {
  lot: Lot;
  bids: Bid[];
  seller: Profile;
  soldLots: Lot[];
  tickerItems: TickerItem[];
}

export function LotDetailClient({ lot, bids, seller, soldLots, tickerItems }: LotDetailClientProps) {
  const teaType = TEA_TYPES.find((t) => t.value === lot.tea_type);
  const season = HARVEST_SEASONS.find((s) => s.value === lot.harvest_season);
  const processing = PROCESSING_METHODS.find(
    (p) => p.value === lot.processing_method
  );
  const initialHighBid = lot.current_high_bid || lot.starting_price_per_kg;

  // Phase state machine — drives the closing round flow
  const clock = useAuctionClock({ lot });

  // Live bid simulation — single source of truth. Sim bidders STOP when
  // clock.phase leaves 'live' so useAuctionClock's opponent AI takes over
  // for the closing round.
  const {
    bids: liveBids,
    currentHigh,
    newBidFlash,
    investorIsHighest,
    placeInvestorBid,
  } = useSimulatedBidding({
    lotId: lot.id,
    startingPrice: initialHighBid,
    bidIncrement: lot.bid_increment,
    maxPrice: lot.buy_now_price_per_kg
      ? lot.buy_now_price_per_kg * 0.95
      : initialHighBid * 3,
    initialBids: bids,
    enabled: true,
    phase: clock.phase,
  });

  // When main auction ends, snapshot the top two bidders so the
  // closing round knows who's fighting. Spec §3.3 data flow pattern.
  useEffect(() => {
    if (clock.phase === "main_ended" && !clock.topTwo) {
      clock.setTopTwo(computeTopTwo(liveBids, lot));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.phase]);

  // Single source of truth for outbid toasts. BidPanel used to own this
  // effect, which caused duplicate toasts when there were ever multiple
  // panel instances mounted; hoisting to the parent keeps it to one toast
  // per outbid regardless of layout changes.
  const { showToast } = useToast();
  const prevHighRef = useRef<number>(initialHighBid);
  const outbidMountedRef = useRef(false);
  const lastOutbidToastRef = useRef<number>(0);
  useEffect(() => {
    if (!outbidMountedRef.current) {
      outbidMountedRef.current = true;
      prevHighRef.current = currentHigh;
      return;
    }
    if (currentHigh !== prevHighRef.current) {
      if (!investorIsHighest) {
        const now = Date.now();
        if (now - lastOutbidToastRef.current > 5000) {
          lastOutbidToastRef.current = now;
          showToast({
            type: "outbid",
            title: "You've been outbid!",
            body: `New high bid: ${formatPrice(currentHigh)}/kg`,
          });
        }
      }
      prevHighRef.current = currentHigh;
    }
  }, [currentHigh, investorIsHighest, showToast]);

  // Photo carousel
  const photos = getLotTCRPhotos(lot.id);
  const [activePhoto, setActivePhoto] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== activePhoto) setActivePhoto(idx);
  };

  // Derived strings
  const harvestLabel = lot.harvest_date
    ? new Date(lot.harvest_date).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : undefined;

  const cuppedByLabel = lot.cupped_by || seller.company_name || seller.display_name;

  return (
    <div className="pb-[112px] bg-background">
      {/* ── Live auction engine phase overlays ── */}
      {clock.phase === "main_ended" && <MainEndedOverlay />}
      {clock.phase === "pending_review" && (
        <PendingReviewSheet
          seller={seller}
          highestBidUSD={clock.topTwo?.[0]?.amount_per_kg ?? currentHigh}
          reserveUSD={lot.reserve_price_per_kg}
        />
      )}
      {clock.phase === "closing_round" && clock.topTwo && (
        <ClosingRoundSheet
          lot={lot}
          topTwo={clock.topTwo}
          closingRoundBids={clock.closingRoundBids}
          msRemaining={clock.msRemaining}
          extendedCount={clock.extendedCount}
          onPlaceBid={clock.placeClosingRoundBid}
          onConcede={clock.concede}
        />
      )}
      {clock.phase === "hammered" && clock.winner && (
        <HammeredStamp
          winnerName={clock.winner.buyer_display_name}
          winnerCity={clock.winner.buyer_city}
          pricePerKgUSD={clock.winner.amount_per_kg}
          totalKg={lot.total_kg}
          isInvestor={clock.winner.is_investor === true}
        />
      )}

      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/auctions"
            className="p-2 rounded-lg hover:bg-border/40 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">
              Lot
            </p>
            <p className="text-sm font-mono font-bold text-foreground">
              {lot.lot_number}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <Eye className="w-3.5 h-3.5" />
            <span>{lot.view_count}</span>
          </div>
        </div>
      </div>

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

      <div className="max-w-5xl mx-auto">
          <LotDetailTabs
            marketFeedContent={
              <div>
                <BidHistory bids={liveBids} max={8} />
                <MarketFeed soldLots={soldLots} />
              </div>
            }
            lotDetailsContent={
              <div className="space-y-6 px-4 py-4">
                {/* Photo carousel */}
                <div>
                  <div
                    ref={carouselRef}
                    onScroll={handleScroll}
                    className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar -mx-4"
                  >
                    {PHOTO_SLOTS.map((slot) => (
                      <div
                        key={slot.key}
                        className="snap-center shrink-0 w-full aspect-[16/10] relative"
                      >
                        <Image
                          src={photos[slot.key]}
                          alt={slot.label}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          priority={slot.key === "dry"}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <p className="text-xs font-semibold text-muted uppercase tracking-widest">
                      {PHOTO_SLOTS[activePhoto]?.label}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {PHOTO_SLOTS.map((_, i) => (
                        <span
                          key={i}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            i === activePhoto ? "w-6 bg-primary" : "w-1.5 bg-border"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Title + origin */}
                <div className="space-y-3">
                  <h1 className="font-serif text-3xl font-bold leading-tight text-foreground">
                    {lot.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="text-lg">{getCountryFlag(lot.origin_country)}</span>
                      <span className="font-semibold text-foreground">
                        {lot.origin_country}
                      </span>
                    </span>
                    {lot.origin_region && (
                      <>
                        <span className="text-border">|</span>
                        <span>{lot.origin_region}</span>
                      </>
                    )}
                    {lot.estate_name && (
                      <>
                        <span className="text-border">|</span>
                        <span className="italic">{lot.estate_name}</span>
                      </>
                    )}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-accent text-white rounded-full px-3 py-1 text-sm font-semibold shadow-sm shadow-accent/20">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      {lot.cupping.overall.toFixed(1)}/10 Cupping
                    </span>
                  </div>
                  {lot.description && (
                    <p className="text-sm text-muted leading-relaxed pt-1">
                      {lot.description}
                    </p>
                  )}
                </div>

                {/* Seller card */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                    Verified Seller
                  </p>
                  <SellerCard seller={seller} />
                </div>

                {/* Lot info */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
                    Lot Details
                  </p>
                  <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-5">
                    <InfoRow
                      icon={<Package className="w-4 h-4" />}
                      label="Available"
                      value={formatKg(lot.total_kg)}
                    />
                    <InfoRow
                      icon={<Package className="w-4 h-4" />}
                      label="Min purchase"
                      value={formatKg(lot.min_purchase_kg)}
                    />
                    {lot.ships_from_city && (
                      <InfoRow
                        icon={<MapPin className="w-4 h-4" />}
                        label="Ships from"
                        value={`${lot.ships_from_city} ${getCountryFlag(lot.ships_from_country || "")}`}
                      />
                    )}
                    {lot.estimated_ship_days && (
                      <InfoRow
                        icon={<Clock className="w-4 h-4" />}
                        label="Est. delivery"
                        value={`${lot.estimated_ship_days} days`}
                      />
                    )}
                    <div className="col-span-2 flex items-center justify-between border-t border-border pt-4 mt-1">
                      <div className="flex items-start gap-2 text-sm">
                        <FlaskConical className="w-4 h-4 text-muted mt-0.5" />
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted font-semibold mb-0.5">
                            Sample price
                          </p>
                          {lot.sample_available && lot.sample_price ? (
                            <PriceDisplay amountUSD={lot.sample_price} size="sm" />
                          ) : (
                            <p className="font-semibold text-foreground">
                              Not available
                            </p>
                          )}
                        </div>
                      </div>
                      {lot.sample_available && (
                        <button className="rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
                          Request Sample
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            }
            cuppingContent={
              <div className="px-4 py-6">
                {/* TCR card */}
                <div className="border-2 border-border rounded-2xl p-6 bg-card shadow-sm">
                  <div className="mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                      Tea Condition Report
                    </p>
                    <h2 className="font-serif text-2xl font-bold text-foreground mt-1">
                      Verified by {cuppedByLabel}
                    </h2>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    <TcrField
                      label="Type"
                      value={`${teaType?.emoji || ""} ${teaType?.label || lot.tea_type}`}
                    />
                    <TcrField label="Grade" value={lot.grade} />
                    {harvestLabel && <TcrField label="Harvest" value={harvestLabel} />}
                    {season && <TcrField label="Season" value={season.label} />}
                    {lot.elevation_meters && (
                      <TcrField
                        label="Elevation"
                        value={`${lot.elevation_meters.toLocaleString()}m`}
                      />
                    )}
                    {processing && (
                      <TcrField label="Processing" value={processing.label} />
                    )}
                  </div>

                  {/* Certifications */}
                  {lot.certifications.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {lot.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground"
                        >
                          <Check className="w-3.5 h-3.5 text-success" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Radar */}
                  <div className="mt-8 pt-6 border-t border-border/60">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted text-center mb-4">
                      Cupping Profile
                    </p>
                    <div className="flex justify-center">
                      <CuppingRadar scores={lot.cupping} size="lg" />
                    </div>
                  </div>

                  {/* Tasting notes */}
                  {lot.cupping_notes && (
                    <div className="mt-8 bg-primary/5 rounded-xl p-6 relative">
                      <Quote className="absolute top-4 left-4 w-6 h-6 text-primary/30" />
                      <p className="font-serif italic text-xl text-foreground leading-relaxed pl-8">
                        &ldquo;{lot.cupping_notes}&rdquo;
                      </p>
                      <p className="mt-4 text-xs text-muted font-semibold uppercase tracking-widest pl-8">
                        — {cuppedByLabel}
                        {lot.cupping_date && `, ${lot.cupping_date}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            }
          />
      </div>

      {/* Pinned bid panel — always-expanded compact layout */}
      <BidPanel
        lot={lot}
        currentHigh={currentHigh}
        newBidFlash={newBidFlash}
        onPlaceInvestorBid={placeInvestorBid}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function TcrField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="text-foreground font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted font-semibold">
          {label}
        </p>
        <p className="font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
