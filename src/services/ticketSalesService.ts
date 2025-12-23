import { db } from '@/db';
import { ticketSales, events } from '@/db/schema';
import { eq, desc, sql, sum } from 'drizzle-orm';
import { ResultSetHeader } from 'mysql2';

interface TicketSaleInput {
    eventId: number;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    buyerEmail?: string;
}

export const ticketSalesService = {
    async getAll() {
        return await db.query.ticketSales.findMany({
            orderBy: [desc(ticketSales.soldAt)],
            with: {
                event: true,
            },
        });
    },

    async getById(id: number) {
        return await db.query.ticketSales.findFirst({
            where: eq(ticketSales.id, id),
            with: {
                event: true,
            },
        });
    },

    // Get all sales for a specific event
    async getSalesForEvent(eventId: number) {
        return await db.query.ticketSales.findMany({
            where: eq(ticketSales.eventId, eventId),
            orderBy: [desc(ticketSales.soldAt)],
        });
    },

    // Get aggregated stats for an event
    async getEventStats(eventId: number) {
        const result = await db.select({
            totalSold: sql<number>`COALESCE(SUM(${ticketSales.quantity}), 0)`,
            totalRevenue: sql<number>`COALESCE(SUM(${ticketSales.totalAmount}), 0)`,
            uniqueBuyers: sql<number>`COUNT(DISTINCT ${ticketSales.buyerEmail})`,
        }).from(ticketSales).where(eq(ticketSales.eventId, eventId));

        return {
            totalSold: Number(result[0]?.totalSold ?? 0),
            totalRevenue: Number(result[0]?.totalRevenue ?? 0),
            uniqueBuyers: Number(result[0]?.uniqueBuyers ?? 0),
        };
    },

    // Get stats for all events (for dashboard)
    async getAllEventsStats() {
        const result = await db.select({
            eventId: ticketSales.eventId,
            totalSold: sql<number>`COALESCE(SUM(${ticketSales.quantity}), 0)`,
            totalRevenue: sql<number>`COALESCE(SUM(${ticketSales.totalAmount}), 0)`,
        }).from(ticketSales).groupBy(ticketSales.eventId);

        return result.map(r => ({
            eventId: r.eventId,
            totalSold: Number(r.totalSold),
            totalRevenue: Number(r.totalRevenue),
        }));
    },

    async create(data: TicketSaleInput) {
        const [result] = await db.insert(ticketSales).values({
            eventId: data.eventId,
            quantity: data.quantity,
            unitPrice: String(data.unitPrice),
            totalAmount: String(data.totalAmount),
            buyerEmail: data.buyerEmail,
        }) as unknown as [ResultSetHeader, unknown];

        // Update the soldTickets count on the event
        await db.update(events)
            .set({
                soldTickets: sql`${events.soldTickets} + ${data.quantity}`,
            })
            .where(eq(events.id, data.eventId));

        const insertId = result.insertId;
        return await this.getById(insertId);
    },

    async delete(id: number) {
        const sale = await this.getById(id);
        if (sale) {
            // Decrement the soldTickets count
            await db.update(events)
                .set({
                    soldTickets: sql`${events.soldTickets} - ${sale.quantity}`,
                })
                .where(eq(events.id, sale.eventId));
        }
        await db.delete(ticketSales).where(eq(ticketSales.id, id));
    }
};
