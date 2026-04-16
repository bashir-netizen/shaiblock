"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = ["Market Feed", "Lot Details", "Cupping"] as const;
type TabName = (typeof TABS)[number];

interface LotDetailTabsProps {
  marketFeedContent: React.ReactNode;
  lotDetailsContent: React.ReactNode;
  cuppingContent: React.ReactNode;
}

export function LotDetailTabs({
  marketFeedContent,
  lotDetailsContent,
  cuppingContent,
}: LotDetailTabsProps) {
  const [active, setActive] = useState<TabName>("Market Feed");

  return (
    <div className="md:hidden">
      <div className="flex bg-[var(--color-bg)] border-b border-[var(--color-rule)] sticky top-[58px] z-20">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={cn(
              "flex-1 text-center py-2.5 text-[11px] font-semibold transition-colors",
              active === tab
                ? "text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-[var(--color-ink-muted)]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: active === "Market Feed" ? "block" : "none" }}>
        {marketFeedContent}
      </div>
      <div style={{ display: active === "Lot Details" ? "block" : "none" }}>
        {lotDetailsContent}
      </div>
      <div style={{ display: active === "Cupping" ? "block" : "none" }}>
        {cuppingContent}
      </div>
    </div>
  );
}
