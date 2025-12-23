import { db } from '@/db';
import { events } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ResultSetHeader } from 'mysql2';
import { EventInput } from '@/lib/validations/event';

export const eventService = {
  async getAll() {
    return await db.query.events.findMany({
      orderBy: [desc(events.createdAt)],
      with: {
        artist: true,
        venue: true,
      },
    });
  },

  async getById(id: number) {
    return await db.query.events.findFirst({
      where: eq(events.id, id),
      with: {
        artist: true,
        venue: true,
      },
    });
  },

  async create(data: EventInput) {
    // Cast to any to handle driver-specific return types safely
    const [result] = await db.insert(events).values(data as any) as unknown as [ResultSetHeader, any];
    const insertId = result.insertId;
    
    const created = await this.getById(insertId);
    if (!created) throw new Error("Failed to create event");
    return created;
  },

  async update(id: number, data: Partial<EventInput>) {
    await db.update(events).set(data as any).where(eq(events.id, id));

    const updated = await this.getById(id);
    if (!updated) throw new Error("Failed to update event");
    const result = await db.delete(events).where(eq(events.id, id)) as unknown as ResultSetHeader;
    return result.affectedRows > 0;
  },

  async delete(id: number) {
    await db.delete(events).where(eq(events.id, id));
  },
};