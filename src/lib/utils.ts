import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Approximate USD → SDG rate used for dual-currency display in the demo.
// Real trading would pull this from an FX feed.
export const USD_TO_SDG_RATE = 600;

export function formatSDG(usdAmount: number): string {
  const sdg = Math.round(usdAmount * USD_TO_SDG_RATE);
  return `SDG ${sdg.toLocaleString()}`;
}

export function formatKg(kg: number): string {
  return `${kg.toLocaleString()} kg`;
}

export function getTimeRemaining(endTime: string): {
  total: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const total = new Date(endTime).getTime() - Date.now();
  if (total <= 0) {
    return { total: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    total,
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    expired: false,
  };
}

export function formatCountdown(endTime: string): string {
  const { minutes, seconds, expired } = getTimeRemaining(endTime);
  if (expired) return "ENDED";
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getCountdownColor(endTime: string): string {
  const { total } = getTimeRemaining(endTime);
  const minutes = total / 1000 / 60;
  if (minutes <= 3) return "text-danger";
  if (minutes <= 10) return "text-accent";
  return "text-success";
}

export function timeAgo(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    KE: "\ud83c\uddf0\ud83c\uddea",
    IN: "\ud83c\uddee\ud83c\uddf3",
    LK: "\ud83c\uddf1\ud83c\uddf0",
    CN: "\ud83c\udde8\ud83c\uddf3",
    JP: "\ud83c\uddef\ud83c\uddf5",
    TW: "\ud83c\uddf9\ud83c\uddfc",
    NP: "\ud83c\uddf3\ud83c\uddf5",
    VN: "\ud83c\uddfb\ud83c\uddf3",
    ID: "\ud83c\uddee\ud83c\udde9",
    RW: "\ud83c\uddf7\ud83c\uddfc",
  };
  return flags[countryCode] || "\ud83c\udff3\ufe0f";
}
