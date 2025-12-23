export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tagService } from '@/services/tagService';
import { tagSchema } from '@/lib/validations/tag';
import { z } from 'zod';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const tag = await tagService.getById(id);
        if (!tag) return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
        return NextResponse.json(tag);
    } catch (error) {
        console.error('Error fetching tag:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const body = await request.json();
        const validatedData = tagSchema.partial().parse(body);
        const updated = await tagService.update(id, validatedData);
        return NextResponse.json(updated);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Error updating tag:', error);
        return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        await tagService.delete(id);
        return NextResponse.json({ message: 'Tag deleted' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
    }
}
