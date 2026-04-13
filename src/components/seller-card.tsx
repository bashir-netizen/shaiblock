import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { Profile } from "@/lib/types";
import { getCountryFlag } from "@/lib/utils";

interface SellerCardProps {
  seller: Profile;
}

export function SellerCard({ seller }: SellerCardProps) {
  const initials = (seller.company_name || seller.display_name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
          <span className="text-xs">TCR Accuracy: 96%</span>
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
