"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Gavel, Heart, Search, SlidersHorizontal, Trophy } from "lucide-react";
import type { Lot } from "@/lib/types";
import { cn, formatPrice, getTimeRemaining } from "@/lib/utils";
import { AuctionCard } from "@/components/auction-card";
import { FilterPanel, defaultFilters, type Filters } from "@/components/filter-panel";
import { ORIGIN_COUNTRIES, TEA_TYPES } from "@/lib/constants";
import { useLiveActivityFeed, type LiveActivityEvent } from "@/hooks/use-simulated-bidding";

type SortOption =
  | "ending_soonest"
  | "just_listed"
  | "price_low"
  | "price_high"
  | "cupping_score"
  | "most_bids";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "ending_soonest", label: "Ending Soonest" },
  { value: "just_listed", label: "Just Listed" },
  { value: "price_low", label: "Price Low-High" },
  { value: "price_high", label: "Price High-Low" },
  { value: "cupping_score", label: "Cupping Score" },
  { value: "most_bids", label: "Most Bids" },
];

const QUICK_CHIPS = [
  { key: "all", label: "All" },
  ...TEA_TYPES.filter((t) =>
    ["black", "green", "oolong", "white", "pu_erh"].includes(t.value)
  ).map((t) => ({ key: `tea_${t.value}`, label: t.label })),
  ...ORIGIN_COUNTRIES.filter((c) => ["KE", "IN", "CN"].includes(c.code)).map(
    (c) => ({ key: `origin_${c.code}`, label: c.name })
  ),
  { key: "buy_now", label: "Buy Now" },
  { key: "ending_soon", label: "Ending Soon" },
];

interface AuctionFeedClientProps {
  initialLots: Lot[];
}

function ActivityIcon({ action }: { action: LiveActivityEvent["action"] }) {
  if (action === "won") return <Trophy className="h-3.5 w-3.5 text-accent" />;
  if (action === "watched") return <Heart className="h-3.5 w-3.5 text-danger" />;
  return <Gavel className="h-3.5 w-3.5 text-primary" />;
}

function LiveActivityBar({ lotTitles }: { lotTitles: string[] }) {
  const events = useLiveActivityFeed(lotTitles, true);

  // Duplicate the events so the marquee loops seamlessly
  const loop = [...events, ...events];

  return (
    <div className="relative overflow-hidden border-y border-border bg-card/60 backdrop-blur">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />

      <div className="flex items-center gap-2 py-2">
        <div className="shrink-0 pl-4 pr-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-danger">
          <span className="w-1.5 h-1.5 bg-danger rounded-full animate-pulse" />
          Live
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-6 whitespace-nowrap animate-[scroll_45s_linear_infinite]">
            {loop.map((event, idx) => (
              <div
                key={`${event.id}-${idx}`}
                className="flex items-center gap-2 text-xs text-foreground/80 shrink-0"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-[10px] font-bold text-primary">
                  {event.buyer_name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <ActivityIcon action={event.action} />
                <span className="font-medium text-foreground">
                  {event.buyer_name}
                </span>
                <span className="text-muted">from {event.buyer_city}</span>
                <span className="text-muted">
                  {event.action === "watched"
                    ? "is watching"
                    : event.action === "won"
                    ? "won"
                    : "bid"}
                </span>
                {event.amount != null && (
                  <span className="font-mono tabular-nums font-semibold text-primary">
                    {formatPrice(event.amount)}
                  </span>
                )}
                <span className="text-muted">on</span>
                <span className="font-medium text-foreground max-w-[220px] truncate">
                  {event.lot_title}
                </span>
                <span className="text-muted">· just now</span>
                <span className="text-border">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export function AuctionFeedClient({ initialLots }: AuctionFeedClientProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("ending_soonest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [activeChip, setActiveChip] = useState("all");

  const lotTitles = useMemo(() => initialLots.map((l) => l.title), [initialLots]);

  const handleChipClick = (key: string) => {
    setActiveChip(key);
    if (key === "all") {
      setFilters(defaultFilters);
      return;
    }
    if (key === "buy_now") {
      setFilters({ ...defaultFilters, hasBuyNow: true });
      return;
    }
    if (key === "ending_soon") {
      setFilters({ ...defaultFilters, endingWithin: "1h" });
      return;
    }
    if (key.startsWith("tea_")) {
      setFilters({ ...defaultFilters, teaTypes: [key.replace("tea_", "")] });
      return;
    }
    if (key.startsWith("origin_")) {
      setFilters({ ...defaultFilters, origins: [key.replace("origin_", "")] });
      return;
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...initialLots];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.origin_country.toLowerCase().includes(q) ||
          l.origin_region?.toLowerCase().includes(q) ||
          l.estate_name?.toLowerCase().includes(q) ||
          l.lot_number.toLowerCase().includes(q)
      );
    }

    // Tea type filter
    if (filters.teaTypes.length > 0) {
      result = result.filter((l) => filters.teaTypes.includes(l.tea_type));
    }

    // Origin filter
    if (filters.origins.length > 0) {
      result = result.filter((l) => filters.origins.includes(l.origin_country));
    }

    // Buy now filter
    if (filters.hasBuyNow) {
      result = result.filter((l) => l.buy_now_price_per_kg != null);
    }

    // Ending within filter
    if (filters.endingWithin !== "any") {
      const minutesMap: Record<string, number> = {
        "15m": 15,
        "1h": 60,
        "6h": 360,
        "24h": 1440,
      };
      const maxMinutes = minutesMap[filters.endingWithin] || Infinity;
      result = result.filter((l) => {
        const { total } = getTimeRemaining(l.auction_end);
        return total / 1000 / 60 <= maxMinutes;
      });
    }

    // Price range
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      result = result.filter(
        (l) => (l.current_high_bid || l.starting_price_per_kg) >= min
      );
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      result = result.filter(
        (l) => (l.current_high_bid || l.starting_price_per_kg) <= max
      );
    }

    // Min cupping score
    if (filters.minCuppingScore) {
      const min = parseFloat(filters.minCuppingScore);
      result = result.filter((l) => l.cupping.overall >= min);
    }

    // Sort
    switch (sort) {
      case "ending_soonest":
        result.sort(
          (a, b) =>
            new Date(a.auction_end).getTime() - new Date(b.auction_end).getTime()
        );
        break;
      case "just_listed":
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "price_low":
        result.sort(
          (a, b) =>
            (a.current_high_bid || a.starting_price_per_kg) -
            (b.current_high_bid || b.starting_price_per_kg)
        );
        break;
      case "price_high":
        result.sort(
          (a, b) =>
            (b.current_high_bid || b.starting_price_per_kg) -
            (a.current_high_bid || a.starting_price_per_kg)
        );
        break;
      case "cupping_score":
        result.sort((a, b) => b.cupping.overall - a.cupping.overall);
        break;
      case "most_bids":
        result.sort((a, b) => b.bid_count - a.bid_count);
        break;
    }

    return result;
  }, [initialLots, search, sort, filters]);

  // Semi-dynamic "X bids in the last minute" — pulses from a base by mod of lot count
  const bidsLastMinute = 42 + (initialLots.length % 7) * 3;

  return (
    <>
      {/* Live activity ticker */}
      <LiveActivityBar lotTitles={lotTitles} />

      {/* Section header */}
      <div className="px-4 pt-8 pb-4">
        <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
          LIVE AUCTIONS
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {initialLots.length} lots
            </span>{" "}
            live right now ·{" "}
            <span className="font-semibold text-foreground">
              {bidsLastMinute} bids
            </span>{" "}
            in the last minute
          </span>
        </div>
      </div>

      {/* Search + Filter + Sort bar */}
      <div className="px-4 flex items-center gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search lots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
          />
        </div>

        <button
          onClick={() => setFilterOpen(true)}
          className="p-2.5 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 transition-colors relative"
        >
          <SlidersHorizontal className="w-5 h-5" />
          {(filters.teaTypes.length > 0 ||
            filters.origins.length > 0 ||
            filters.hasBuyNow ||
            filters.endingWithin !== "any" ||
            filters.minPrice ||
            filters.maxPrice ||
            filters.minCuppingScore) && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent" />
          )}
        </button>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border bg-card text-sm hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:shadow-lg transition-all"
          >
            <span className="hidden sm:inline font-medium">
              {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                sortOpen && "rotate-180"
              )}
            />
          </button>
          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl z-20 py-1.5 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-primary/5 transition-colors",
                      sort === opt.value && "text-primary font-semibold bg-primary/5"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick filter chips */}
      <div className="px-4 mb-4 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => handleChipClick(chip.key)}
              className={cn(
                "whitespace-nowrap min-h-10 px-4 py-2.5 rounded-full text-sm font-medium transition-all shrink-0",
                activeChip === chip.key
                  ? "bg-primary text-white border border-primary shadow-md"
                  : "bg-card border border-border text-foreground hover:border-primary hover:shadow-sm"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-4 mb-3">
        <p className="text-sm text-muted">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredAndSorted.length}
          </span>{" "}
          live auction{filteredAndSorted.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAndSorted.map((lot) => (
          <AuctionCard key={lot.id} lot={lot} />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-lg">No auctions match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Filter panel */}
      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
      />
    </>
  );
}
