export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';

// Get current user for TopBar
export async function GET() {
    try {
        const currentUser = await userService.getCurrentUser();

        // If no user exists, return a default placeholder
        if (!currentUser) {
            return NextResponse.json({
                id: 0,
                name: 'Guest User',
                email: 'guest@example.com',
                role: 'user',
                imageUrl: null,
            });
        }

        return NextResponse.json(currentUser);
    } catch (error) {
        console.error('Failed to fetch current user:', error);
        return NextResponse.json({ error: 'Failed to fetch current user' }, { status: 500 });
    }
}
