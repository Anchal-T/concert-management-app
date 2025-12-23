import { db } from '@/db';
import { artists } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ArtistInput } from '@/lib/validations/artist';
import { ResultSetHeader } from 'mysql2';

export const artistService = {
  async getAll() {
    return await db.query.artists.findMany({
      orderBy: [desc(artists.createdAt)],
    });
  },

  async getById(id: number) {
    return await db.query.artists.findFirst({
      where: eq(artists.id, id),
    });
  },

  async create(data: ArtistInput) {
    const [result] = await db.insert(artists).values(data) as unknown as [ResultSetHeader, any];
    const insertId = result.insertId;
    return await this.getById(insertId);
  },

  async update(id: number, data: Partial<ArtistInput>) {
    await db.update(artists).set(data).where(eq(artists.id, id));
    return await this.getById(id);
  },

  async delete(id: number) {
    await db.delete(artists).where(eq(artists.id, id));
  }
};
