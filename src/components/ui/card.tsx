import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Card — 3 surface variants: paper / raised / inset
// ============================================================

const cardVariants = cva("rounded-lg", {
  variants: {
    variant: {
      paper: "bg-card border border-border",
      raised: "bg-[var(--color-raised)] shadow-[var(--shadow-card)]",
      inset: "bg-[var(--color-inset)]",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "paper",
    padding: "md",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant, padding, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";
