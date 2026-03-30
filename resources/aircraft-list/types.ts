import { z } from "zod";

export const aircraftSchema = z.object({
  id: z.string(),
  model: z.string(),
  manufacturer: z.string(),
  type: z.enum(["narrow-body", "wide-body", "regional", "turboprop"]),
  firstFlight: z.number(),
  totalDeliveries: z.number(),
  inServiceCount: z.number(),
  safetyRecordScore: z.number(),
  range: z.number(),
  typicalCapacity: z.string(),
});

export const propsSchema = z.object({
  aircraft: z.array(aircraftSchema),
});

export type AircraftListProps = z.infer<typeof propsSchema>;
export type AircraftSummary = z.infer<typeof aircraftSchema>;
