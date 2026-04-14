import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function TeaChest({ size = 24, className, ...rest }: TeaIconProps) {
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
      <rect x="3" y="7" width="18" height="13" rx="1" />
      <path d="M3 11 L 21 11" />
      <path d="M3 7 L 5 5 L 19 5 L 21 7" />
      <circle cx="12" cy="15.5" r="2" />
      <path d="M10.5 14 L 13.5 17" opacity="0.6" />
    </svg>
  );
}
