import { MCPServer, widget, text, error } from "mcp-use/server";
import { z } from "zod";
import { airlines } from "./data/airlines.js";
import { airports } from "./data/airports.js";
import { aircraft } from "./data/aircraft.js";

const server = new MCPServer({
  name: "aviation-safety-mcp",
  title: "Aviation Safety",
  version: "1.0.0",
  description:
    "Aviation safety information about airlines, airports, and aircraft models. Browse safety ratings, fleet data, airport certifications, and aircraft safety records.",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  websiteUrl: "https://mcp-use.com",
  icons: [
    {
      src: "icon.svg",
      mimeType: "image/svg+xml",
      sizes: ["512x512"],
    },
  ],
});

// ==================== AIRLINE TOOLS ====================

server.tool(
  {
    name: "list-airlines",
    description:
      "List airlines with safety ratings, IOSA audit status, fleet size, and alliance information. Optionally filter by region, minimum safety rating, alliance, or search term.",
    schema: z.object({
      region: z
        .string()
        .optional()
        .describe(
          "Filter by region: Europe, North America, Asia-Pacific, Middle East, Africa, Latin America"
        ),
      minRating: z
        .number()
        .optional()
        .describe("Minimum safety rating (1-7)"),
      alliance: z
        .string()
        .optional()
        .describe("Filter by alliance: Star Alliance, oneworld, SkyTeam"),
      search: z
        .string()
        .optional()
        .describe("Search airlines by name or IATA/ICAO code"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "airline-list",
      invoking: "Loading airlines...",
      invoked: "Airlines loaded",
    },
  },
  async ({ region, minRating, alliance, search }) => {
    let filtered = [...airlines];
    if (region)
      filtered = filtered.filter(
        (a) => a.region.toLowerCase() === region.toLowerCase()
      );
    if (minRating) filtered = filtered.filter((a) => a.safetyRating >= minRating);
    if (alliance)
      filtered = filtered.filter(
        (a) => a.alliance?.toLowerCase() === alliance.toLowerCase()
      );
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.iataCode.toLowerCase().includes(q) ||
          a.icaoCode.toLowerCase().includes(q)
      );
    }

    const top = filtered
      .filter((a) => a.safetyRating === 7)
      .slice(0, 5)
      .map((a) => a.name);

    return widget({
      props: { airlines: filtered },
      output: text(
        `Found ${filtered.length} airlines.${top.length > 0 ? ` Top rated (7-star): ${top.join(", ")}.` : ""} Ratings use a 1-7 star scale based on safety audits, incident history, fleet age, and operational standards.`
      ),
    });
  }
);

server.tool(
  {
    name: "get-airline-details",
    description:
      "Get comprehensive safety details for a specific airline including safety breakdown, fleet composition, and incident history.",
    schema: z.object({
      id: z.string().describe("Airline ID (e.g. 'qantas', 'emirates', 'delta')"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "airline-detail",
      invoking: "Loading airline details...",
      invoked: "Airline details loaded",
    },
  },
  async ({ id }) => {
    const airline = airlines.find((a) => a.id === id);
    if (!airline) {
      return error(
        `Airline not found: "${id}". Use list-airlines to browse available airlines.`
      );
    }

    const ratingLabel = ["", "Poor", "Poor", "Below Average", "Average", "Good", "Very Good", "Excellent"][airline.safetyRating];

    return widget({
      props: airline,
      output: text(
        `${airline.name} (${airline.iataCode}/${airline.icaoCode}) — ${ratingLabel} safety rating (${airline.safetyRating}/7 stars). ` +
          `Founded ${airline.founded}, headquartered in ${airline.headquarters}, ${airline.country}. ` +
          `Fleet: ${airline.fleetSize} aircraft, ${airline.destinations} destinations, ${airline.annualPassengers}M annual passengers. ` +
          `Alliance: ${airline.alliance ?? "Independent"}. IOSA registered: ${airline.iosaRegistered ? "Yes" : "No"}. ` +
          `EU status: ${airline.euBanStatus}. ` +
          `Last 10 years: ${airline.fatalities10yr} fatalities, ${airline.incidents10yr} incidents. ` +
          `Government audit: ${airline.safetyBreakdown.governmentAuditRating}, operational history: ${airline.safetyBreakdown.operationalHistory}.`
      ),
    });
  }
);

// ==================== AIRPORT TOOLS ====================

server.tool(
  {
    name: "list-airports",
    description:
      "List airports with passenger volumes, safety certifications, and runway information. Optionally filter by region, country, or search term.",
    schema: z.object({
      region: z
        .string()
        .optional()
        .describe(
          "Filter by region: Europe, North America, Asia-Pacific, Middle East, Africa, Latin America"
        ),
      country: z.string().optional().describe("Filter by country name"),
      search: z
        .string()
        .optional()
        .describe("Search airports by name, city, or IATA/ICAO code"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "airport-list",
      invoking: "Loading airports...",
      invoked: "Airports loaded",
    },
  },
  async ({ region, country, search }) => {
    let filtered = [...airports];
    if (region)
      filtered = filtered.filter(
        (a) => a.region.toLowerCase() === region.toLowerCase()
      );
    if (country)
      filtered = filtered.filter(
        (a) => a.country.toLowerCase() === country.toLowerCase()
      );
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.iataCode.toLowerCase().includes(q) ||
          a.icaoCode.toLowerCase().includes(q)
      );
    }

    const busiest = [...filtered]
      .sort((a, b) => b.passengerVolume - a.passengerVolume)
      .slice(0, 5)
      .map((a) => `${a.name} (${a.iataCode}): ${a.passengerVolume}M pax`);

    return widget({
      props: { airports: filtered },
      output: text(
        `Found ${filtered.length} airports. Busiest: ${busiest.join("; ")}.`
      ),
    });
  }
);

server.tool(
  {
    name: "get-airport-details",
    description:
      "Get comprehensive details for a specific airport including runway information, safety certifications, and operational statistics.",
    schema: z.object({
      id: z.string().describe("Airport ID (e.g. 'lhr', 'jfk', 'sin')"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "airport-detail",
      invoking: "Loading airport details...",
      invoked: "Airport details loaded",
    },
  },
  async ({ id }) => {
    const airport = airports.find((a) => a.id === id);
    if (!airport) {
      return error(
        `Airport not found: "${id}". Use list-airports to browse available airports.`
      );
    }

    return widget({
      props: airport,
      output: text(
        `${airport.name} (${airport.iataCode}/${airport.icaoCode}) — ${airport.city}, ${airport.country}. ` +
          `${airport.passengerVolume}M annual passengers, ${airport.annualOperations.toLocaleString()} operations/year. ` +
          `${airport.terminals} terminals, ${airport.runwayCount} runways. Elevation: ${airport.elevation} ft. ` +
          `Certifications: ${airport.safetyCertifications.join(", ")}. ` +
          `Runways: ${airport.runways.map((r) => `${r.designation} (${r.length}m, ${r.surface}, ${r.ilsCategory})`).join("; ")}.`
      ),
    });
  }
);

// ==================== AIRCRAFT TOOLS ====================

server.tool(
  {
    name: "list-aircraft",
    description:
      "List aircraft models with safety records, specifications, and delivery statistics. Optionally filter by manufacturer, type, or search term.",
    schema: z.object({
      manufacturer: z
        .string()
        .optional()
        .describe("Filter by manufacturer: Boeing, Airbus, Embraer, Bombardier, ATR, De Havilland, Comac"),
      type: z
        .string()
        .optional()
        .describe(
          "Filter by type: narrow-body, wide-body, regional, turboprop"
        ),
      search: z
        .string()
        .optional()
        .describe("Search aircraft by model name"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "aircraft-list",
      invoking: "Loading aircraft...",
      invoked: "Aircraft loaded",
    },
  },
  async ({ manufacturer, type, search }) => {
    let filtered = [...aircraft];
    if (manufacturer)
      filtered = filtered.filter(
        (a) => a.manufacturer.toLowerCase() === manufacturer.toLowerCase()
      );
    if (type)
      filtered = filtered.filter(
        (a) => a.type.toLowerCase() === type.toLowerCase()
      );
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a) => a.model.toLowerCase().includes(q));
    }

    const safest = [...filtered]
      .sort((a, b) => b.safetyRecordScore - a.safetyRecordScore)
      .slice(0, 5)
      .map((a) => `${a.model} (${a.safetyRecordScore}/100)`);

    return widget({
      props: { aircraft: filtered },
      output: text(
        `Found ${filtered.length} aircraft models. Highest safety scores: ${safest.join(", ")}.`
      ),
    });
  }
);

server.tool(
  {
    name: "get-aircraft-details",
    description:
      "Get comprehensive details for a specific aircraft model including specifications, safety record, notable incidents, and major operators.",
    schema: z.object({
      id: z
        .string()
        .describe("Aircraft ID (e.g. 'b737-800', 'a320neo', 'b787-9')"),
    }),
    annotations: { readOnlyHint: true },
    widget: {
      name: "aircraft-detail",
      invoking: "Loading aircraft details...",
      invoked: "Aircraft details loaded",
    },
  },
  async ({ id }) => {
    const ac = aircraft.find((a) => a.id === id);
    if (!ac) {
      return error(
        `Aircraft not found: "${id}". Use list-aircraft to browse available models.`
      );
    }

    return widget({
      props: ac,
      output: text(
        `${ac.model} by ${ac.manufacturer} — ${ac.type}, first flight ${ac.firstFlight}. ` +
          `Safety score: ${ac.safetyRecordScore}/100, accident rate: ${ac.accidentRate} per million departures. ` +
          `${ac.totalDeliveries} delivered, ${ac.inServiceCount} in service. ` +
          `Capacity: ${ac.typicalCapacity} (max ${ac.maxCapacity}). Range: ${ac.range} nm. ` +
          `Engines: ${ac.engineCount}x ${ac.engineType}. ` +
          `Dimensions: ${ac.length}m length, ${ac.wingspan}m wingspan. ` +
          `Total accidents: ${ac.totalAccidents}, total fatalities: ${ac.totalFatalities}. ` +
          `Top operators: ${ac.topOperators.slice(0, 5).map((o) => `${o.airline} (${o.count})`).join(", ")}.`
      ),
    });
  }
);

server.listen().then(() => {
  console.log("Aviation Safety MCP server running");
});
