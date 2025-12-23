import { z } from 'zod';

export const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(['admin', 'user', 'manager']).optional().default('user'),
    imageUrl: z.string().url().optional().nullable(),
    isActive: z.coerce.number().int().min(0).max(1).optional().default(1),
});

export type UserInput = z.infer<typeof userSchema>;
