export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';
import { userSchema } from '@/lib/validations/user';
import { z } from 'zod';

export async function GET() {
    try {
        const users = await userService.getAll();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = userSchema.parse(body);
        const newUser = await userService.create(validatedData);
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
