import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Upload,
  Zap,
  Gavel,
  ShieldCheck,
  Check,
  Leaf,
  Globe,
  AtSign,
  Hash,
  BarChart3,
} from "lucide-react";
import { getActiveLots } from "@/lib/mock-data";
import {
  HERO_BG,
  STORY_IMAGES,
  getLotHeroPhoto,
} from "@/lib/photos";
import { getCountryFlag, formatCountdown } from "@/lib/utils";
import { StatsCounter } from "@/components/landing/stats-counter";
import { ActivityTicker } from "@/components/landing/activity-ticker";
import { PriceDisplay } from "@/components/price-display";

const HOW_IT_WORKS = [
  {
    icon: Upload,
    title: "Authorized wholesaler lists a lot",
    desc: "Sudan's licensed tea wholesalers publish a structured Tea Condition Report — cupping scores, photos, certifications, origin.",
  },
  {
    icon: Zap,
    title: "Auction goes live",
    desc: "30-60 minute rolling auctions. Always something live. Auto-extends on last-minute bids so sniping is impossible.",
  },
  {
    icon: Gavel,
    title: "Retailers bid across Sudan",
    desc: "Tea shops and wholesalers from Khartoum to Kassala compete in real-time — or skip the line with instant Buy Now pricing.",
  },
  {
    icon: ShieldCheck,
    title: "Delivered to your door",
    desc: "Escrow holds payment until the shipment arrives and matches the report. Delivery anywhere in Sudan.",
  },
];

const TCR_BULLETS = [
  "6-dimension cupping scores from certified tasters",
  "Structured photo documentation (dry leaf, wet leaf, liquor, packaging)",
  "Post-delivery TCR accuracy ratings",
  "Verified seller reputation system",
];

const PRESS_LOGOS = [
  "Sudan Tribune",
  "Al Jazeera Business",
  "Khartoum Review",
  "Tea & Coffee Trade Journal",
  "MENA Retail Weekly",
];

const TESTIMONIALS = [
  {
    quote:
      "Before ShaiBlock we paid whatever the Omdurman broker quoted. Now I see real market prices every day.",
    name: "Ahmed Salih",
    role: "Khartoum Shai House",
  },
  {
    quote:
      "Our Kenya tea used to sit in the Port Sudan warehouse for weeks. Now a 50kg lot sells to retailers in 45 minutes.",
    name: "Omar Tahir",
    role: "Red Sea Tea Wholesale",
  },
  {
    quote:
      "The Condition Report means I know exactly what I'm buying. No more surprises when the chest opens in Kassala.",
    name: "Fatima Osman",
    role: "Omdurman Grand Café",
  },
];

export default function HomePage() {
  const activeLots = getActiveLots();
  const lotTitles = activeLots.map((l) => l.title);
  const featured = activeLots.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════════════════════
          1. HERO
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] md:min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src={HERO_BG}
          alt="Tea plantation at dawn"
          fill
          priority
          sizes="100vw"
          className="object-cover brightness-[0.35]"
        />
        {/* Dark emerald gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/60 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Giant Arabic watermark bleeding off the right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 font-arabic text-white/[0.035] select-none leading-none hidden md:block"
          style={{ fontSize: "32rem" }}
          dir="rtl"
          lang="ar"
        >
          شاي
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 w-full py-24 md:py-32">
          <p
            className="font-arabic text-accent-light text-base md:text-lg font-semibold mb-2"
            dir="rtl"
            lang="ar"
          >
            شاي · أول منصة مزاد للشاي في السودان
          </p>
          <p className="text-accent-light text-xs md:text-sm font-semibold uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-accent-light" />
            Sudan&apos;s Live Tea Exchange
          </p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] tracking-tight max-w-5xl">
            Every cup has a story.
            <br />
            <span className="font-bold italic bg-gradient-to-r from-accent-light via-accent-light to-white bg-clip-text text-transparent">
              Every lot has a fair price.
            </span>
          </h1>
          <p className="mt-8 text-white/85 text-lg md:text-xl max-w-2xl leading-relaxed">
            Retailers across Khartoum, Omdurman, and Port Sudan bid live on
            verified lots from Sudan&apos;s authorized tea wholesalers — sourced
            from Kenya, India, Sri Lanka, and beyond. Transparent pricing.
            Verified quality. Instant settlement.
          </p>
          <p
            className="font-arabic mt-4 text-white/65 text-base md:text-lg max-w-2xl leading-relaxed"
            dir="rtl"
            lang="ar"
          >
            من كينيا والهند وسريلانكا إلى تجار التجزئة في السودان
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold rounded-full px-8 py-4 text-lg shadow-2xl shadow-accent/30 transition-all hover:scale-[1.02]"
            >
              Browse Live Auctions
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white font-semibold rounded-full px-8 py-4 text-lg backdrop-blur hover:bg-white/10 transition-all"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Trust bar */}
        <div className="absolute bottom-8 left-0 right-0 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-white/90 text-xs md:text-sm border-t border-white/15 pt-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                <span className="text-white/60">Live Auctions:</span>
                <span className="font-bold text-white">8</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-white/60">Wholesalers:</span>
                <span className="font-bold text-white">12 authorized</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-white/60">Retailers:</span>
                <span className="font-bold text-white">200+ across Sudan</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <span className="text-white/60">Total Volume:</span>
                <span className="font-bold text-white">$2.4M</span>
                <span className="text-white/60">traded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. ANIMATED STATS
         ═══════════════════════════════════════════════════════════ */}
      <StatsCounter />

      {/* ═══════════════════════════════════════════════════════════
          3. LIVE ACTIVITY TICKER
         ═══════════════════════════════════════════════════════════ */}
      <ActivityTicker lotTitles={lotTitles} />

      {/* ═══════════════════════════════════════════════════════════
          4. HOW IT WORKS
         ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 md:mb-20">
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Process
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight max-w-3xl mx-auto">
              From origin to Khartoum in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Big background numeral */}
                <span
                  className="absolute top-2 right-4 font-serif text-7xl text-accent opacity-10 leading-none select-none pointer-events-none"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="relative">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. THE TEA CONDITION REPORT (the moat)
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-card py-20 md:py-28 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={STORY_IMAGES.cupping}
                  alt="Tea cupping session"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Overlay score card */}
              <div className="absolute -bottom-6 -right-2 md:-right-6 bg-card rounded-2xl shadow-2xl border border-border p-5 flex items-center gap-4 max-w-[260px]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider font-semibold">
                    Cupping Score
                  </p>
                  <p className="font-serif text-2xl font-bold text-foreground tabular-nums">
                    8.5
                    <span className="text-muted text-lg font-normal">/10</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right: text */}
            <div className="order-1 lg:order-2">
              <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                The Moat
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                You don&apos;t taste it.
                <br />
                But you can trust it.
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-4">
                Every lot comes with a Tea Condition Report — cupping scores
                across six dimensions, verified taster identity, structured
                photos of dry leaf, wet leaf, liquor, and packaging. After
                delivery, buyers rate accuracy. Sellers who match their reports
                build reputation. Sellers who don&apos;t, don&apos;t last long.
              </p>
              <p className="text-foreground text-base leading-relaxed mb-8 font-medium border-l-4 border-accent pl-4">
                In Sudan&apos;s broker-driven tea market, verified Condition
                Reports aren&apos;t a nice-to-have. They&apos;re the difference
                between a trusted trade and a bad surprise when the shipment
                opens.
              </p>

              <ul className="space-y-4">
                {TCR_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <div className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary" strokeWidth={3} />
                    </div>
                    <span className="text-foreground text-base leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. FEATURED ACTIVE AUCTIONS
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-background py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-danger opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
                </span>
                Active Now
              </p>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                Live right now
              </h2>
            </div>
            <Link
              href="/auctions"
              className="text-primary hover:text-primary-light font-semibold inline-flex items-center gap-1 text-sm md:text-base"
            >
              View all auctions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featured.map((lot) => (
              <Link
                key={lot.id}
                href={`/auctions/${lot.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-300 bg-card">
                  <Image
                    src={getLotHeroPhoto(lot.id)}
                    alt={lot.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Countdown badge */}
                  <div className="absolute top-4 right-4 bg-black/75 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-mono font-bold tabular-nums flex items-center gap-1.5 border border-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-danger animate-pulse-danger" />
                    {formatCountdown(lot.auction_end)}
                  </div>
                  {/* Bid count */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-foreground px-2.5 py-1 rounded-full text-xs font-semibold">
                    {lot.bid_count} bids
                  </div>
                </div>
                <div className="mt-5 px-1">
                  <p className="text-xs text-muted mb-1 font-mono">
                    {lot.lot_number}
                  </p>
                  <h3 className="font-serif text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {lot.title}
                  </h3>
                  <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                    <span>{getCountryFlag(lot.origin_country)}</span>
                    <span>
                      {lot.origin_country} · {lot.origin_region}
                    </span>
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wider mb-1">
                        Current Bid
                      </p>
                      <PriceDisplay
                        amountUSD={
                          lot.current_high_bid ?? lot.starting_price_per_kg
                        }
                        size="md"
                        perKg
                        className="text-primary"
                      />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          7. PRESS / TRUST
         ═══════════════════════════════════════════════════════════ */}
      <section className="bg-card border-y border-border py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              In Good Company
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
              Trusted by Sudan&apos;s tea trade
            </h2>
          </div>

          {/* Press logos row */}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 mb-16 pb-14 border-b border-border">
            {PRESS_LOGOS.map((logo) => (
              <span
                key={logo}
                className="font-serif italic text-muted text-lg md:text-xl whitespace-nowrap opacity-70 hover:opacity-100 transition-opacity"
              >
                {logo}
              </span>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="bg-background border border-border rounded-2xl p-8 flex flex-col"
              >
                <div className="font-serif text-5xl text-accent leading-none mb-2 select-none">
                  &ldquo;
                </div>
                <blockquote className="text-foreground text-base leading-relaxed flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border">
                  <p className="font-semibold text-foreground text-sm">
                    {t.name}
                  </p>
                  <p className="text-muted text-xs mt-0.5">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. BIG CTA
         ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 50%, rgba(245,158,11,0.5) 0, transparent 50%), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.2) 0, transparent 50%)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
          <h2 className="font-serif text-white text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-4">
            Ready to modernize
            <br />
            Sudan&apos;s tea trade?
          </h2>
          <p
            className="font-arabic text-accent-light text-lg md:text-xl mb-6"
            dir="rtl"
            lang="ar"
          >
            انضم إلى مستقبل تجارة الشاي في السودان
          </p>
          <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join 12+ authorized wholesalers and 200+ Sudanese retailers. Your
            first listing is free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-light text-white font-semibold rounded-full px-8 py-4 text-lg shadow-2xl shadow-black/20 transition-all hover:scale-[1.02]"
            >
              Start Bidding
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/seller"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold rounded-full px-8 py-4 text-lg hover:bg-white/10 transition-all"
            >
              List Your Lot
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. FOOTER
         ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-foreground text-white/80 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-baseline gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center self-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-serif text-white text-xl font-bold">
                  ShaiBlock
                </span>
                <span
                  className="font-arabic text-accent text-lg font-bold"
                  dir="rtl"
                  lang="ar"
                >
                  شاي
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-1 max-w-xs">
                The Sudan tea exchange.
              </p>
              <p
                className="font-arabic text-white/50 text-sm leading-relaxed mb-6 max-w-xs"
                dir="rtl"
                lang="ar"
              >
                بورصة الشاي السودانية
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  aria-label="Follow us"
                  className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <Hash className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Network"
                  className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  aria-label="Email"
                  className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors"
                >
                  <AtSign className="h-4 w-4" />
                </a>
              </div>
            </div>

            <FooterColumn
              title="Marketplace"
              links={[
                { label: "Live Auctions", href: "/auctions" },
                { label: "Buy Now", href: "/auctions?type=buynow" },
                { label: "Ending Soon", href: "/auctions?sort=ending" },
                { label: "Just Listed", href: "/auctions?sort=new" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", href: "#" },
                { label: "How it Works", href: "#how-it-works" },
                { label: "Press", href: "#" },
                { label: "Careers", href: "#" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: "Terms", href: "#" },
                { label: "Privacy", href: "#" },
                { label: "Seller Policy", href: "#" },
                { label: "Contact", href: "#" },
              ]}
            />
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-xs">
            <p>© 2026 ShaiBlock. All rights reserved.</p>
            <p className="italic">Made with leaves and code · in Khartoum &amp; the cloud.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
