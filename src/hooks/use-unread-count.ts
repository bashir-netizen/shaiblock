"use client";

import { useAuth } from "@/components/providers";
import { notifications } from "@/lib/mock-data";

export function useUnreadCount(): number {
  const { user } = useAuth();
  return notifications.filter((n) => n.user_id === user.id && !n.read).length;
}
