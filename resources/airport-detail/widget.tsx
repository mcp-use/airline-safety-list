import {
  McpUseProvider,
  useWidget,
  useWidgetTheme,
  type WidgetMetadata,
} from "mcp-use/react";
import { AppsSDKUIProvider } from "@openai/apps-sdk-ui/components/AppsSDKUIProvider";
import { Link } from "react-router";
import "../styles.css";
import { propsSchema, type AirportDetailProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  exposeAsTool: false,
  props: propsSchema,
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatPassengersMillion(volume: number): string {
  return `${(volume / 1_000_000).toFixed(1)}M`;
}

function IlsBadge({ category }: { category: string }) {
  let colorClasses = "bg-surface text-secondary";
  if (category.includes("III")) {
    colorClasses = "bg-positive/10 text-positive";
  } else if (category.includes("II")) {
    colorClasses = "bg-warning/10 text-warning";
  }
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses}`}>
      {category}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-surface-elevated rounded-lg animate-pulse" />
        <div className="h-5 w-48 bg-surface-elevated rounded-md animate-pulse" />
        <div className="h-4 w-32 bg-surface-elevated rounded-md animate-pulse" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface-elevated rounded-2xl p-4 space-y-2 animate-pulse">
            <div className="h-3 w-20 bg-surface rounded-md" />
            <div className="h-6 w-16 bg-surface rounded-md" />
          </div>
        ))}
      </div>
      <div className="h-32 bg-surface-elevated rounded-2xl animate-pulse" />
    </div>
  );
}

function AirportDetailContent() {
  const { props, isPending } = useWidget<AirportDetailProps>();
  const theme = useWidgetTheme();

  if (isPending || !props.name) {
    return (
      <McpUseProvider>
        <AppsSDKUIProvider linkComponent={Link}>
          <LoadingSkeleton />
        </AppsSDKUIProvider>
      </McpUseProvider>
    );
  }

  const {
    name,
    iataCode,
    icaoCode,
    city,
    country,
    region,
    latitude,
    longitude,
    elevation,
    passengerVolume,
    runwayCount,
    terminals,
    annualOperations,
  } = props;
  const safetyCertifications = props.safetyCertifications ?? [];
  const runways = props.runways ?? [];

  const stats = [
    { label: "Passengers", value: formatPassengersMillion(passengerVolume) },
    { label: "Annual Operations", value: formatNumber(annualOperations) },
    { label: "Terminals", value: String(terminals) },
    { label: "Runways", value: String(runwayCount) },
    { label: "Elevation", value: `${formatNumber(elevation)} ft` },
    { label: "Coordinates", value: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` },
  ];

  return (
    <McpUseProvider>
      <AppsSDKUIProvider linkComponent={Link}>
        <div className="p-4 space-y-6 bg-surface" data-theme={theme}>
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-default">{name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-sm font-semibold bg-info/10 text-info rounded-md">
                {iataCode}
              </span>
              <span className="px-2 py-0.5 text-sm font-medium bg-surface-elevated text-secondary rounded-md">
                {icaoCode}
              </span>
            </div>
            <p className="text-sm text-secondary">
              {city}, {country}
            </p>
            <span className="inline-block px-3 py-1 text-xs font-medium bg-surface-elevated text-secondary rounded-full">
              {region}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface-elevated border border-default rounded-2xl p-4"
              >
                <p className="text-xs text-secondary mb-1">{stat.label}</p>
                <p className="text-lg font-bold text-default">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Safety Certifications */}
          {safetyCertifications.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-default">
                Safety Certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {safetyCertifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-3 py-1 text-xs font-medium bg-positive/10 text-positive rounded-full"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Runway Details */}
          {runways.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-default">
                Runway Details
              </h2>
              <div className="border border-default rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-elevated">
                      <th className="text-left px-4 py-2 text-xs font-medium text-secondary">
                        Designation
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-secondary">
                        Length (m)
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-secondary">
                        Surface
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-secondary">
                        ILS Category
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {runways.map((runway, index) => (
                      <tr
                        key={runway.designation}
                        className={index % 2 === 0 ? "bg-surface" : "bg-surface-elevated"}
                      >
                        <td className="px-4 py-2 font-medium text-default">
                          {runway.designation}
                        </td>
                        <td className="px-4 py-2 text-secondary">
                          {formatNumber(runway.length)}
                        </td>
                        <td className="px-4 py-2 text-secondary">
                          {runway.surface}
                        </td>
                        <td className="px-4 py-2">
                          <IlsBadge category={runway.ilsCategory} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppsSDKUIProvider>
    </McpUseProvider>
  );
}

export default AirportDetailContent;
