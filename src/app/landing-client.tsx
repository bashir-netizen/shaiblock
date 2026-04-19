"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { HERO_BG } from "@/lib/photos";
import { Wordmark } from "@/components/brand/wordmark";
import { MarketTicker } from "@/components/market-ticker";
import { AuctionCard } from "@/components/auction-card";
import type { Lot, TickerItem } from "@/lib/types";

interface LandingClientProps {
  lots: Lot[];
  tickerItems: TickerItem[];
  liveCount: number;
  originCount: number;
}

export function LandingClient({ lots, tickerItems, liveCount, originCount }: LandingClientProps) {
  const { isLoggedIn, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isLoggedIn === true) {
      router.replace("/auctions");
    }
  }, [isLoggedIn, router]);

  // Hydrating — render nothing
  if (isLoggedIn === null || isLoggedIn === true) return null;

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    login();
  }

  return (
    <div className="flex flex-col">
      {/* ── Top bar ── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <Wordmark variant="horizontal" className="[--wordmark-mark:24px] [--wordmark-text:1.1rem] text-white [&_span]:text-white" />
        <div className="flex items-center gap-3">
          <a href="#login" className="text-white/80 hover:text-white text-sm font-semibold transition-colors">
            Log In
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(15,81,50,0.92) 0%, rgba(15,81,50,0.85) 50%, rgba(181,107,27,0.3) 100%)",
        }}
      >
        <Image src={HERO_BG} alt="" fill className="object-cover mix-blend-overlay opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-arabic text-white/[0.04] text-[300px] leading-none">شاي</span>
        </div>
        <div className="relative z-10 text-center px-6 max-w-lg mx-auto pt-16">
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight font-bold">
            Sudan&apos;s Tea<br />Trading Floor
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-3 max-w-md mx-auto">
            Live auctions from Rwanda, Kenya, Uganda, and beyond.<br className="hidden md:block" />
            Direct to Sudanese wholesalers and retailers.
          </p>
          <form onSubmit={handleLogin} className="mt-8 space-y-3 max-w-xs mx-auto" id="login">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm font-mono focus:outline-none focus:border-white/50 backdrop-blur"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm font-mono focus:outline-none focus:border-white/50 backdrop-blur"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hot)] text-white font-bold text-sm transition-colors shadow-lg"
            >
              Log In
            </button>
          </form>
        </div>
      </section>

      {/* ── Market ticker ── */}
      <MarketTicker items={tickerItems} />

      {/* ── Stats bar ── */}
      <section className="bg-[var(--color-bg)] border-y border-[var(--color-rule)] py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: String(liveCount), label: "Live Auctions" },
            { value: "247M", label: "kg Traded (East Africa)" },
            { value: "$48M", label: "Sudan Market Opportunity" },
            { value: String(originCount), label: "Origin Countries" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-ink-muted)] font-semibold mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Preview cards (blurred) ── */}
      <section className="bg-background py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-ink-muted)] font-bold text-center mb-6">
            Featured Lots
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lots.map((lot) => (
              <div key={lot.id} className="relative">
                <div className="blur-[2px] opacity-80 pointer-events-none">
                  <AuctionCard lot={lot} />
                </div>
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-2">
                  <Lock className="w-6 h-6 text-[var(--color-ink-muted)]" />
                  <p className="text-xs font-semibold text-[var(--color-ink-muted)]">Log in to bid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[var(--color-bg)] border-t border-[var(--color-rule)] py-8 text-center">
        <Wordmark variant="horizontal" />
        <p className="text-xs text-[var(--color-ink-muted)] mt-2">Sudan&apos;s direct tea marketplace</p>
        <p className="text-[10px] text-[var(--color-ink-muted)] mt-1">&copy; 2026 ShaiBlock. All rights reserved.</p>
      </footer>
    </div>
  );
}
