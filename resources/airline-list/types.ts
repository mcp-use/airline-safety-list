import { z } from "zod";

export const airlineSchema = z.object({
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
});

export const propsSchema = z.object({
  airlines: z.array(airlineSchema),
});

export type AirlineListProps = z.infer<typeof propsSchema>;
export type AirlineSummary = z.infer<typeof airlineSchema>;
