import { useState, useMemo } from "react";
import {
  McpUseProvider,
  useWidget,
  useWidgetTheme,
  type WidgetMetadata,
} from "mcp-use/react";
import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import { Link } from "react-router";
import "../styles.css";
import { propsSchema, type AirportListProps, type AirportSummary } from "./types";

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
  "Latin America",
] as const;

type SortOption = "Name" | "Passengers" | "Country";
const SORT_OPTIONS: SortOption[] = ["Name", "Passengers", "Country"];

function formatPassengers(volume: number): string {
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M passengers`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K passengers`;
  }
  return `${volume} passengers`;
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="h-8 w-48 bg-surface-elevated rounded-lg animate-pulse" />
      <div className="h-10 w-full bg-surface-elevated rounded-lg animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-surface-elevated rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-elevated rounded-2xl p-4 space-y-3 animate-pulse">
            <div className="h-5 w-3/4 bg-surface rounded-md" />
            <div className="h-4 w-1/2 bg-surface rounded-md" />
            <div className="h-4 w-2/3 bg-surface rounded-md" />
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-surface rounded-md" />
              <div className="h-4 w-16 bg-surface rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AirportListContent() {
  const { props, isPending, callTool } = useWidget<AirportListProps>();
  const theme = useWidgetTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Name");

  const airports = props?.airports ?? [];

  const filteredAndSorted = useMemo(() => {
    let result = [...airports];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.iataCode.toLowerCase().includes(q) ||
          a.icaoCode.toLowerCase().includes(q)
      );
    }

    if (selectedRegion !== "All") {
      result = result.filter((a) => a.region === selectedRegion);
    }

    switch (sortBy) {
      case "Name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Passengers":
        result.sort((a, b) => b.passengerVolume - a.passengerVolume);
        break;
      case "Country":
        result.sort((a, b) => a.country.localeCompare(b.country));
        break;
    }

    return result;
  }, [airports, searchQuery, selectedRegion, sortBy]);

  const handleAirportClick = (airport: AirportSummary) => {
    callTool("get-airport-details", { id: airport.id });
  };

  if (isPending) {
    return (
      <McpUseProvider>
        <AppsSDKUIProvider linkComponent={Link}>
          <LoadingSkeleton />
        </AppsSDKUIProvider>
      </McpUseProvider>
    );
  }

  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <div className="p-4 space-y-4 bg-surface" data-theme={theme}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-default">Airports</h1>
            <span className="text-sm text-secondary">
              {filteredAndSorted.length} of {airports.length}
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, city, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-default bg-surface-elevated text-default placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-info"
          />

          {/* Filter pills */}
          <div className="space-y-2">
            {/* Region filters */}
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedRegion === region
                      ? "bg-info text-white"
                      : "bg-surface-elevated text-secondary hover:text-default"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary">Sort by:</span>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    sortBy === option
                      ? "bg-info text-white"
                      : "bg-surface-elevated text-secondary hover:text-default"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredAndSorted.map((airport) => (
              <button
                key={airport.id}
                onClick={() => handleAirportClick(airport)}
                className="text-left bg-surface-elevated border border-default rounded-2xl p-4 space-y-2 hover:border-info transition-colors cursor-pointer"
              >
                {/* Name + IATA badge */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-default truncate">
                    {airport.name}
                  </span>
                  <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-info/10 text-info rounded-md whitespace-nowrap">
                    {airport.iataCode}
                  </span>
                </div>

                {/* City + Country */}
                <p className="text-sm text-secondary">
                  {airport.city}, {airport.country}
                </p>

                {/* Passengers */}
                <p className="text-sm font-medium text-default">
                  {formatPassengers(airport.passengerVolume)}
                </p>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-secondary">
                  <span>{airport.runwayCount} runways</span>
                  <span>{airport.terminals} terminals</span>
                  {airport.safetyCertifications.length > 0 && (
                    <span className="px-2 py-0.5 bg-positive/10 text-positive rounded-full">
                      {airport.safetyCertifications.length} certs
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filteredAndSorted.length === 0 && (
            <div className="text-center py-8 text-secondary">
              No airports match your search criteria.
            </div>
          )}
        </div>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
}

export default AirportListContent;
