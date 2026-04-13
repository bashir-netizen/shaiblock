"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Mountain,
  Calendar,
  Leaf,
  Award,
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
import { formatKg, getCountryFlag, cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/price-display";
import { TEA_TYPES, HARVEST_SEASONS, PROCESSING_METHODS } from "@/lib/constants";
import { CuppingRadar } from "@/components/cupping-radar";
import { BidPanel } from "@/components/bid-panel";
import { BidHistory } from "@/components/bid-history";
import { SellerCard } from "@/components/seller-card";
import { getLotTCRPhotos } from "@/lib/photos";
import { useSimulatedBidding } from "@/hooks/use-simulated-bidding";

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
}

export function LotDetailClient({ lot, bids, seller }: LotDetailClientProps) {
  const teaType = TEA_TYPES.find((t) => t.value === lot.tea_type);
  const season = HARVEST_SEASONS.find((s) => s.value === lot.harvest_season);
  const processing = PROCESSING_METHODS.find(
    (p) => p.value === lot.processing_method
  );
  const initialHighBid = lot.current_high_bid || lot.starting_price_per_kg;

  // Live bid simulation — single source of truth
  const {
    bids: liveBids,
    currentHigh,
    newBidFlash,
    bidCount,
  } = useSimulatedBidding({
    lotId: lot.id,
    startingPrice: initialHighBid,
    bidIncrement: lot.bid_increment,
    maxPrice: lot.buy_now_price_per_kg
      ? lot.buy_now_price_per_kg * 0.95
      : initialHighBid * 3,
    initialBids: bids,
    enabled: true,
  });

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
    <div className="pb-40 md:pb-12 bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/60">
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

      <div className="max-w-7xl mx-auto md:px-6 md:py-6 md:grid md:grid-cols-5 md:gap-8">
        {/* LEFT COLUMN */}
        <div className="md:col-span-3 space-y-8">
          {/* Photo carousel — mobile */}
          <div className="md:hidden">
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
            >
              {PHOTO_SLOTS.map((slot) => (
                <div
                  key={slot.key}
                  className="snap-center shrink-0 w-full aspect-[4/3] relative"
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
            <div className="flex items-center justify-between px-4 py-3">
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

          {/* Photo grid — desktop */}
          <div className="hidden md:grid grid-cols-2 gap-3 rounded-2xl overflow-hidden">
            {PHOTO_SLOTS.map((slot) => (
              <div
                key={slot.key}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-card border border-border group"
              >
                <Image
                  src={photos[slot.key]}
                  alt={slot.label}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    {slot.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Title + origin */}
          <div className="px-4 md:px-0 space-y-3">
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight text-foreground">
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
              <p className="text-sm md:text-base text-muted leading-relaxed pt-1">
                {lot.description}
              </p>
            )}
          </div>

          {/* TEA CONDITION REPORT card */}
          <div className="mx-4 md:mx-0 border-2 border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm">
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                Tea Condition Report
              </p>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mt-1">
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

          {/* Seller card */}
          <div className="px-4 md:px-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-3">
              Verified Seller
            </p>
            <SellerCard seller={seller} />
          </div>

          {/* Lot info */}
          <div className="px-4 md:px-0">
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

          {/* Bid history — mobile only (desktop gets it in right col) */}
          <div className="px-4 md:hidden">
            <BidHistory bids={liveBids} max={8} />
          </div>
        </div>

        {/* RIGHT COLUMN — desktop: sticky bid panel + history */}
        <div className="hidden md:block md:col-span-2">
          <div className="sticky top-24 space-y-6">
            <BidPanel
              lot={lot}
              initialHighBid={initialHighBid}
              currentHigh={currentHigh}
              newBidFlash={newBidFlash}
              bidCount={bidCount}
            />
            <BidHistory bids={liveBids} max={8} />
          </div>
        </div>
      </div>

      {/* Mobile sticky bid panel */}
      <div className="md:hidden">
        <BidPanel
          lot={lot}
          initialHighBid={initialHighBid}
          currentHigh={currentHigh}
          newBidFlash={newBidFlash}
          bidCount={bidCount}
        />
      </div>

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
