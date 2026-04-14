import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ============================================================
// Button — 5 variants × 4 sizes
// Variants: primary (emerald), secondary (paper), ghost,
//           stamp (copper w/ wax border), danger (wax red)
// Sizes: sm 32px, md 40px, lg 48px, xl 56px
// Touch-target floor: md/lg/xl all ≥ 44px; sm is desktop-only
// ============================================================

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-[var(--color-primary-700)] shadow-[var(--shadow-paper)]",
        secondary:
          "bg-card text-foreground border border-border hover:bg-[var(--color-inset)]",
        ghost: "bg-transparent text-foreground hover:bg-[var(--color-inset)]",
        stamp:
          "bg-accent text-white border-2 border-[var(--color-wax)] shadow-[var(--shadow-stamp)] hover:brightness-110",
        danger:
          "bg-[var(--color-danger)] text-white hover:brightness-110 shadow-[var(--shadow-paper)]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
