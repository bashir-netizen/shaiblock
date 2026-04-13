"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Gavel, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/", icon: Home },
  { label: "Auctions", href: "/auctions", icon: Search },
  { label: "My Bids", href: "/dashboard/buyer/bids", icon: Gavel },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile/me", icon: User },
] as const;

const UNREAD_COUNT = 2;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 h-16 bg-card border-t border-border md:hidden">
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
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted"
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" />
                {tab.label === "Notifications" && UNREAD_COUNT > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                    {UNREAD_COUNT}
                  </span>
                )}
              </span>
              <span className="font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
