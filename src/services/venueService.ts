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

  async create(data: VenueInput) {
    const [result] = await db.insert(venues).values(data) as unknown as [ResultSetHeader, any]; //The type assertion 'as unknown as [ResultSetHeader, any]' is duplicated across venueService and artistService. Consider extracting this pattern into a shared utility function to reduce code duplication and improve maintainability. TODO


    const insertId = result.insertId;
    return await db.query.venues.findFirst({
      where: eq(venues.id, insertId),
    });
  },
};
