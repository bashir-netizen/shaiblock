import type { SVGProps } from "react";

interface TeaIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function Cardamom({ size = 24, className, ...rest }: TeaIconProps) {
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
      <path d="M12 3 L 12 4.5" />
      <ellipse cx="12" cy="13" rx="5" ry="8" />
      <path d="M12 6 L 12 21" opacity="0.5" />
      <path d="M7.5 13 L 16.5 13" opacity="0.3" />
    </svg>
  );
}
