import { db } from '@/db';
import { settings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { SettingInput } from '@/lib/validations/setting';
import { ResultSetHeader } from 'mysql2';

export const settingsService = {
    async getAll() {
        return await db.query.settings.findMany({
            orderBy: [desc(settings.updatedAt)],
        });
    },

    async getByKey(key: string) {
        return await db.query.settings.findFirst({
            where: eq(settings.key, key),
        });
    },

    async getValue(key: string, defaultValue: string = '') {
        const setting = await this.getByKey(key);
        return setting?.value ?? defaultValue;
    },

    async upsert(data: SettingInput) {
        const existing = await this.getByKey(data.key);

        if (existing) {
            await db.update(settings).set({
                value: data.value,
                description: data.description,
            }).where(eq(settings.key, data.key));
            return await this.getByKey(data.key);
        } else {
            const [result] = await db.insert(settings).values(data) as unknown as [ResultSetHeader, unknown];
            return await db.query.settings.findFirst({
                where: eq(settings.id, result.insertId),
            });
        }
    },

    async delete(key: string) {
        await db.delete(settings).where(eq(settings.key, key));
    },

    // Initialize default settings if they don't exist
    async initializeDefaults() {
        const defaults = [
            { key: 'app_name', value: 'Orchids Concert Hub', description: 'Application name' },
            { key: 'timezone', value: 'America/New_York', description: 'Default timezone' },
            { key: 'currency', value: 'USD', description: 'Default currency' },
            { key: 'ticket_warning_threshold', value: '100', description: 'Low ticket warning threshold' },
            { key: 'notifications_enabled', value: 'true', description: 'Enable email notifications' },
        ];

        for (const setting of defaults) {
            const existing = await this.getByKey(setting.key);
            if (!existing) {
                await db.insert(settings).values(setting);
            }
        }
    }
};
