"use client";

import { useAuth } from "@/lib/auth";

export function LogoutButton() {
  const { isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={logout}
      className="text-xs text-[var(--color-ink-muted)] hover:text-foreground transition-colors font-medium"
    >
      Log Out
    </button>
  );
}
