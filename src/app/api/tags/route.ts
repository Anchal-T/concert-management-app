export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tagService } from '@/services/tagService';
import { tagSchema } from '@/lib/validations/tag';
import { z } from 'zod';

export async function GET() {
    try {
        const tags = await tagService.getAll();
        return NextResponse.json(tags);
    } catch (error) {
        console.error('Failed to fetch tags:', error);
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = tagSchema.parse(body);
        const newTag = await tagService.create(validatedData);
        return NextResponse.json(newTag, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to create tag:', error);
        return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }
}
