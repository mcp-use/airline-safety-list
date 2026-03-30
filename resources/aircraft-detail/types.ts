import { z } from "zod";

export const propsSchema = z.object({
  id: z.string(),
  model: z.string(),
  manufacturer: z.string(),
  type: z.enum(["narrow-body", "wide-body", "regional", "turboprop"]),
  firstFlight: z.number(),
  totalOrders: z.number(),
  totalDeliveries: z.number(),
  inServiceCount: z.number(),
  safetyRecordScore: z.number(),
  range: z.number(),
  typicalCapacity: z.string(),
  maxCapacity: z.number(),
  engineType: z.string(),
  engineCount: z.number(),
  length: z.number(),
  wingspan: z.number(),
  accidentRate: z.number(),
  totalAccidents: z.number(),
  totalFatalities: z.number(),
  notableIncidents: z.array(z.object({
    date: z.string(),
    location: z.string(),
    description: z.string(),
    airline: z.string(),
  })),
  topOperators: z.array(z.object({
    airline: z.string(),
    count: z.number(),
  })),
});

export type AircraftDetailProps = z.infer<typeof propsSchema>;
