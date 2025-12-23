export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { eventService } from '@/services/eventService';
import { eventSchema } from '@/lib/validations/event';
import { z } from 'zod';

export async function GET() {
  try {
    const events = await eventService.getAll();
    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = eventSchema.parse(body);
    // We cast validatedData to the concrete create-input type because Zod types and Drizzle Insert types
    // might have minor mismatches (like Date vs string), but Drizzle handles Date objects correctly.
    type CreateEventInput = Parameters<(typeof eventService)['create']>[0];
    const newEvent = await eventService.create(validatedData as unknown as CreateEventInput);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
