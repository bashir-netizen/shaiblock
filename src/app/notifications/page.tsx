"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers";
import { notifications as allNotifications } from "@/lib/mock-data";
import { timeAgo } from "@/lib/utils";
import {
  Bell,
  Gavel,
  ArrowLeftRight,
  Trophy,
  Package,
  CheckCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const typeIcons: Record<string, LucideIcon> = {
  outbid: Gavel,
  counter_offer_received: ArrowLeftRight,
  auction_won: Trophy,
  order_update: Package,
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "b1";

  const [items, setItems] = useState(
    allNotifications.filter((n) => n.user_id === userId)
  );

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayItems = items.filter(
    (n) => new Date(n.created_at).getTime() >= today.getTime()
  );
  const earlierItems = items.filter(
    (n) => new Date(n.created_at).getTime() < today.getTime()
  );

  const renderNotification = (n: (typeof items)[number]) => {
    const Icon = typeIcons[n.type] ?? Bell;
    return (
      <div
        key={n.id}
        className={`flex gap-4 px-5 py-4 ${
          n.read ? "" : "bg-primary/5"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              n.read
                ? "bg-muted/10 text-muted"
                : "bg-primary/10 text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${n.read ? "" : "font-semibold"}`}>
            {n.title}
          </p>
          <p className="text-sm text-muted mt-0.5">{n.body}</p>
          <p className="text-xs text-muted mt-1">{timeAgo(n.created_at)}</p>
        </div>
        {!n.read && (
          <div className="shrink-0 mt-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Notifications</h1>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all as read
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Bell className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-muted">No notifications</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl divide-y divide-border overflow-hidden">
          {todayItems.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-background">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Today
                </p>
              </div>
              {todayItems.map(renderNotification)}
            </>
          )}
          {earlierItems.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-background">
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Earlier
                </p>
              </div>
              {earlierItems.map(renderNotification)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
