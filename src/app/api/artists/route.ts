export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { artistService } from '@/services/artistService';
import { artistSchema } from '@/lib/validations/artist';
import { z } from 'zod';

export async function GET() {
  try {
    const artists = await artistService.getAll();
    return NextResponse.json(artists);
  } catch (error) {
    console.error('Failed to fetch artists:', error);
    return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = artistSchema.parse(body);
    const newArtist = await artistService.create(validatedData);
    return NextResponse.json(newArtist, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Failed to create artist:', error);
    return NextResponse.json({ error: 'Failed to create artist' }, { status: 500 });
  }
}
