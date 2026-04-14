import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function LeafMark({ size = 24, className, ...rest }: TeaIconProps) {
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
      <path d="M12 20 C 7 17, 5 12, 7 6 C 10 7, 12 10, 12 14" />
      <path d="M12 20 C 17 17, 19 12, 17 6 C 14 7, 12 10, 12 14" />
      <path d="M12 14 L 12 20" />
      <circle cx="12" cy="4.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
