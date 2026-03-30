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
import { propsSchema, type AircraftListProps, type AircraftSummary } from "./types";

export const widgetMetadata: WidgetMetadata = {
  exposeAsTool: false,
  props: propsSchema,
};

type ManufacturerFilter = "All" | "Boeing" | "Airbus" | "Embraer" | "Bombardier" | "Other";
type TypeFilter = "All" | "Narrow-body" | "Wide-body" | "Regional" | "Turboprop";
type SortOption = "Name" | "Safety Score" | "Deliveries" | "In Service";

function getSafetyColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 80) return "#65a30d";
  if (score >= 70) return "#ea580c";
  return "#dc2626";
}

function getManufacturerBadgeClasses(manufacturer: string): string {
  const m = manufacturer.toLowerCase();
  if (m === "boeing") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (m === "airbus") return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

function getTypeBadgeClasses(): string {
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface-elevated rounded-2xl p-4 space-y-3 border border-default">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AircraftCard({
  aircraft,
  onSelect,
}: {
  aircraft: AircraftSummary;
  onSelect: (id: string) => void;
}) {
  const color = getSafetyColor(aircraft.safetyRecordScore);

  return (
    <button
      onClick={() => onSelect(aircraft.id)}
      className="bg-surface-elevated rounded-2xl p-4 border border-default text-left w-full hover:border-info transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-default font-semibold text-sm leading-tight">
          {aircraft.model}
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${getManufacturerBadgeClasses(aircraft.manufacturer)}`}
        >
          {aircraft.manufacturer}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${getTypeBadgeClasses()}`}
        >
          {aircraft.type}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-secondary">Safety Score</span>
          <span className="text-xs font-semibold" style={{ color }}>
            {aircraft.safetyRecordScore}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${aircraft.safetyRecordScore}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        <div>
          <span className="text-xs text-secondary">Deliveries</span>
          <p className="text-xs font-medium text-default">
            {aircraft.totalDeliveries.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-xs text-secondary">In Service</span>
          <p className="text-xs font-medium text-default">
            {aircraft.inServiceCount.toLocaleString()}
          </p>
        </div>
        <div>
          <span className="text-xs text-secondary">Range</span>
          <p className="text-xs font-medium text-default">
            {aircraft.range.toLocaleString()} nm
          </p>
        </div>
        <div>
          <span className="text-xs text-secondary">Capacity</span>
          <p className="text-xs font-medium text-default">
            {aircraft.typicalCapacity}
          </p>
        </div>
      </div>
    </button>
  );
}

function FilterPill({
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
      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors whitespace-nowrap ${
        active
          ? "bg-info text-white border-info"
          : "bg-surface text-secondary border-default hover:border-info"
      }`}
    >
      {label}
    </button>
  );
}

function AircraftListWidget() {
  const { props, isPending, callTool } = useWidget<AircraftListProps>();
  const [search, setSearch] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState<ManufacturerFilter>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("Name");

  const manufacturers: ManufacturerFilter[] = ["All", "Boeing", "Airbus", "Embraer", "Bombardier", "Other"];
  const types: TypeFilter[] = ["All", "Narrow-body", "Wide-body", "Regional", "Turboprop"];
  const sortOptions: SortOption[] = ["Name", "Safety Score", "Deliveries", "In Service"];

  const filtered = useMemo(() => {
    if (isPending || !props.aircraft) return [];

    let items = [...props.aircraft];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.model.toLowerCase().includes(q) ||
          a.manufacturer.toLowerCase().includes(q)
      );
    }

    if (manufacturerFilter !== "All") {
      if (manufacturerFilter === "Other") {
        const known = ["boeing", "airbus", "embraer", "bombardier"];
        items = items.filter((a) => !known.includes(a.manufacturer.toLowerCase()));
      } else {
        items = items.filter(
          (a) => a.manufacturer.toLowerCase() === manufacturerFilter.toLowerCase()
        );
      }
    }

    if (typeFilter !== "All") {
      items = items.filter(
        (a) => a.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    switch (sortBy) {
      case "Safety Score":
        items.sort((a, b) => b.safetyRecordScore - a.safetyRecordScore);
        break;
      case "Deliveries":
        items.sort((a, b) => b.totalDeliveries - a.totalDeliveries);
        break;
      case "In Service":
        items.sort((a, b) => b.inServiceCount - a.inServiceCount);
        break;
      case "Name":
      default:
        items.sort((a, b) => a.model.localeCompare(b.model));
        break;
    }

    return items;
  }, [isPending, props.aircraft, search, manufacturerFilter, typeFilter, sortBy]);

  const handleSelect = async (id: string) => {
    await callTool("get-aircraft-details", { id });
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
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-default text-lg font-bold">Aircraft Models</h2>
            <span className="text-xs text-secondary bg-surface-elevated px-2.5 py-1 rounded-full border border-default">
              {filtered.length} models
            </span>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search aircraft models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-surface text-default placeholder:text-secondary focus:outline-none focus:border-info"
          />

          {/* Filters */}
          <div className="space-y-2">
            <div>
              <span className="text-xs text-secondary font-medium mb-1 block">Manufacturer</span>
              <div className="flex flex-wrap gap-1.5">
                {manufacturers.map((m) => (
                  <FilterPill
                    key={m}
                    label={m}
                    active={manufacturerFilter === m}
                    onClick={() => setManufacturerFilter(m)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-secondary font-medium mb-1 block">Type</span>
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <FilterPill
                    key={t}
                    label={t}
                    active={typeFilter === t}
                    onClick={() => setTypeFilter(t)}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-secondary font-medium mb-1 block">Sort by</span>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((s) => (
                  <FilterPill
                    key={s}
                    label={s}
                    active={sortBy === s}
                    onClick={() => setSortBy(s)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary text-sm">No aircraft models match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((aircraft) => (
                <AircraftCard
                  key={aircraft.id}
                  aircraft={aircraft}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
}

export default AircraftListWidget;
