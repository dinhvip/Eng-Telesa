"use client";

import Image from "next/image";

type ArrowUpIconProps = {
  size?: number;
  color?: "default" | "white";
  className?: string;
};

export default function ArrowUpIcon({
  size = 20,
  color = "default",
  className,
}: ArrowUpIconProps) {
  return (
    <Image
      src="/assets/svg/arrow-up.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={[
        color === "white" ? "brightness-0 invert" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

