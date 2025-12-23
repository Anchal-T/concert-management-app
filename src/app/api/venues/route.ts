export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { venueService } from '@/services/venueService';
import { venueSchema } from '@/lib/validations/venue';
import { z } from 'zod';

export async function GET() {
  try {
    const venues = await venueService.getAll();
    return NextResponse.json(venues);
  } catch (error) {
    console.error('Failed to fetch venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = venueSchema.parse(body);
    const newVenue = await venueService.create(validatedData);
    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Failed to create venue:', error);
    return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
  }
}
