"use client";

import { useEffect, useState } from "react";
import { getTimeRemaining, formatCountdown, getCountdownColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: string;
  size?: "sm" | "lg";
  showLabel?: boolean;
}

export function CountdownTimer({
  endTime,
  size = "sm",
  showLabel = false,
}: CountdownTimerProps) {
  const [display, setDisplay] = useState(() => formatCountdown(endTime));
  const [color, setColor] = useState(() => getCountdownColor(endTime));
  const [expired, setExpired] = useState(
    () => getTimeRemaining(endTime).expired
  );

  useEffect(() => {
    const tick = () => {
      const remaining = getTimeRemaining(endTime);
      setDisplay(formatCountdown(endTime));
      setColor(getCountdownColor(endTime));
      setExpired(remaining.expired);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (expired) {
    return (
      <span
        className={cn(
          "tabular-nums text-muted",
          size === "lg" ? "text-2xl font-bold" : "text-sm"
        )}
      >
        ENDED
      </span>
    );
  }

  const isUrgent = getTimeRemaining(endTime).total / 1000 / 60 <= 3;

  return (
    <span
      className={cn(
        "tabular-nums font-mono",
        color,
        isUrgent && "animate-pulse-danger",
        size === "lg" ? "text-2xl font-bold" : "text-sm"
      )}
    >
      {showLabel && <span className="text-muted mr-1 text-xs">Ends in</span>}
      {display}
    </span>
  );
}
