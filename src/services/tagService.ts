import { db } from '@/db';
import { tags, eventTags } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { TagInput } from '@/lib/validations/tag';
import { ResultSetHeader } from 'mysql2';

export const tagService = {
    async getAll() {
        return await db.query.tags.findMany({
            orderBy: [desc(tags.createdAt)],
        });
    },

    async getById(id: number) {
        return await db.query.tags.findFirst({
            where: eq(tags.id, id),
        });
    },

    async getByName(name: string) {
        return await db.query.tags.findFirst({
            where: eq(tags.name, name),
        });
    },

    // Get tags for a specific event
    async getTagsForEvent(eventId: number) {
        const eventTagRecords = await db.query.eventTags.findMany({
            where: eq(eventTags.eventId, eventId),
            with: {
                tag: true,
            },
        });
        return eventTagRecords.map(et => et.tag);
    },

    // Assign tags to an event
    async assignTagsToEvent(eventId: number, tagIds: number[]) {
        // First remove existing tags
        await db.delete(eventTags).where(eq(eventTags.eventId, eventId));

        // Add new tags
        if (tagIds.length > 0) {
            await db.insert(eventTags).values(
                tagIds.map(tagId => ({ eventId, tagId }))
            );
        }
    },

    async create(data: TagInput) {
        const [result] = await db.insert(tags).values(data) as unknown as [ResultSetHeader, unknown];
        const insertId = result.insertId;
        return await this.getById(insertId);
    },

    async update(id: number, data: Partial<TagInput>) {
        await db.update(tags).set(data).where(eq(tags.id, id));
        return await this.getById(id);
    },

    async delete(id: number) {
        // This will cascade delete event_tags due to foreign key constraint
        await db.delete(tags).where(eq(tags.id, id));
    }
};
