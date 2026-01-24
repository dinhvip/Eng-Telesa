"use client";

import Image from "next/image";
import ArrowUpIcon from "./ArrowUpIcon";

type DesktopFloatingActionsProps = {
  variant: "kid" | "adult";
  onScrollToTop: () => void;
};

export default function DesktopFloatingActions({
  variant,
  onScrollToTop,
}: DesktopFloatingActionsProps) {
  const phoneIconSrc =
    variant === "adult" ? "/assets/svg/consult-pink.svg" : "/assets/svg/consult.svg";

  return (
    <div className="pointer-events-none fixed bottom-8 right-8 z-[9999] hidden lg:block">
      <div className="pointer-events-auto flex flex-col items-center gap-4">
        <button
          type="button"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F4F7] text-slate-700 shadow-md"
          aria-label="Gọi tư vấn"
        >
          <span className="telesa-wiggle inline-flex">
            <Image
              src={phoneIconSrc}
              alt=""
              width={22}
              height={22}
              className="h-6 w-6"
            />
          </span>
        </button>
        <button
          type="button"
          onClick={onScrollToTop}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F4F7] text-slate-700 shadow-md"
          aria-label="Lên đầu trang"
        >
          <span className="telesa-nudge inline-flex">
            <ArrowUpIcon size={22} className="h-6 w-6" />
          </span>
        </button>
      </div>
    </div>
  );
}
