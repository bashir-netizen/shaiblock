import { getLotById, getBidsForLot, sellers } from "@/lib/mock-data";
import { LotDetailClient } from "./lot-detail-client";

// Force per-request rendering so the countdown timestamps are always fresh.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LotDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lot = getLotById(id);

  if (!lot) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-4xl mb-2">🍵</p>
          <h1 className="text-xl font-semibold">Lot not found</h1>
          <p className="text-muted text-sm mt-1">This auction may have been removed.</p>
        </div>
      </div>
    );
  }

  const bids = getBidsForLot(id);
  const seller = lot.seller || sellers.find((s) => s.id === lot.seller_id);

  return <LotDetailClient lot={lot} bids={bids} seller={seller!} />;
}
