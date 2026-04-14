import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function CuppingBowl({ size = 24, className, ...rest }: TeaIconProps) {
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
      <ellipse cx="12" cy="14" rx="8.5" ry="2" />
      <path d="M3.5 14 C 3.5 18, 8 20.5, 12 20.5 C 16 20.5, 20.5 18, 20.5 14" />
      <ellipse cx="12" cy="14" rx="5.5" ry="1.2" opacity="0.6" />
      <ellipse cx="18" cy="9" rx="2" ry="1.1" transform="rotate(-25 18 9)" />
      <path d="M16.5 9.8 L 9 13" />
    </svg>
  );
}
