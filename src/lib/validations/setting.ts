import { z } from 'zod';

export const settingSchema = z.object({
    key: z.string().min(1, "Setting key is required").max(100),
    value: z.string().optional().nullable(),
    description: z.string().max(255).optional().nullable(),
});

export type SettingInput = z.infer<typeof settingSchema>;
