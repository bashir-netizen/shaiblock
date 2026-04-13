"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** If true, render as abbreviated currency ($2.4M). target is in millions. */
  millions?: boolean;
}

const STATS: Stat[] = [
  { target: 247, label: "Lots Sold This Month" },
  { target: 2.4, label: "Total GMV in Sudan", prefix: "$", suffix: "M", decimals: 1, millions: true },
  { target: 96, label: "TCR Accuracy Score", suffix: "%" },
  { target: 200, label: "Retailers Across Sudan", suffix: "+" },
];

function formatStat(value: number, stat: Stat): string {
  const num = stat.decimals
    ? value.toFixed(stat.decimals)
    : Math.round(value).toLocaleString();
  return `${stat.prefix ?? ""}${num}${stat.suffix ?? ""}`;
}

export function StatsCounter() {
  const [values, setValues] = useState<number[]>(() => STATS.map(() => 0));
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Trigger when scrolled into view
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate numbers
  useEffect(() => {
    if (!visible) return;
    const duration = 1500;
    const start = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValues(STATS.map((s) => s.target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <section ref={ref} className="bg-primary py-20 md:py-24 relative overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(245,158,11,0.4) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0, transparent 40%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-accent-light text-xs font-semibold uppercase tracking-[0.2em] mb-3">
            Traction
          </p>
          <h2 className="font-serif text-white text-4xl md:text-5xl leading-tight">
            Sudan&apos;s tea trade, in numbers
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="font-serif text-5xl md:text-6xl font-bold text-accent-light tabular-nums leading-none">
                {formatStat(values[i] ?? 0, stat)}
              </div>
              <div className="mt-4 text-white/70 text-xs md:text-sm uppercase tracking-[0.18em] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
