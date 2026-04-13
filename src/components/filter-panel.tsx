"use client";

import { X } from "lucide-react";
import { TEA_TYPES, ORIGIN_COUNTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface Filters {
  teaTypes: string[];
  origins: string[];
  hasBuyNow: boolean;
  endingWithin: string;
  minPrice: string;
  maxPrice: string;
  minCuppingScore: string;
}

export const defaultFilters: Filters = {
  teaTypes: [],
  origins: [],
  hasBuyNow: false,
  endingWithin: "any",
  minPrice: "",
  maxPrice: "",
  minCuppingScore: "",
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const ENDING_OPTIONS = [
  { value: "15m", label: "15 min" },
  { value: "1h", label: "1 hour" },
  { value: "6h", label: "6 hours" },
  { value: "24h", label: "24 hours" },
  { value: "any", label: "Any" },
];

const TOP_ORIGINS = ORIGIN_COUNTRIES.slice(0, 6);

export function FilterPanel({ isOpen, onClose, filters, onFilterChange }: FilterPanelProps) {
  const toggleTeaType = (value: string) => {
    const next = filters.teaTypes.includes(value)
      ? filters.teaTypes.filter((t) => t !== value)
      : [...filters.teaTypes, value];
    onFilterChange({ ...filters, teaTypes: next });
  };

  const toggleOrigin = (code: string) => {
    const next = filters.origins.includes(code)
      ? filters.origins.filter((o) => o !== code)
      : [...filters.origins, code];
    onFilterChange({ ...filters, origins: next });
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-80 bg-card z-50 shadow-2xl transform transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-border/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Tea Type */}
          <section>
            <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Tea Type</h3>
            <div className="flex flex-wrap gap-2">
              {TEA_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleTeaType(t.value)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-colors",
                    filters.teaTypes.includes(t.value)
                      ? "bg-primary text-white border-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  )}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* Origin */}
          <section>
            <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Origin</h3>
            <div className="flex flex-wrap gap-2">
              {TOP_ORIGINS.map((o) => (
                <button
                  key={o.code}
                  onClick={() => toggleOrigin(o.code)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-full border transition-colors",
                    filters.origins.includes(o.code)
                      ? "bg-primary text-white border-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  )}
                >
                  {o.flag} {o.name}
                </button>
              ))}
            </div>
          </section>

          {/* Has Buy Now */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Has Buy Now</h3>
              <button
                onClick={() => onFilterChange({ ...filters, hasBuyNow: !filters.hasBuyNow })}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors",
                  filters.hasBuyNow ? "bg-primary" : "bg-border"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                    filters.hasBuyNow && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </section>

          {/* Ending Within */}
          <section>
            <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Ending Within</h3>
            <div className="space-y-1.5">
              {ENDING_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
                      filters.endingWithin === opt.value
                        ? "border-primary"
                        : "border-border"
                    )}
                  >
                    {filters.endingWithin === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Price Range */}
          <section>
            <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Price Range ($/kg)</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-muted">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </section>

          {/* Min Cupping Score */}
          <section>
            <h3 className="text-sm font-semibold text-muted mb-2 uppercase tracking-wide">Min Cupping Score</h3>
            <input
              type="number"
              min={0}
              max={10}
              step={0.5}
              placeholder="e.g. 7.0"
              value={filters.minCuppingScore}
              onChange={(e) => onFilterChange({ ...filters, minCuppingScore: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={() => onFilterChange(defaultFilters)}
            className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-border/30 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
