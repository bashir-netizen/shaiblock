"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useAuth } from "@/components/providers";
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

  const initials = user.display_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 hidden h-16 border-b border-border bg-card md:flex">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-serif text-xl font-bold text-primary">
            ShaiBlock
          </span>
          <span
            className="font-arabic text-accent text-lg font-bold"
            dir="rtl"
            lang="ar"
          >
            شاي
          </span>
        </Link>

        {/* Center nav */}
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ||
                  (link.href.startsWith("/auctions") &&
                    pathname === "/auctions" &&
                    link.href === "/auctions")
                  ? "text-primary"
                  : "text-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Demo-mode role preview: segmented button group so the investor
              can switch between retailer / wholesaler / admin views. Styled
              to look like an intentional "demo preview" control, not a dev
              toggle. */}
          <div
            className="hidden lg:inline-flex items-center gap-0.5 rounded-full border border-border bg-background px-1 py-1"
            role="group"
            aria-label="Preview as"
          >
            <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
              View as
            </span>
            {(["buyer", "seller", "admin"] as const).map((role) => {
              const active = user.role === role;
              const label =
                role === "buyer"
                  ? "Retailer"
                  : role === "seller"
                    ? "Wholesaler"
                    : "Admin";
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRole(role)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          <Link href="/notifications" className="relative">
            <Bell className="h-5 w-5 text-muted hover:text-foreground transition-colors" />
            {UNREAD_COUNT > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {UNREAD_COUNT}
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
