export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { ticketSalesService } from '@/services/ticketSalesService';

// Get ticket sales stats for a specific event
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const eventId = parseInt(idStr);
    if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

    try {
        const stats = await ticketSalesService.getEventStats(eventId);
        const sales = await ticketSalesService.getSalesForEvent(eventId);

        return NextResponse.json({
            ...stats,
            recentSales: sales.slice(0, 10), // Last 10 sales
        });
    } catch (error) {
        console.error('Error fetching event stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Record a ticket sale
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const eventId = parseInt(idStr);
    if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

    try {
        const body = await request.json();

        const sale = await ticketSalesService.create({
            eventId,
            quantity: body.quantity,
            unitPrice: body.unitPrice,
            totalAmount: body.quantity * body.unitPrice,
            buyerEmail: body.buyerEmail,
        });

        return NextResponse.json(sale, { status: 201 });
    } catch (error) {
        console.error('Error recording sale:', error);
        return NextResponse.json({ error: 'Failed to record sale' }, { status: 500 });
    }
}
