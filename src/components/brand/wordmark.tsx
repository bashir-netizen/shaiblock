import { cva, type VariantProps } from "class-variance-authority";
import { LeafMark } from "@/components/icons/tea";
import { cn } from "@/lib/utils";

// ============================================================
// Wordmark — brand lockup for ShaiBlock
// ----------------------------------------------------------------
// Composition: <LeafMark /> + Arabic "شاي" + "ShaiBlock" in serif.
// Three variants:
//   - horizontal (default): LeafMark | ShaiBlock | شاي
//   - stacked: LeafMark on top, ShaiBlock + شاي below
//   - mark-only: just the LeafMark (collapsed TopNav, favicons)
// ============================================================

const wordmarkVariants = cva("inline-flex items-center gap-2 select-none", {
  variants: {
    variant: {
      horizontal: "flex-row",
      stacked: "flex-col items-start gap-0",
      "mark-only": "",
    },
    size: {
      sm: "[--wordmark-mark:20px] [--wordmark-text:1rem]",
      md: "[--wordmark-mark:28px] [--wordmark-text:1.25rem]",
      lg: "[--wordmark-mark:40px] [--wordmark-text:1.75rem]",
    },
  },
  defaultVariants: {
    variant: "horizontal",
    size: "md",
  },
});

export interface WordmarkProps
  extends VariantProps<typeof wordmarkVariants> {
  className?: string;
}

export function Wordmark({ variant, size, className }: WordmarkProps) {
  const showText = variant !== "mark-only";
  return (
    <div
      className={cn(wordmarkVariants({ variant, size }), className)}
      aria-label="ShaiBlock"
    >
      <LeafMark
        style={{ width: "var(--wordmark-mark)", height: "var(--wordmark-mark)" }}
        className="text-primary shrink-0"
      />
      {showText && (
        <div
          className={cn(
            "flex items-baseline gap-1.5 leading-none",
            variant === "stacked" && "mt-1"
          )}
        >
          <span
            className="font-serif font-bold text-ink"
            style={{ fontSize: "var(--wordmark-text)" }}
          >
            ShaiBlock
          </span>
          <span
            className="font-arabic text-accent font-bold"
            dir="rtl"
            lang="ar"
            style={{ fontSize: "calc(var(--wordmark-text) * 0.85)" }}
          >
            شاي
          </span>
        </div>
      )}
    </div>
  );
}
