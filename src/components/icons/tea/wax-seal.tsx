import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function WaxSeal({ size = 24, className, ...rest }: TeaIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="10" r="6" />
      <circle cx="12" cy="10" r="3" />
      <path d="M8 15 L 7 22 L 10 20" />
      <path d="M16 15 L 17 22 L 14 20" />
    </svg>
  );
}
