"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import { LeafMark, CuppingBowl, Ladle } from "@/components/icons/tea";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: LeafMark },
  { label: "Auctions", href: "/auctions", icon: CuppingBowl },
  { label: "My Bids", href: "/dashboard/buyer/bids", icon: Ladle },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile/me", icon: User },
] as const;

const UNREAD_COUNT = 2;

export function BottomNav() {
  const pathname = usePathname();

  // PRESERVED from review-fixes commit ae748f2: hide BottomNav on lot detail
  // pages so the sticky BidPanel has full bottom real-estate.
  const isLotDetail = /^\/auctions\/[^/]+$/.test(pathname);
  if (isLotDetail) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 h-16 bg-card border-t border-border md:hidden"
      aria-label="Primary"
    >
      <div className="flex h-full items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-[var(--color-ink-muted)]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon size={22} className={cn(isActive && "scale-[1.05]")} />
                {tab.label === "Notifications" && UNREAD_COUNT > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-wax)] px-1 text-[10px] font-bold text-white">
                    {UNREAD_COUNT}
                  </span>
                )}
              </span>
              <span className="font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
