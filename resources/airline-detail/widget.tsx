import { McpUseProvider, useWidget, useWidgetTheme, type WidgetMetadata } from "mcp-use/react";
import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import { Link } from "react-router";
import "../styles.css";
import { propsSchema, type AirlineDetailProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Full airline profile with safety breakdown, fleet composition, and incident history",
  props: propsSchema,
  exposeAsTool: false,
};

/* ---------- helpers ---------- */

function ratingColor(rating: number): string {
  if (rating >= 7) return "#16a34a";
  if (rating >= 5) return "#65a30d";
  if (rating >= 3) return "#ea580c";
  return "#dc2626";
}

function ratingLabel(rating: number): string {
  const labels: Record<number, string> = {
    7: "Excellent",
    6: "Very Good",
    5: "Good",
    4: "Average",
    3: "Below Average",
    2: "Poor",
    1: "Poor",
  };
  return labels[rating] ?? "Unknown";
}

function severityColor(severity: "minor" | "serious" | "fatal"): string {
  if (severity === "fatal") return "#dc2626";
  if (severity === "serious") return "#ea580c";
  return "#3b82f6";
}

function severityBg(severity: "minor" | "serious" | "fatal"): string {
  if (severity === "fatal") return "rgba(220,38,38,0.12)";
  if (severity === "serious") return "rgba(234,88,12,0.12)";
  return "rgba(59,130,246,0.12)";
}

function auditBadgeColor(grade: string): string {
  if (grade === "A") return "#16a34a";
  if (grade === "B") return "#65a30d";
  return "#ea580c";
}

function formatPassengers(millions: number): string {
  return millions >= 1000 ? `${(millions / 1000).toFixed(1)}B` : `${millions}M`;
}

/* ---------- star icon ---------- */

function StarIcon({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={filled ? color : "currentColor"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: filled ? 1 : 0.25 }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ---------- skeleton loader ---------- */

function Skeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-64 bg-surface-elevated rounded-lg" />
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-surface-elevated rounded" />
          <div className="h-5 w-16 bg-surface-elevated rounded" />
          <div className="h-5 w-24 bg-surface-elevated rounded" />
        </div>
      </div>
      {/* rating skeleton */}
      <div className="bg-surface-elevated rounded-2xl p-5 space-y-3">
        <div className="h-5 w-32 bg-surface rounded-lg" />
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-6 w-6 bg-surface rounded" />
          ))}
        </div>
      </div>
      {/* grid skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-elevated rounded-xl p-4 space-y-2">
            <div className="h-3 w-20 bg-surface rounded" />
            <div className="h-6 w-16 bg-surface rounded" />
          </div>
        ))}
      </div>
      {/* safety breakdown skeleton */}
      <div className="bg-surface-elevated rounded-2xl p-5 space-y-3">
        <div className="h-5 w-40 bg-surface rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-3 space-y-2">
              <div className="h-3 w-24 bg-surface-elevated rounded" />
              <div className="h-5 w-12 bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* fleet skeleton */}
      <div className="bg-surface-elevated rounded-2xl p-5 space-y-3">
        <div className="h-5 w-44 bg-surface rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-32 bg-surface rounded" />
            <div className="h-3 flex-1 bg-surface rounded" />
            <div className="h-4 w-8 bg-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- main widget content ---------- */

function AirlineDetailContent() {
  const { props, isPending } = useWidget<AirlineDetailProps>();
  const theme = useWidgetTheme();
  const isDark = theme === "dark";

  if (isPending || !props.name) {
    return <Skeleton />;
  }

  const color = ratingColor(props.safetyRating);
  const label = ratingLabel(props.safetyRating);

  const fleetComposition = props.fleetComposition ?? [];
  const incidentHistory = props.incidentHistory ?? [];

  const sortedFleet = [...fleetComposition].sort((a, b) => b.count - a.count);
  const maxFleetCount = sortedFleet.length > 0 ? sortedFleet[0].count : 1;

  const sortedIncidents = [...incidentHistory].sort((a, b) => b.year - a.year);

  return (
    <div className="p-6 space-y-5">
      {/* ===== Header ===== */}
      <div>
        <h1
          className="text-default font-bold tracking-tight"
          style={{ fontSize: "1.75rem", lineHeight: "2rem", margin: 0 }}
        >
          {props.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className="text-secondary font-mono text-sm px-2 py-0.5 rounded"
            style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}
          >
            {props.iataCode} / {props.icaoCode}
          </span>
          <span className="text-secondary text-sm">{props.country}</span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
            }}
          >
            {props.region}
          </span>
          {props.alliance && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(59,130,246,0.12)",
                color: "#3b82f6",
              }}
            >
              {props.alliance}
            </span>
          )}
          {props.euBanStatus !== "clear" && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase"
              style={{
                background: props.euBanStatus === "banned" ? "rgba(220,38,38,0.12)" : "rgba(234,88,12,0.12)",
                color: props.euBanStatus === "banned" ? "#dc2626" : "#ea580c",
              }}
            >
              EU {props.euBanStatus}
            </span>
          )}
        </div>
      </div>

      {/* ===== Safety Rating ===== */}
      <div className="bg-surface-elevated rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-default font-semibold"
            style={{ fontSize: "1rem", margin: 0 }}
          >
            Safety Rating
          </h2>
          {props.iosaRegistered && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(22,163,74,0.12)",
                color: "#16a34a",
              }}
            >
              IOSA Registered
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-0.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <StarIcon key={i} filled={i < props.safetyRating} color={color} />
            ))}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-bold"
              style={{ color }}
            >
              {props.safetyRating}/7
            </span>
            <span
              className="text-sm font-medium"
              style={{ color }}
            >
              {label}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Key Facts Grid ===== */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Founded", value: String(props.founded) },
          { label: "Fleet Size", value: String(props.fleetSize) },
          { label: "Destinations", value: String(props.destinations) },
          { label: "Annual Passengers", value: formatPassengers(props.annualPassengers) },
          { label: "Fatalities (10yr)", value: String(props.fatalities10yr) },
          { label: "Incidents (10yr)", value: String(props.incidents10yr) },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-surface-elevated rounded-xl p-4"
          >
            <div className="text-secondary text-xs font-medium mb-1">
              {item.label}
            </div>
            <div className="text-default text-xl font-bold">
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Safety Breakdown ===== */}
      <div>
        <h2
          className="text-default font-semibold mb-3"
          style={{ fontSize: "1rem", margin: 0, marginBottom: "0.75rem" }}
        >
          Safety Breakdown
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-elevated rounded-xl p-4">
            <div className="text-secondary text-xs font-medium mb-1">
              Government Audit
            </div>
            <span
              className="inline-block text-sm font-bold px-2.5 py-0.5 rounded-full"
              style={{
                background: `${auditBadgeColor(props.safetyBreakdown.governmentAuditRating)}18`,
                color: auditBadgeColor(props.safetyBreakdown.governmentAuditRating),
              }}
            >
              {props.safetyBreakdown.governmentAuditRating}
            </span>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4">
            <div className="text-secondary text-xs font-medium mb-1">
              Operational History
            </div>
            <div className="text-default text-sm font-bold">
              {props.safetyBreakdown.operationalHistory}
            </div>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4">
            <div className="text-secondary text-xs font-medium mb-1">
              Fatal Accidents (7yr)
            </div>
            <div
              className="text-xl font-bold"
              style={{
                color: props.safetyBreakdown.fatalAccidents7yr === 0 ? "#16a34a" : "#dc2626",
              }}
            >
              {props.safetyBreakdown.fatalAccidents7yr}
            </div>
          </div>
          <div className="bg-surface-elevated rounded-xl p-4">
            <div className="text-secondary text-xs font-medium mb-1">
              Serious Incidents
            </div>
            <div
              className="text-xl font-bold"
              style={{
                color: props.safetyBreakdown.seriousIncidents === 0 ? "#16a34a" : "#ea580c",
              }}
            >
              {props.safetyBreakdown.seriousIncidents}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Fleet Composition ===== */}
      <div>
        <h2
          className="text-default font-semibold mb-3"
          style={{ fontSize: "1rem", margin: 0, marginBottom: "0.75rem" }}
        >
          Fleet Composition
        </h2>
        <div className="bg-surface-elevated rounded-2xl p-4 space-y-3">
          {sortedFleet.map((entry) => (
            <div key={entry.aircraftModel}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-default text-sm font-medium">
                  {entry.aircraftModel}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-secondary text-xs">
                    avg {entry.averageAge.toFixed(1)} yr
                  </span>
                  <span className="text-default text-sm font-bold w-8 text-right">
                    {entry.count}
                  </span>
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(entry.count / maxFleetCount) * 100}%`,
                    background: `linear-gradient(90deg, ${isDark ? "#6366f1" : "#4f46e5"}, ${isDark ? "#818cf8" : "#6366f1"})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Incident History ===== */}
      {sortedIncidents.length > 0 && (
        <div>
          <h2
            className="text-default font-semibold mb-3"
            style={{ fontSize: "1rem", margin: 0, marginBottom: "0.75rem" }}
          >
            Incident History
          </h2>
          <div className="space-y-2">
            {sortedIncidents.map((incident, idx) => (
              <div
                key={`${incident.year}-${idx}`}
                className="bg-surface-elevated rounded-xl p-4 flex gap-3"
              >
                <div className="flex flex-col items-center shrink-0" style={{ width: 44 }}>
                  <span className="text-default text-sm font-bold">{incident.year}</span>
                  <div
                    className="w-0.5 flex-1 mt-1 rounded-full"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                      minHeight: 8,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase"
                      style={{
                        background: severityBg(incident.severity),
                        color: severityColor(incident.severity),
                      }}
                    >
                      {incident.severity}
                    </span>
                  </div>
                  <p
                    className="text-secondary text-sm leading-relaxed"
                    style={{ margin: 0 }}
                  >
                    {incident.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- default export ---------- */

const AirlineDetail: React.FC = () => {
  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <AirlineDetailContent />
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
};

export default AirlineDetail;
