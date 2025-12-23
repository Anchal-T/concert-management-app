import { z } from 'zod';

export const eventSchema = z.object({
  artistId: z.coerce.number().int().positive("Artist is required"),
  venueId: z.coerce.number().int().positive("Venue is required"),
  date: z.coerce.date({ required_error: "Date is required" }),
  // Time is often handled as part of date or separate string. 
  // The DB schema has 'date' as datetime.
  // The UI sends 'time' separately usually.
  
  price: z.coerce.number().nonnegative("Price cannot be negative"),
  status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).optional(),
  
  // Optional fields that might be passed or derived
  title: z.string().optional(),
  description: z.string().optional(),
  totalTickets: z.coerce.number().int().positive().optional(),
  availableTickets: z.coerce.number().int().nonnegative().optional(),
});

export type EventInput = z.infer<typeof eventSchema>;