import { z } from 'zod';

export const tagSchema = z.object({
    name: z.string().min(1, "Tag name is required").max(100),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color hex").optional().default('#8b5cf6'),
});

export type TagInput = z.infer<typeof tagSchema>;
