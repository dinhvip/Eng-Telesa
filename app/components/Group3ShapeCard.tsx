"use client";

import { memo } from "react";

type Group3ShapeCardProps = {
  className?: string;
  title: string;
  subtitle: string;
  descriptionLines: string[];
  badgeText: string;
  topColor?: string;
  bottomColor?: string;
  bodyColor?: string;
  textColor?: string;
  textOffsetY?: number;
};

function Group3ShapeCardInner({
  className,
  title,
  subtitle,
  descriptionLines,
  badgeText,
  topColor = "#02B3F0",
  bottomColor,
  bodyColor = "#35C2F3",
  textColor = "#FFFFFF",
  textOffsetY = 0,
}: Group3ShapeCardProps) {
  const resolvedBottomColor = bottomColor ?? topColor;
  const textX = 84.5;
  const titleY = 26;
  const subtitleY = 42;
  const bodyStartY = 64;
  const lineHeight = 12;

  return (
    <svg
      className={className}
      width="133"
      height="222"
      viewBox="0 0 133 222"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <path
        d="M132.31 196.257H37.8984V32.522L84.0075 0L132.31 32.522V196.257Z"
        fill={topColor}
      />

      <g
        fill={textColor}
        textAnchor="middle"
        fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif'
      >
        <text x={textX} y={titleY + textOffsetY} fontSize="10.5" fontWeight="700">
          {title}
        </text>
        <text x={textX} y={subtitleY + textOffsetY} fontSize="9.5" fontWeight="600">
          {subtitle}
        </text>
        {descriptionLines.map((line, idx) => (
          <text
            key={`${idx}-${line}`}
            x={textX}
            y={bodyStartY + idx * lineHeight + textOffsetY}
            fontSize="9"
            fontWeight="500"
          >
            {line}
          </text>
        ))}
      </g>

      <path
        d="M132.309 196.257H37.8976L0.0214844 221.676H94.9848L132.309 196.257Z"
        fill={resolvedBottomColor}
      />
      <path
        d="M94.9623 221.675V178.182C94.9623 165.536 89.2131 155.19 82.1865 155.19H12.7748C5.74925 155.19 0 165.537 0 178.182V221.675H94.9623Z"
        fill={bodyColor}
      />

      <path
        d="M47.0719 167.236C35.4325 167.236 25.9961 176.659 25.9961 188.284C25.9961 199.907 35.4335 209.332 47.0719 209.332C58.7122 209.332 68.1487 199.907 68.1487 188.284C68.1487 176.658 58.7132 167.236 47.0719 167.236ZM47.0719 205.415C37.5981 205.415 29.918 197.745 29.918 188.284C29.918 178.821 37.599 171.152 47.0719 171.152C56.5476 171.152 64.2267 178.822 64.2267 188.284C64.2267 197.745 56.5476 205.415 47.0719 205.415Z"
        fill={textColor}
      />

      <text
        x="47.0719"
        y="188.284"
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily='system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif'
        fontSize="15"
        fontWeight="700"
      >
        {badgeText}
      </text>
    </svg>
  );
}

const Group3ShapeCard = memo(Group3ShapeCardInner);

export default Group3ShapeCard;
