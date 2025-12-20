import { NextResponse } from 'next/server';
import { clearAuthTokens } from '@/lib/auth';

export async function POST() {
    try {
        await clearAuthTokens();

        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
