import { z } from "zod";

export const airportSchema = z.object({
  id: z.string(),
  name: z.string(),
  iataCode: z.string(),
  icaoCode: z.string(),
  city: z.string(),
  country: z.string(),
  region: z.string(),
  passengerVolume: z.number(),
  runwayCount: z.number(),
  terminals: z.number(),
  safetyCertifications: z.array(z.string()),
});

export const propsSchema = z.object({
  airports: z.array(airportSchema),
});

export type AirportListProps = z.infer<typeof propsSchema>;
export type AirportSummary = z.infer<typeof airportSchema>;
