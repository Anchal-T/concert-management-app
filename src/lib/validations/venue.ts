import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  capacity: z.coerce.number().int().positive("Capacity must be positive"),
  address: z.string().optional(),
});

export type VenueInput = z.infer<typeof venueSchema>;
