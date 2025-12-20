import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

export async function GET() {
    try {
        const token = await getAccessToken();

        if (!token) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const payload = JSON.parse(atob(token.split('.')[1]));

        return NextResponse.json({
            id: payload.userId,
            username: payload.sub,
            roles: payload.roles || [],
            exp: payload.exp,
        });
    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json(
            { message: 'Invalid token' },
            { status: 401 }
        );
    }
}
