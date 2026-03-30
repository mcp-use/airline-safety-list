import { z } from "zod";

export const propsSchema = z.object({
  id: z.string(),
  name: z.string(),
  iataCode: z.string(),
  icaoCode: z.string(),
  country: z.string(),
  region: z.string(),
  safetyRating: z.number(),
  iosaRegistered: z.boolean(),
  founded: z.number(),
  alliance: z.string().nullable(),
  headquarters: z.string(),
  fleetSize: z.number(),
  destinations: z.number(),
  annualPassengers: z.number(),
  euBanStatus: z.enum(["clear", "restricted", "banned"]),
  fatalities10yr: z.number(),
  incidents10yr: z.number(),
  safetyBreakdown: z.object({
    fatalAccidents7yr: z.number(),
    seriousIncidents: z.number(),
    governmentAuditRating: z.string(),
    operationalHistory: z.string(),
  }),
  fleetComposition: z.array(z.object({
    aircraftModel: z.string(),
    count: z.number(),
    averageAge: z.number(),
  })),
  incidentHistory: z.array(z.object({
    year: z.number(),
    description: z.string(),
    severity: z.enum(["minor", "serious", "fatal"]),
  })),
});

export type AirlineDetailProps = z.infer<typeof propsSchema>;
