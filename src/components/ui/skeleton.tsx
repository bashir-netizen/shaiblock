import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Skeleton — paper-grain placeholder with breathing animation
// Respects prefers-reduced-motion (animation is disabled in globals.css)
// ============================================================

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ width, height, className, style, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-foreground/[0.06] animate-skeleton-breathe",
        className
      )}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
