import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { UserInput } from '@/lib/validations/user';
import { ResultSetHeader } from 'mysql2';

export const userService = {
    async getAll() {
        return await db.query.users.findMany({
            orderBy: [desc(users.createdAt)],
        });
    },

    async getById(id: number) {
        return await db.query.users.findFirst({
            where: eq(users.id, id),
        });
    },

    async getByEmail(email: string) {
        return await db.query.users.findFirst({
            where: eq(users.email, email),
        });
    },

    // Get the current active user (first active admin/user for demo purposes)
    async getCurrentUser() {
        return await db.query.users.findFirst({
            where: eq(users.isActive, 1),
            orderBy: [desc(users.createdAt)],
        });
    },

    async create(data: UserInput) {
        const [result] = await db.insert(users).values(data) as unknown as [ResultSetHeader, unknown];
        const insertId = result.insertId;
        return await this.getById(insertId);
    },

    async update(id: number, data: Partial<UserInput>) {
        await db.update(users).set(data).where(eq(users.id, id));
        return await this.getById(id);
    },

    async delete(id: number) {
        await db.delete(users).where(eq(users.id, id));
    }
};
