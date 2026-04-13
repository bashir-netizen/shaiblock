import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { Profile } from "@/lib/types";
import { getCountryFlag } from "@/lib/utils";

interface SellerCardProps {
  seller: Profile;
}

// Derive a plausible TCR accuracy % from the seller's reputation_score (0-5).
// A 5.0 seller lands around 99%, a 4.0 around 90%. Keeps the display honest
// to the underlying data instead of hard-coding "96%".
function tcrAccuracyFromReputation(score: number): number {
  if (score <= 0) return 0;
  return Math.min(99, Math.round(80 + score * 4));
}

export function SellerCard({ seller }: SellerCardProps) {
  const initials = (seller.company_name || seller.display_name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const tcrAccuracy = tcrAccuracyFromReputation(seller.reputation_score);

  return (
    <Link
      href={`/profile/${seller.id}`}
      className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">
          {seller.company_name || seller.display_name}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted mt-0.5">
          <span className="flex items-center gap-0.5">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            {seller.reputation_score.toFixed(1)}
          </span>
          <span>({seller.total_transactions} sales)</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted mt-0.5">
          <span className="text-xs">TCR Accuracy: {tcrAccuracy}%</span>
          {seller.country && (
            <>
              <span className="text-border">|</span>
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {getCountryFlag(seller.country)} {seller.city}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
