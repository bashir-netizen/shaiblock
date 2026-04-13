import type { LotStatus } from "@/lib/types";
import { getTimeRemaining } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LotStatusBadgeProps {
  status: LotStatus;
  endTime?: string;
}

export function LotStatusBadge({ status, endTime }: LotStatusBadgeProps) {
  // Active lot — check if ending soon
  if (status === "active" && endTime) {
    const { total } = getTimeRemaining(endTime);
    const minutesLeft = total / 1000 / 60;

    if (minutesLeft <= 10 && minutesLeft > 0) {
      return (
        <Badge variant="warning" className="gap-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          ENDING SOON
        </Badge>
      );
    }

    return (
      <Badge variant="danger" className="gap-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        LIVE
      </Badge>
    );
  }

  switch (status) {
    case "sold":
      return <Badge variant="success">SOLD</Badge>;
    case "buy_now_sold":
      return <Badge variant="success">BUY NOW SOLD</Badge>;
    case "counter_offer":
      return <Badge variant="warning">COUNTER OFFER</Badge>;
    case "unsold":
      return <Badge variant="outline">UNSOLD</Badge>;
    default:
      return (
        <Badge variant="outline">
          {status.replace(/_/g, " ").toUpperCase()}
        </Badge>
      );
  }
}
