import { z } from "zod";

export const propsSchema = z.object({
  id: z.string(),
  name: z.string(),
  iataCode: z.string(),
  icaoCode: z.string(),
  city: z.string(),
  country: z.string(),
  region: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number(),
  passengerVolume: z.number(),
  runwayCount: z.number(),
  terminals: z.number(),
  annualOperations: z.number(),
  safetyCertifications: z.array(z.string()),
  runways: z.array(z.object({
    designation: z.string(),
    length: z.number(),
    surface: z.string(),
    ilsCategory: z.string(),
  })),
});

export type AirportDetailProps = z.infer<typeof propsSchema>;
