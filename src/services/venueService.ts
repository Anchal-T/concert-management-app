import { db } from '@/db';
import { venues } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { VenueInput } from '@/lib/validations/venue';
import { ResultSetHeader } from 'mysql2';

export const venueService = {
  async getAll() {
    return await db.query.venues.findMany({
      orderBy: [desc(venues.createdAt)],
    });
  },

  async getById(id: number) {
    return await db.query.venues.findFirst({
      where: eq(venues.id, id),
    });
  },

  async create(data: VenueInput) {
    const [result] = await db.insert(venues).values(data) as unknown as [ResultSetHeader, any];
    const insertId = result.insertId;
    return await this.getById(insertId);
  },

  async update(id: number, data: Partial<VenueInput>) {
    await db.update(venues).set(data).where(eq(venues.id, id));
    return await this.getById(id);
  },

  async delete(id: number) {
    await db.delete(venues).where(eq(venues.id, id));
  }
};
