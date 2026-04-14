"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/providers";
import { Wordmark } from "@/components/brand/wordmark";
import { Chip } from "@/components/ui/chip";
import { Stamp } from "@/components/ui/stamp";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Auctions", href: "/auctions" },
  { label: "Ending Soon", href: "/auctions?filter=ending-soon" },
  { label: "Buy Now", href: "/auctions?filter=buy-now" },
] as const;

const UNREAD_COUNT = 2;

export function TopNav() {
  const pathname = usePathname();
  const { user, setRole } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Collapse on scroll past 120px for a calmer reading experience
  useEffect(() => {
    const handler = () => setCollapsed(window.scrollY > 120);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const initials = user.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden border-b border-border bg-card backdrop-blur-sm transition-[height] duration-300 md:flex",
        collapsed ? "h-12" : "h-16"
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
        {/* Brand lockup */}
        <Link href="/" className="flex items-center">
          <Wordmark variant={collapsed ? "mark-only" : "horizontal"} size="md" />
          {collapsed && (
            <span className="ml-2 relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-live)] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-live)]" />
            </span>
          )}
        </Link>

        {/* Center nav (hidden when collapsed) */}
        {!collapsed && (
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "type-meta transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-[var(--color-ink-muted)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Role preview — tea-type chip row */}
          {!collapsed && (
            <div
              className="hidden lg:inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-1"
              role="group"
              aria-label="Preview as"
            >
              <span className="px-2 type-micro text-[var(--color-ink-muted)]">View as</span>
              {(["buyer", "seller", "admin"] as const).map((role) => {
                const active = user.role === role;
                const label =
                  role === "buyer"
                    ? "Retailer"
                    : role === "seller"
                      ? "Wholesaler"
                      : "Admin";
                return (
                  <Chip
                    key={role}
                    variant={active ? "wax" : "neutral"}
                    size="sm"
                    onClick={() => setRole(role)}
                    className="cursor-pointer"
                    role="button"
                    tabIndex={0}
                  >
                    {label}
                  </Chip>
                );
              })}
            </div>
          )}

          {/* Notifications */}
          <Link href="/notifications" className="relative p-1" aria-label={`Notifications (${UNREAD_COUNT} unread)`}>
            <Bell className="h-5 w-5 text-[var(--color-ink-muted)] hover:text-foreground transition-colors" />
            {UNREAD_COUNT > 0 && (
              <span className="absolute -top-0.5 -right-0.5">
                <Stamp label={String(UNREAD_COUNT)} color="wax" size="xs" />
              </span>
            )}
          </Link>

          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
