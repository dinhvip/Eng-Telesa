"use client";

import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection } from "geojson";
import { memo, useId, useMemo, useState } from "react";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

import worldCountries110m from "world-atlas/countries-110m.json";

type CountryInfo = {
  id: string;
  name: string;
  learners: string;
  isoN3: number;
  coordinates: [number, number]; // [lng, lat]
  flag: string;
};

const countries: CountryInfo[] = [
  {
    id: "canada",
    name: "Canada",
    learners: "4,281",
    isoN3: 124,
    coordinates: [-106.3468, 56.1304],
    flag: "🇨🇦",
  },
  {
    id: "brazil",
    name: "Brazil",
    learners: "1,980",
    isoN3: 76,
    coordinates: [-51.9253, -14.235],
    flag: "🇧🇷",
  },
  {
    id: "india",
    name: "India",
    learners: "3,420",
    isoN3: 356,
    coordinates: [78.9629, 20.5937],
    flag: "🇮🇳",
  },
  {
    id: "australia",
    name: "Australia",
    learners: "2,154",
    isoN3: 36,
    coordinates: [133.7751, -25.2744],
    flag: "🇦🇺",
  },
];

const MAP_WIDTH = 343;
const MAP_HEIGHT = 188;
const MAP_BG = "#273143";
const COUNTRY_FILL = "#D5D7DA";
const COUNTRY_HIGHLIGHT = "#FFCD33";

type KidWorldMapProps = {
  highlightColor?: string;
  variant?: "mobile" | "desktop";
  className?: string;
};

function KidWorldMapInner({
  highlightColor = COUNTRY_HIGHLIGHT,
  variant = "mobile",
  className,
}: KidWorldMapProps) {
  const [activeCountry, setActiveCountry] = useState<CountryInfo | null>(countries[0]);
  const glowId = useId();

  const { geo, path, projectPoint } = useMemo(() => {
    const topo = worldCountries110m as unknown as Topology<any>;
    const geoJson = feature(topo, topo.objects.countries) as unknown as FeatureCollection;

    const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geoJson);
    const pathGenerator = geoPath(projection);

    const project = (coordinates: [number, number]) => projection(coordinates) ?? null;

    return { geo: geoJson, path: pathGenerator, projectPoint: project };
  }, []);

  const highlighted = useMemo(() => new Set(countries.map((c) => c.isoN3)), []);

  const activePoint = useMemo(() => {
    if (!activeCountry) return null;
    const pt = projectPoint(activeCountry.coordinates);
    if (!pt) return null;
    return { x: pt[0], y: pt[1] };
  }, [activeCountry, projectPoint]);

  const activePointPct = useMemo(() => {
    if (!activePoint) return null;
    return {
      left: `${(activePoint.x / MAP_WIDTH) * 100}%`,
      top: `${(activePoint.y / MAP_HEIGHT) * 100}%`,
    };
  }, [activePoint]);

  const outerClassName = [
    variant === "desktop" ? "flex h-full w-full justify-center" : "w-full max-w-md",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mapWrapperClassName =
    variant === "desktop"
      ? "relative h-full w-auto max-w-full aspect-[343/188] min-h-[188px] rounded-[28px] bg-transparent shadow-none overflow-visible"
      : "relative w-full aspect-[343/188] min-h-[188px] rounded-[28px] bg-transparent shadow-none overflow-visible";

  const tooltipClassName =
    variant === "desktop"
      ? "relative w-[220px] max-w-[calc(100vw-40px)] rounded-[22px] bg-white px-5 py-4 text-slate-900 shadow-none"
      : "relative w-[200px] max-w-[calc(100vw-40px)] rounded-[22px] bg-white px-4 py-3 text-slate-900 shadow-none";

  const flagBoxClassName =
    variant === "desktop"
      ? "flex h-11 w-12 items-center justify-center rounded-2xl bg-[#ffe4a3] text-[24px]"
      : "flex h-10 w-11 items-center justify-center rounded-2xl bg-[#ffe4a3] text-[22px]";

  const mapGlowFilter = variant === "desktop" ? `url(#${glowId}-continentGlow)` : undefined;

  return (
    <div className={outerClassName}>
      <div
        className={mapWrapperClassName}
        onPointerDown={() => {
          if (activeCountry) setActiveCountry(null);
        }}
      >
        {/* Clip only the map (not the tooltip) */}
        <div className="absolute inset-0 overflow-hidden rounded-[28px]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            role="img"
            aria-label="Bản đồ thế giới với các điểm kết nối học viên"
            style={{ background: MAP_BG }}
          >
            <defs>
              <filter id={`${glowId}-continentGlow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="2.5"
                  floodColor="#ffffff"
                  floodOpacity="0.6"
                />
              </filter>
            </defs>

            {/* World map */}
            <g opacity={0.98} filter={mapGlowFilter}>
              {geo.features.map((f) => {
                const d = path(f);
                if (!d) return null;
                const id =
                  typeof f.id === "string"
                    ? Number.parseInt(f.id, 10)
                    : typeof f.id === "number"
                      ? f.id
                      : null;
                const isHighlighted = id != null && highlighted.has(id);

                return (
                  <path
                    key={`${f.id ?? d.slice(0, 20)}`}
                    d={d}
                    fill={isHighlighted ? highlightColor : COUNTRY_FILL}
                    stroke={MAP_BG}
                    strokeWidth={0.5}
                  />
                );
              })}
            </g>

            {/* Markers */}
            {countries.map((country) => {
              const pt = projectPoint(country.coordinates);
              if (!pt) return null;
              const [x, y] = pt;
              const dotR = 2.35;

              return (
                <g
                  key={country.id}
                  transform={`translate(${x}, ${y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Chọn ${country.name}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCountry(country);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveCountry(country);
                  }}
                  className="focus:outline-none focus-visible:outline-none"
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={dotR}
                    fill={highlightColor}
                    stroke={MAP_BG}
                    strokeWidth={0.75}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Tooltip (outside the clipping container) */}
        {activeCountry && activePointPct && (
          <div
            className="absolute z-20"
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              left: activePointPct.left,
              top: activePointPct.top,
              transform: "translate(-50%, calc(-100% - 18px))",
            }}
          >
            <div className={tooltipClassName}>
              <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-t-[14px] border-l-transparent border-r-transparent border-t-white" />
              <div className="flex items-center gap-3">
                <div className={flagBoxClassName}>{activeCountry.flag}</div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{activeCountry.name}</p>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-600">
                    <span aria-hidden="true">👤</span>
                    <span>{activeCountry.learners} học viên</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const KidWorldMap = memo(KidWorldMapInner);
