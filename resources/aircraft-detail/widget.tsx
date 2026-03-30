import React from "react";
import {
  McpUseProvider,
  useWidget,
  useWidgetTheme,
  type WidgetMetadata,
} from "mcp-use/react";
import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import { Link } from "react-router";
import "../styles.css";
import { propsSchema, type AircraftDetailProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  exposeAsTool: false,
  props: propsSchema,
};

function getSafetyColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 80) return "#65a30d";
  if (score >= 70) return "#ea580c";
  return "#dc2626";
}

function getSafetyLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Moderate";
  return "Poor";
}

function getAccidentRateColor(rate: number): string {
  if (rate <= 0.2) return "#16a34a";
  if (rate <= 0.5) return "#65a30d";
  if (rate <= 1.0) return "#ea580c";
  return "#dc2626";
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  index,
}: {
  label: string;
  value: string;
  index: number;
}) {
  return (
    <div
      className={`flex justify-between items-center px-3 py-2 rounded-lg ${
        index % 2 === 0
          ? "bg-surface"
          : "bg-surface-elevated"
      }`}
    >
      <span className="text-xs text-secondary">{label}</span>
      <span className="text-xs font-medium text-default">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-surface-elevated rounded-2xl border border-default p-3 text-center flex-1 min-w-0">
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-secondary mt-0.5 truncate">{label}</p>
    </div>
  );
}

function AircraftDetailWidget() {
  const { props, isPending } = useWidget<AircraftDetailProps>();

  if (isPending || !props.model) {
    return (
      <McpUseProvider>
        <AppsSDKUIProvider linkComponent={Link}>
          <LoadingSkeleton />
        </AppsSDKUIProvider>
      </McpUseProvider>
    );
  }

  const safetyColor = getSafetyColor(props.safetyRecordScore);
  const safetyLabel = getSafetyLabel(props.safetyRecordScore);
  const accidentColor = getAccidentRateColor(props.accidentRate);
  const fatalityColor = props.totalFatalities === 0 ? "#16a34a" : props.totalFatalities < 100 ? "#ea580c" : "#dc2626";
  const accidentCountColor = props.totalAccidents === 0 ? "#16a34a" : props.totalAccidents < 10 ? "#ea580c" : "#dc2626";

  const topOperators = props.topOperators ?? [];
  const notableIncidents = props.notableIncidents ?? [];

  const maxOperatorCount = topOperators.length > 0
    ? Math.max(...topOperators.map((o) => o.count))
    : 1;

  const sortedOperators = [...topOperators].sort((a, b) => b.count - a.count);

  const specs = [
    { label: "First Flight", value: String(props.firstFlight) },
    { label: "Range", value: `${props.range.toLocaleString()} nm` },
    { label: "Typical Capacity", value: props.typicalCapacity },
    { label: "Max Capacity", value: String(props.maxCapacity) },
    { label: "Engines", value: `${props.engineCount}x ${props.engineType}` },
    { label: "Length", value: `${props.length} m` },
    { label: "Wingspan", value: `${props.wingspan} m` },
    { label: "Total Orders", value: props.totalOrders.toLocaleString() },
    { label: "Total Deliveries", value: props.totalDeliveries.toLocaleString() },
    { label: "In Service", value: props.inServiceCount.toLocaleString() },
  ];

  const manufacturerBadge =
    props.manufacturer.toLowerCase() === "boeing"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      : props.manufacturer.toLowerCase() === "airbus"
        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <div className="p-4 space-y-5">
          {/* Header */}
          <div>
            <h1 className="text-default text-xl font-bold">{props.model}</h1>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${manufacturerBadge}`}>
                {props.manufacturer}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full capitalize bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {props.type}
              </span>
            </div>
          </div>

          {/* Safety Score Hero */}
          <div className="flex items-center gap-4 bg-surface-elevated rounded-2xl border border-default p-4">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{
                width: 72,
                height: 72,
                backgroundColor: `${safetyColor}18`,
                border: `3px solid ${safetyColor}`,
              }}
            >
              <span className="text-2xl font-bold" style={{ color: safetyColor }}>
                {props.safetyRecordScore}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-default">Safety Score</p>
              <p className="text-xs mt-0.5" style={{ color: safetyColor }}>
                {safetyLabel}
              </p>
              <p className="text-xs text-secondary mt-1">
                Accident rate: {props.accidentRate} per M departures
              </p>
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-default text-sm font-semibold mb-2">Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {specs.map((spec, i) => (
                <SpecRow key={spec.label} label={spec.label} value={spec.value} index={i} />
              ))}
            </div>
          </div>

          {/* Safety Statistics */}
          <div>
            <h2 className="text-default text-sm font-semibold mb-2">Safety Statistics</h2>
            <div className="flex gap-2">
              <StatCard
                label="Safety Score"
                value={String(props.safetyRecordScore)}
                color={safetyColor}
              />
              <StatCard
                label="Accident Rate / M Dep"
                value={String(props.accidentRate)}
                color={accidentColor}
              />
              <StatCard
                label="Total Accidents"
                value={String(props.totalAccidents)}
                color={accidentCountColor}
              />
              <StatCard
                label="Total Fatalities"
                value={props.totalFatalities.toLocaleString()}
                color={fatalityColor}
              />
            </div>
          </div>

          {/* Notable Incidents */}
          {notableIncidents.length > 0 && (
            <div>
              <h2 className="text-default text-sm font-semibold mb-2">Notable Incidents</h2>
              <div className="space-y-2">
                {notableIncidents.map((incident, i) => (
                  <div
                    key={i}
                    className="bg-surface-elevated rounded-xl border border-default p-3"
                    style={{ borderLeft: `3px solid ${i % 2 === 0 ? "#ea580c" : "#dc2626"}` }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-default">{incident.date}</span>
                      <span className="text-xs text-secondary">{incident.location}</span>
                    </div>
                    <p className="text-xs text-secondary mb-1">
                      <span className="font-medium text-default">{incident.airline}</span>
                    </p>
                    <p className="text-xs text-secondary leading-relaxed">{incident.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Operators */}
          {sortedOperators.length > 0 && (
            <div>
              <h2 className="text-default text-sm font-semibold mb-2">Top Operators</h2>
              <div className="space-y-1.5">
                {sortedOperators.map((op) => {
                  const widthPct = Math.max((op.count / maxOperatorCount) * 100, 4);
                  return (
                    <div key={op.airline} className="flex items-center gap-2">
                      <span className="text-xs text-default w-32 shrink-0 truncate font-medium">
                        {op.airline}
                      </span>
                      <div className="flex-1 h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-info transition-all"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-secondary w-10 text-right shrink-0">
                        {op.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
}

export default AircraftDetailWidget;
