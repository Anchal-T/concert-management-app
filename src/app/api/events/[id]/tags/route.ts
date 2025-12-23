export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tagService } from '@/services/tagService';

// Get tags for a specific event
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const eventId = parseInt(idStr);
    if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

    try {
        const tags = await tagService.getTagsForEvent(eventId);
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching event tags:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Assign tags to an event
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const eventId = parseInt(idStr);
    if (isNaN(eventId)) return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });

    try {
        const body = await request.json();
        const tagIds = body.tagIds || [];

        await tagService.assignTagsToEvent(eventId, tagIds);
        const tags = await tagService.getTagsForEvent(eventId);

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error updating event tags:', error);
        return NextResponse.json({ error: 'Failed to update event tags' }, { status: 500 });
    }
}
