export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { settingsService } from '@/services/settingsService';
import { z } from 'zod';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    const { key } = await params;

    try {
        const setting = await settingsService.getByKey(key);
        if (!setting) return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
        return NextResponse.json(setting);
    } catch (error) {
        console.error('Error fetching setting:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    const { key } = await params;

    try {
        const body = await request.json();
        const setting = await settingsService.upsert({
            key,
            value: body.value,
            description: body.description,
        });
        return NextResponse.json(setting);
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    const { key } = await params;

    try {
        await settingsService.delete(key);
        return NextResponse.json({ message: 'Setting deleted' });
    } catch (error) {
        console.error('Error deleting setting:', error);
        return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
    }
}
