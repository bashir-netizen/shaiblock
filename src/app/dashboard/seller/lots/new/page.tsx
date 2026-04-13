"use client";

import { useState } from "react";
import {
  TEA_TYPES,
  GRADES,
  ORIGIN_COUNTRIES,
  HARVEST_SEASONS,
  PROCESSING_METHODS,
  CERTIFICATIONS,
  CUPPING_DIMENSIONS,
  AUCTION_DURATIONS,
  BID_INCREMENTS,
} from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

const STEPS = [
  "Identity",
  "Photos",
  "Cupping",
  "Pricing",
  "Shipping",
  "Review",
] as const;

const PHOTO_SLOTS = [
  { key: "dry_leaf", label: "Dry Leaf", required: true, guidance: "Close-up of dry tea leaves on a neutral background" },
  { key: "wet_leaf", label: "Wet Leaf", required: true, guidance: "Infused leaves spread out after brewing" },
  { key: "liquor", label: "Liquor", required: true, guidance: "Brewed tea in a white cupping bowl" },
  { key: "packaging", label: "Packaging", required: true, guidance: "Sealed bag or container with label visible" },
  { key: "optional_1", label: "Additional 1", required: false, guidance: "Estate, garden, or processing" },
  { key: "optional_2", label: "Additional 2", required: false, guidance: "Additional angle or detail" },
  { key: "optional_3", label: "Additional 3", required: false, guidance: "Additional angle or detail" },
  { key: "optional_4", label: "Additional 4", required: false, guidance: "Additional angle or detail" },
];

interface FormData {
  tea_type: string;
  grade: string;
  title: string;
  origin_country: string;
  origin_region: string;
  estate_name: string;
  harvest_date: string;
  harvest_season: string;
  processing_method: string;
  elevation: string;
  description: string;
  certifications: string[];
  photos: Record<string, boolean>;
  cupping: Record<string, number>;
  cupping_notes: string;
  cupped_by: string;
  cupping_date: string;
  total_kg: string;
  min_purchase_kg: string;
  starting_price: string;
  reserve_price: string;
  buy_now_enabled: boolean;
  buy_now_price: string;
  bid_increment: number;
  duration: number;
  ships_from_country: string;
  ships_from_city: string;
  est_delivery_days: string;
  sample_available: boolean;
  sample_price: string;
}

const initialForm: FormData = {
  tea_type: "",
  grade: "",
  title: "",
  origin_country: "",
  origin_region: "",
  estate_name: "",
  harvest_date: "",
  harvest_season: "",
  processing_method: "",
  elevation: "",
  description: "",
  certifications: [],
  photos: {},
  cupping: { aroma: 5, body: 5, color: 5, briskness: 5, flavor: 5, finish: 5 },
  cupping_notes: "",
  cupped_by: "",
  cupping_date: "",
  total_kg: "",
  min_purchase_kg: "",
  starting_price: "",
  reserve_price: "",
  buy_now_enabled: false,
  buy_now_price: "",
  bid_increment: 0.1,
  duration: 45,
  ships_from_country: "",
  ships_from_city: "",
  est_delivery_days: "",
  sample_available: false,
  sample_price: "",
};

export default function NewLotPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [showReserveTooltip, setShowReserveTooltip] = useState(false);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCert = (cert: string) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const setCupping = (key: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      cupping: { ...prev.cupping, [key]: value },
    }));
  };

  const cuppingOverall =
    CUPPING_DIMENSIONS.reduce(
      (sum, d) => sum + (form.cupping[d.key] ?? 0),
      0
    ) / CUPPING_DIMENSIONS.length;

  const getCountryName = (code: string) =>
    ORIGIN_COUNTRIES.find((c) => c.code === code)?.name ?? code;

  const getTeaLabel = (val: string) =>
    TEA_TYPES.find((t) => t.value === val)?.label ?? val;

  const getSeasonLabel = (val: string) =>
    HARVEST_SEASONS.find((s) => s.value === val)?.label ?? val;

  const getMethodLabel = (val: string) =>
    PROCESSING_METHODS.find((m) => m.value === val)?.label ?? val;

  // ── Step Indicator ──
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((label, i) => {
        const num = i + 1;
        const isCurrent = num === step;
        const isDone = num < step;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isDone
                    ? "bg-primary/20 text-primary"
                    : "bg-border text-muted"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : num}
              </div>
              <span
                className={`text-xs mt-1.5 ${
                  isCurrent ? "text-primary font-semibold" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-10 h-0.5 mx-1 mt-[-1rem] ${
                  isDone ? "bg-primary/40" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Shared input styles ──
  const inputCls =
    "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
  const labelCls = "block text-sm font-medium mb-1.5";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-bold mb-2">
        Create New Lot
      </h1>
      <p className="text-muted text-sm mb-8">
        Tea Condition Report &mdash; Step {step} of {STEPS.length}
      </p>

      <StepIndicator />

      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        {/* ================================================================
            STEP 1 — Identity
        ================================================================ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className={labelCls}>Tea Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TEA_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => update("tea_type", t.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-sm transition-colors ${
                      form.tea_type === t.value
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Grade</label>
                <select
                  value={form.grade}
                  onChange={(e) => update("grade", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select grade</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Title</label>
                <input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Kericho Gold GFBOP - March 2026"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Origin Country</label>
                <select
                  value={form.origin_country}
                  onChange={(e) => update("origin_country", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select country</option>
                  {ORIGIN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Region</label>
                <input
                  value={form.origin_region}
                  onChange={(e) => update("origin_region", e.target.value)}
                  placeholder="e.g. Kericho, Darjeeling"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Estate / Garden</label>
                <input
                  value={form.estate_name}
                  onChange={(e) => update("estate_name", e.target.value)}
                  placeholder="e.g. Kipkelion Estate"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Harvest Date</label>
                <input
                  type="date"
                  value={form.harvest_date}
                  onChange={(e) => update("harvest_date", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Harvest Season</label>
              <div className="flex flex-wrap gap-3">
                {HARVEST_SEASONS.map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      form.harvest_season === s.value
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="season"
                      value={s.value}
                      checked={form.harvest_season === s.value}
                      onChange={() => update("harvest_season", s.value)}
                      className="sr-only"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Processing Method</label>
              <div className="flex flex-wrap gap-3">
                {PROCESSING_METHODS.map((m) => (
                  <label
                    key={m.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      form.processing_method === m.value
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="method"
                      value={m.value}
                      checked={form.processing_method === m.value}
                      onChange={() => update("processing_method", m.value)}
                      className="sr-only"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Elevation (meters)</label>
              <input
                type="number"
                value={form.elevation}
                onChange={(e) => update("elevation", e.target.value)}
                placeholder="e.g. 2100"
                className={`${inputCls} max-w-xs`}
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                placeholder="Describe the tea's character, terroir, and ideal use..."
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Certifications</label>
              <div className="flex flex-wrap gap-2">
                {CERTIFICATIONS.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      form.certifications.includes(cert)
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted border-border hover:border-primary/40"
                    }`}
                  >
                    {form.certifications.includes(cert) && (
                      <Check className="h-3 w-3 inline mr-1" />
                    )}
                    {cert}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            STEP 2 — Photos
        ================================================================ */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-muted">
              Upload photos for your Tea Condition Report. The first 4 are
              mandatory.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {PHOTO_SLOTS.map((slot) => {
                const uploaded = form.photos[slot.key];
                return (
                  <button
                    key={slot.key}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        photos: { ...prev.photos, [slot.key]: true },
                      }));
                      alert("Photo uploaded!");
                    }}
                    className={`relative flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed transition-colors ${
                      uploaded
                        ? "border-success bg-success/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {uploaded ? (
                      <Check className="h-8 w-8 text-success" />
                    ) : (
                      <Camera className="h-8 w-8 text-muted" />
                    )}
                    <span className="text-sm font-medium">
                      {slot.label}
                      {slot.required && (
                        <span className="text-danger ml-0.5">*</span>
                      )}
                    </span>
                    <span className="text-xs text-muted text-center">
                      {uploaded ? "Uploaded" : slot.guidance}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================
            STEP 3 — Cupping
        ================================================================ */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-sm text-muted">
              Score each dimension from 0 to 10 (0.5 increments). The overall
              score is auto-calculated.
            </p>

            <div className="space-y-5">
              {CUPPING_DIMENSIONS.map((dim) => {
                const val = form.cupping[dim.key] ?? 5;
                return (
                  <div key={dim.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium">
                        {dim.label}
                      </label>
                      <span className="text-sm font-bold tabular-nums w-8 text-right">
                        {val.toFixed(1)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={val}
                      onChange={(e) =>
                        setCupping(dim.key, parseFloat(e.target.value))
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-sm font-semibold">Overall</span>
                <span className="text-lg font-bold text-primary tabular-nums">
                  {cuppingOverall.toFixed(1)}
                </span>
              </div>
            </div>

            <div>
              <label className={labelCls}>Tasting Notes</label>
              <textarea
                value={form.cupping_notes}
                onChange={(e) => update("cupping_notes", e.target.value)}
                rows={3}
                placeholder="Describe aroma, mouthfeel, aftertaste..."
                className={inputCls}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Cupped By</label>
                <input
                  value={form.cupped_by}
                  onChange={(e) => update("cupped_by", e.target.value)}
                  placeholder="Name of cupper"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Cupping Date</label>
                <input
                  type="date"
                  value={form.cupping_date}
                  onChange={(e) => update("cupping_date", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            STEP 4 — Pricing
        ================================================================ */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Total Quantity (kg)</label>
                <input
                  type="number"
                  value={form.total_kg}
                  onChange={(e) => update("total_kg", e.target.value)}
                  placeholder="e.g. 50"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Min Purchase (kg)</label>
                <input
                  type="number"
                  value={form.min_purchase_kg}
                  onChange={(e) => update("min_purchase_kg", e.target.value)}
                  placeholder="e.g. 1"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Starting Price / kg ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.starting_price}
                  onChange={(e) => update("starting_price", e.target.value)}
                  placeholder="e.g. 3.50"
                  className={inputCls}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-sm font-medium">
                    Reserve Price / kg ($)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setShowReserveTooltip(true)}
                      onMouseLeave={() => setShowReserveTooltip(false)}
                      className="text-muted hover:text-foreground"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    {showReserveTooltip && (
                      <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-foreground text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                        Hidden minimum. If bids don&apos;t reach this, you can
                        counter-offer the highest bidder.
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={form.reserve_price}
                  onChange={(e) => update("reserve_price", e.target.value)}
                  placeholder="e.g. 5.00"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.buy_now_enabled}
                  onChange={(e) =>
                    update("buy_now_enabled", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm font-medium">
                  Enable Buy Now price
                </span>
              </label>
              {form.buy_now_enabled && (
                <input
                  type="number"
                  step="0.01"
                  value={form.buy_now_price}
                  onChange={(e) => update("buy_now_price", e.target.value)}
                  placeholder="Buy Now price per kg"
                  className={`${inputCls} max-w-xs`}
                />
              )}
            </div>

            <div>
              <label className={labelCls}>Bid Increment ($)</label>
              <div className="flex gap-3">
                {BID_INCREMENTS.map((inc) => (
                  <label
                    key={inc}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      form.bid_increment === inc
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="increment"
                      value={inc}
                      checked={form.bid_increment === inc}
                      onChange={() => update("bid_increment", inc)}
                      className="sr-only"
                    />
                    ${inc.toFixed(2)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Auction Duration</label>
              <div className="flex gap-3">
                {AUCTION_DURATIONS.map((d) => (
                  <label
                    key={d.value}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                      form.duration === d.value
                        ? "border-primary bg-primary/5 font-semibold"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={d.value}
                      checked={form.duration === d.value}
                      onChange={() => update("duration", d.value)}
                      className="sr-only"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            STEP 5 — Shipping
        ================================================================ */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ships From Country</label>
                <select
                  value={form.ships_from_country}
                  onChange={(e) =>
                    update("ships_from_country", e.target.value)
                  }
                  className={inputCls}
                >
                  <option value="">Select country</option>
                  {ORIGIN_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Ships From City</label>
                <input
                  value={form.ships_from_city}
                  onChange={(e) =>
                    update("ships_from_city", e.target.value)
                  }
                  placeholder="e.g. Mombasa"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Estimated Delivery (days)
              </label>
              <input
                type="number"
                value={form.est_delivery_days}
                onChange={(e) =>
                  update("est_delivery_days", e.target.value)
                }
                placeholder="e.g. 7"
                className={`${inputCls} max-w-xs`}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sample_available}
                  onChange={(e) =>
                    update("sample_available", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span className="text-sm font-medium">
                  Sample available for buyers
                </span>
              </label>
              {form.sample_available && (
                <input
                  type="number"
                  step="0.01"
                  value={form.sample_price}
                  onChange={(e) =>
                    update("sample_price", e.target.value)
                  }
                  placeholder="Sample price ($)"
                  className={`${inputCls} max-w-xs`}
                />
              )}
            </div>
          </div>
        )}

        {/* ================================================================
            STEP 6 — Review
        ================================================================ */}
        {step === 6 && (
          <div className="space-y-8">
            <p className="text-sm text-muted">
              Review your Tea Condition Report before submitting.
            </p>

            {/* Identity */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Identity
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <ReviewRow label="Title" value={form.title || "--"} />
                <ReviewRow label="Tea Type" value={getTeaLabel(form.tea_type) || "--"} />
                <ReviewRow label="Grade" value={form.grade || "--"} />
                <ReviewRow
                  label="Origin"
                  value={
                    form.origin_country
                      ? `${getCountryName(form.origin_country)}${form.origin_region ? `, ${form.origin_region}` : ""}`
                      : "--"
                  }
                />
                <ReviewRow label="Estate" value={form.estate_name || "--"} />
                <ReviewRow label="Harvest Date" value={form.harvest_date || "--"} />
                <ReviewRow label="Season" value={form.harvest_season ? getSeasonLabel(form.harvest_season) : "--"} />
                <ReviewRow label="Processing" value={form.processing_method ? getMethodLabel(form.processing_method) : "--"} />
                <ReviewRow label="Elevation" value={form.elevation ? `${form.elevation}m` : "--"} />
              </div>
              {form.certifications.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {form.certifications.map((c) => (
                    <span
                      key={c}
                      className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {form.description && (
                <p className="mt-3 text-sm text-muted">{form.description}</p>
              )}
            </div>

            {/* Photos */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Photos
              </h3>
              <div className="flex flex-wrap gap-2">
                {PHOTO_SLOTS.filter((s) => form.photos[s.key]).map((s) => (
                  <span
                    key={s.key}
                    className="text-xs px-2.5 py-1 rounded-full bg-success/10 text-success font-medium"
                  >
                    {s.label}
                  </span>
                ))}
                {Object.keys(form.photos).length === 0 && (
                  <span className="text-sm text-muted">No photos uploaded</span>
                )}
              </div>
            </div>

            {/* Cupping */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Cupping Scores
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {CUPPING_DIMENSIONS.map((dim) => (
                  <div
                    key={dim.key}
                    className="bg-background rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-muted">{dim.label}</p>
                    <p className="text-lg font-bold tabular-nums">
                      {(form.cupping[dim.key] ?? 0).toFixed(1)}
                    </p>
                  </div>
                ))}
                <div className="bg-primary/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-primary font-medium">Overall</p>
                  <p className="text-lg font-bold text-primary tabular-nums">
                    {cuppingOverall.toFixed(1)}
                  </p>
                </div>
              </div>
              {form.cupping_notes && (
                <p className="mt-3 text-sm text-muted italic">
                  &ldquo;{form.cupping_notes}&rdquo;
                </p>
              )}
              <div className="mt-2 text-sm text-muted">
                {form.cupped_by && <span>Cupped by {form.cupped_by}</span>}
                {form.cupping_date && <span> on {form.cupping_date}</span>}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Pricing &amp; Auction
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <ReviewRow label="Total Quantity" value={form.total_kg ? `${form.total_kg} kg` : "--"} />
                <ReviewRow label="Min Purchase" value={form.min_purchase_kg ? `${form.min_purchase_kg} kg` : "--"} />
                <ReviewRow label="Starting Price" value={form.starting_price ? formatPrice(parseFloat(form.starting_price)) + "/kg" : "--"} />
                <ReviewRow label="Reserve Price" value={form.reserve_price ? formatPrice(parseFloat(form.reserve_price)) + "/kg" : "--"} />
                {form.buy_now_enabled && (
                  <ReviewRow label="Buy Now" value={form.buy_now_price ? formatPrice(parseFloat(form.buy_now_price)) + "/kg" : "--"} />
                )}
                <ReviewRow label="Bid Increment" value={`$${form.bid_increment.toFixed(2)}`} />
                <ReviewRow label="Duration" value={`${form.duration} min`} />
              </div>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
                Shipping
              </h3>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <ReviewRow
                  label="Ships From"
                  value={
                    form.ships_from_country
                      ? `${getCountryName(form.ships_from_country)}${form.ships_from_city ? `, ${form.ships_from_city}` : ""}`
                      : "--"
                  }
                />
                <ReviewRow label="Est. Delivery" value={form.est_delivery_days ? `${form.est_delivery_days} days` : "--"} />
                <ReviewRow label="Sample" value={form.sample_available ? (form.sample_price ? `$${form.sample_price}` : "Available") : "Not available"} />
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-1.5 bg-primary text-white font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-primary-light transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => alert("Lot submitted for review!")}
              className="inline-flex items-center gap-1.5 bg-accent text-white font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-accent-light transition-colors"
            >
              Submit for Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
