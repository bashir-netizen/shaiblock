import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Gavel({ size = 24, className, ...rest }: TeaIconProps) {
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
      <rect x="11" y="3" width="10" height="4" rx="0.5" transform="rotate(45 11 3)" />
      <path d="M13 9 L 6 16" />
      <rect x="3" y="17" width="10" height="3" rx="0.5" />
    </svg>
  );
}
