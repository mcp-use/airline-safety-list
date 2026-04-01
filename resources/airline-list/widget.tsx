import React, { useState, useMemo } from "react";
import {
  McpUseProvider,
  useWidget,
  useWidgetTheme,
  type WidgetMetadata,
} from "mcp-use/react";
import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import { Link } from "react-router";
import "../styles.css";
import { propsSchema, type AirlineListProps, type AirlineSummary } from "./types";

export const widgetMetadata: WidgetMetadata = {
  exposeAsTool: false,
  props: propsSchema,
};

const REGIONS = [
  "All",
  "Europe",
  "North America",
  "Asia-Pacific",
  "Middle East",
  "Africa",
  "Latin America",
] as const;

const ALLIANCES = [
  "All",
  "Star Alliance",
  "oneworld",
  "SkyTeam",
  "Independent",
] as const;

type SortOption = "Name" | "Safety Rating" | "Fleet Size";
const SORT_OPTIONS: SortOption[] = ["Name", "Safety Rating", "Fleet Size"];

function getSafetyColor(rating: number): string {
  if (rating >= 7) return "#16a34a";
  if (rating >= 5) return "#65a30d";
  if (rating >= 3) return "#ea580c";
  return "#dc2626";
}

function StarIcon({
  filled,
  color,
}: {
  filled: boolean;
  color: string;
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={filled ? color : "#d1d5db"}
      strokeWidth="1.5"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </svg>
  );
}

function SafetyStars({ rating }: { rating: number }) {
  const color = getSafetyColor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 7 }, (_, i) => (
        <StarIcon key={i} filled={i < rating} color={color} />
      ))}
      <span
        className="ml-1.5 text-xs font-semibold"
        style={{ color }}
      >
        {rating}/7
      </span>
    </div>
  );
}

function AirlineCard({
  airline,
  onSelect,
}: {
  airline: AirlineSummary;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(airline.id)}
      className="bg-surface-elevated border border-default rounded-xl p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
    >
      {/* Header: name + IATA badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-default font-semibold text-sm leading-tight">
          {airline.name}
        </h3>
        <span className="shrink-0 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-md">
          {airline.iataCode}
        </span>
      </div>

      {/* Country & region */}
      <p className="text-secondary text-xs mb-3">
        {airline.country} &middot; {airline.region}
      </p>

      {/* Safety rating */}
      <div className="mb-3">
        <SafetyStars rating={airline.safetyRating} />
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {/* IOSA badge */}
        {airline.iosaRegistered ? (
          <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium px-2 py-0.5 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            IOSA
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            IOSA
          </span>
        )}

        {/* Alliance badge */}
        {airline.alliance && (
          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium px-2 py-0.5 rounded-full">
            {airline.alliance}
          </span>
        )}

        {/* EU ban status */}
        {airline.euBanStatus !== "clear" && (
          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold px-2 py-0.5 rounded-full uppercase">
            EU {airline.euBanStatus}
          </span>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-secondary">
        <span className="flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
          </svg>
          {airline.fleetSize} aircraft
        </span>
        <span className="flex items-center gap-1">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
            <path d="M2 12h20" />
          </svg>
          {airline.destinations} dest.
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-surface-elevated border border-default rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-10" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/5 mb-3" />
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="h-3.5 w-3.5 bg-gray-200 dark:bg-gray-700 rounded-sm" />
        ))}
      </div>
      <div className="flex gap-1.5 mb-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4">
      {/* Header skeleton */}
      <div className="mb-4">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72 animate-pulse" />
      </div>
      {/* Search bar skeleton */}
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 animate-pulse" />
      {/* Filter pills skeleton */}
      <div className="flex gap-2 mb-4 animate-pulse">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        ))}
      </div>
      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-150 whitespace-nowrap ${
        active
          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500 dark:border-blue-500"
          : "bg-surface border-default text-secondary hover:text-default hover:border-gray-400 dark:hover:border-gray-500"
      }`}
    >
      {label}
    </button>
  );
}

function AirlineListContent() {
  const { props, isPending, callTool } = useWidget<AirlineListProps>();
  const theme = useWidgetTheme();

  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedAlliance, setSelectedAlliance] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Name");

  const airlines = props?.airlines ?? [];

  const handleSelect = (id: string) => {
    callTool("get-airline-details", { id });
  };

  const filtered = useMemo(() => {
    let result = [...airlines];

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.iataCode.toLowerCase().includes(q) ||
          a.icaoCode.toLowerCase().includes(q)
      );
    }

    // Region filter
    if (selectedRegion !== "All") {
      result = result.filter((a) => a.region === selectedRegion);
    }

    // Alliance filter
    if (selectedAlliance !== "All") {
      if (selectedAlliance === "Independent") {
        result = result.filter((a) => !a.alliance);
      } else {
        result = result.filter((a) => a.alliance === selectedAlliance);
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "Safety Rating":
          return b.safetyRating - a.safetyRating;
        case "Fleet Size":
          return b.fleetSize - a.fleetSize;
        case "Name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [airlines, search, selectedRegion, selectedAlliance, sortBy]);

  if (isPending) {
    return (
      <div data-theme={theme}>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div data-theme={theme} className="p-4 h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="heading-xl text-default font-bold">Airlines</h1>
          <span className="text-secondary text-sm font-medium">
            {airlines.length} total
          </span>
        </div>
        <p className="text-secondary text-sm mt-0.5">
          Browse airlines by region, alliance, and safety rating
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by airline name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 text-sm bg-surface border border-default rounded-lg text-default placeholder:text-secondary/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filter rows */}
      <div className="space-y-2 mb-4">
        {/* Region pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-secondary font-medium shrink-0">Region:</span>
          <div className="flex gap-1.5">
            {REGIONS.map((region) => (
              <PillButton
                key={region}
                label={region}
                active={selectedRegion === region}
                onClick={() => setSelectedRegion(region)}
              />
            ))}
          </div>
        </div>

        {/* Alliance pills + sort */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-secondary font-medium shrink-0">Alliance:</span>
            <div className="flex gap-1.5">
              {ALLIANCES.map((alliance) => (
                <PillButton
                  key={alliance}
                  label={alliance}
                  active={selectedAlliance === alliance}
                  onClick={() => setSelectedAlliance(alliance)}
                />
              ))}
            </div>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-secondary font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-surface border border-default rounded-lg px-2 py-1 text-default focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      {filtered.length !== airlines.length && (
        <p className="text-secondary text-xs mb-3">
          Showing {filtered.length} of {airlines.length} airlines
        </p>
      )}

      {/* Card grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((airline) => (
            <AirlineCard
              key={airline.id}
              airline={airline}
              onSelect={handleSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-secondary text-sm">
            No airlines match your current filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedRegion("All");
              setSelectedAlliance("All");
            }}
            className="mt-2 text-info text-sm font-medium hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function AirlineListWidget() {
  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <AirlineListContent />
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
}
