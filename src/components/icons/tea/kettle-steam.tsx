import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function KettleSteam({ size = 24, className, ...rest }: TeaIconProps) {
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
      <rect x="6" y="11" width="12" height="8" rx="2" />
      <path d="M9 11 L 9 8 Q 12 6, 15 8 L 15 11" />
      <path d="M18 14 Q 20.5 14, 20.5 16 Q 20.5 17.5, 19 17.5" />
      <path d="M8 19 L 8 20.5" />
      <path d="M16 19 L 16 20.5" />
      <path d="M9 5 Q 10 3, 9 1" opacity="0.6" />
      <path d="M12 5 Q 13 3, 12 1" opacity="0.6" />
      <path d="M15 5 Q 16 3, 15 1" opacity="0.6" />
    </svg>
  );
}
