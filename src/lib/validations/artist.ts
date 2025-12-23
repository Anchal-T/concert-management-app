import { z } from 'zod';

export const artistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  genre: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type ArtistInput = z.infer<typeof artistSchema>;
