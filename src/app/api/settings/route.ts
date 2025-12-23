export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { settingsService } from '@/services/settingsService';
import { settingSchema } from '@/lib/validations/setting';
import { z } from 'zod';

export async function GET() {
    try {
        const settings = await settingsService.getAll();
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = settingSchema.parse(body);
        const setting = await settingsService.upsert(validatedData);
        return NextResponse.json(setting, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to upsert setting:', error);
        return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
    }
}
