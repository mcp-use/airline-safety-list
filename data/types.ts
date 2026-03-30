export interface FleetEntry {
  aircraftModel: string;
  count: number;
  averageAge: number;
}

export interface IncidentSummary {
  year: number;
  description: string;
  severity: "minor" | "serious" | "fatal";
}

export interface Airline {
  id: string;
  name: string;
  iataCode: string;
  icaoCode: string;
  country: string;
  region: string;
  safetyRating: number;
  iosaRegistered: boolean;
  founded: number;
  alliance: string | null;
  headquarters: string;
  fleetSize: number;
  destinations: number;
  annualPassengers: number;
  euBanStatus: "clear" | "restricted" | "banned";
  fatalities10yr: number;
  incidents10yr: number;
  safetyBreakdown: {
    fatalAccidents7yr: number;
    seriousIncidents: number;
    governmentAuditRating: string;
    operationalHistory: string;
  };
  fleetComposition: FleetEntry[];
  incidentHistory: IncidentSummary[];
}

export interface RunwayInfo {
  designation: string;
  length: number;
  surface: string;
  ilsCategory: string;
}

export interface Airport {
  id: string;
  name: string;
  iataCode: string;
  icaoCode: string;
  city: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  elevation: number;
  passengerVolume: number;
  runwayCount: number;
  terminals: number;
  annualOperations: number;
  safetyCertifications: string[];
  runways: RunwayInfo[];
}

export interface NotableIncident {
  date: string;
  location: string;
  description: string;
  airline: string;
}

export interface OperatorEntry {
  airline: string;
  count: number;
}

export interface AircraftModel {
  id: string;
  model: string;
  manufacturer: string;
  type: "narrow-body" | "wide-body" | "regional" | "turboprop";
  firstFlight: number;
  totalOrders: number;
  totalDeliveries: number;
  inServiceCount: number;
  safetyRecordScore: number;
  range: number;
  typicalCapacity: string;
  maxCapacity: number;
  engineType: string;
  engineCount: number;
  length: number;
  wingspan: number;
  accidentRate: number;
  totalAccidents: number;
  totalFatalities: number;
  notableIncidents: NotableIncident[];
  topOperators: OperatorEntry[];
}
