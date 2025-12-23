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

  async create(data: ArtistInput) {
    const [result] = await db.insert(artists).values(data) as unknown as [ResultSetHeader, any];
    const insertId = result.insertId;
    return await db.query.artists.findFirst({
      where: eq(artists.id, insertId),
    });
  },
};
